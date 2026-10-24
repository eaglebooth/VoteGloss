// Real StudioNet calls only. Never deploys and never supplies model verdicts.
import {createClient, createAccount} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {isDeepStrictEqual} from 'node:util';

const contract = process.env.VOTE_GLOSS_CONTRACT;
if (!/^0x[0-9a-fA-F]{40}$/.test(contract || '')) throw Error('Set VOTE_GLOSS_CONTRACT to the user-deployed corrected contract');
const run = process.env.VOTE_GLOSS_RUN || new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
if (!/^[a-zA-Z0-9_-]{1,20}$/.test(run)) throw Error('Invalid run identifier');
const sha = x => createHash('sha256').update(x).digest('hex');
const source = readFileSync('contracts/vote_gloss.py');
const publicClient = createClient({chain:studionet});
const remote = Buffer.from(await publicClient.getContractCode(contract), 'utf8');
if (!source.equals(remote)) throw Error('Source parity mismatch; no test transaction sent');
const read = async (method, args = []) => JSON.parse(String(await publicClient.readContract({address:contract, functionName:method, args, transactionHashVariant:'latest-final'})));
const version = await read('get_version');
if (version.version !== '0.2.0' || version.assessment_policy !== 'bidirectional-additions-v2') throw Error('Wrong assessment policy; no test transaction sent');

// Retrieve authorized secondary accounts from the existing CLI keychain.
// Alternatively set TEST_KEY_A / TEST_KEY_B privately in the process environment.
let keys = [process.env.TEST_KEY_A, process.env.TEST_KEY_B];
if (!keys.every(Boolean)) {
  const cliEntry = process.env.GENLAYER_CLI_ENTRY;
  if (!cliEntry) throw Error('Set GENLAYER_CLI_ENTRY for OS-keychain test accounts, or provide TEST_KEY_A/B privately');
  const keytar = createRequire(cliEntry)('keytar');
  keys = await Promise.all(['dbl-owner', 'dbl-adapter'].map(name => keytar.getPassword('genlayer-cli', `account:${name}`)));
}
if (!keys.every(Boolean)) throw Error('Missing authorized test signers');
const actors = keys.map(k => createAccount(k.startsWith('0x') ? k : `0x${k}`));
const expected = ['0xeb57bc7125fa60d7482ce12058397369ab3581f8','0x2da5393d7bbb9a037dc3abb56dbbc5c150fc843f'];
if (!actors.every((a,i) => a.address.toLowerCase() === expected[i])) throw Error('Use the two authorized test wallets, never the deployer');
const clients = actors.map(account => createClient({chain:studionet, account}));
const fixtureDir = 'tests/fixtures/proposal_sets/arbitrum-aip1-adapted/';
const input = JSON.parse(readFileSync(fixtureDir + 'source.json'));
const fixtures = ['translation-es-prompt-injection.json','translation-es-prompt-injection.json','translation-es-valid.json'].map(name => ({name, bytes:readFileSync(fixtureDir + name)}));
const context = {contract, chain_id:studionet.id, source_sha256:sha(source), actors:actors.map(a => a.address), fixtures:fixtures.map(f => ({name:f.name, sha256:sha(f.bytes)})), input_sha256:sha(JSON.stringify(input))};
mkdirSync('docs/live-evidence', {recursive:true});
const path = `docs/live-evidence/remediation-${run}.json`;
const report = existsSync(path) ? JSON.parse(readFileSync(path)) : {context, version, started_at:new Date().toISOString(), signing:'SDK, authorized secondary wallets', model:'Deployed GenLayer leader/validator exec_prompt; no stubbed verdicts', steps:[], cases:{}};
if (!isDeepStrictEqual(report.context, context)) throw Error('Resume context mismatch');
const save = () => writeFileSync(path, JSON.stringify(report, (_,v) => typeof v === 'bigint' ? v.toString() : v, 2) + '\n');
const assert = (ok, message) => {if (!ok) throw Error(message)};
const list = x => Array.isArray(x) ? x : Object.values(x || {});
async function send(label, actor, method, args, expectedError) {
  let step = report.steps.find(s => s.label === label);
  if (step) assert(isDeepStrictEqual([step.actor,step.method,step.args,step.expected_error],[actor,method,args,expectedError || null]), 'Resume step input mismatch');
  else {step = {label,actor,method,args,expected_error:expectedError || null}; report.steps.push(step); save()}
  if (!step.hash) {
    const raw = await clients[actor].writeContract({address:contract,functionName:method,args,value:0n});
    step.hash = typeof raw === 'string' ? raw : raw.txId;
    assert(/^0x[0-9a-fA-F]{64}$/.test(step.hash), 'Invalid transaction hash'); save();
  }
  console.log(`${label}: ${step.hash}`);
  await publicClient.waitForTransactionReceipt({hash:step.hash,status:'FINALIZED',interval:2500,retries:240});
  const tx = await publicClient.getTransaction({hash:step.hash});
  step.transaction = tx;
  step.explorer = `https://explorer-studio.genlayer.com/transactions/${step.hash}`;
  save();
  const leaders = list(tx.consensus_data?.leader_receipt);
  const leader = leaders.find(x => x.mode === 'leader') || leaders[0];
  assert(tx.from_address?.toLowerCase() === actors[actor].address.toLowerCase(), 'Transaction sender mismatch');
  assert(tx.to_address?.toLowerCase() === contract.toLowerCase(), 'Transaction target mismatch');
  assert(tx.statusName === 'FINALIZED' && tx.result_name === 'MAJORITY_AGREE', `${label}: no finalized majority agreement`);
  const execution = leader?.genvm_result?.error_code ? 'ERROR' : leader?.execution_result || tx.txExecutionResultName;
  assert(execution === (expectedError ? 'ERROR' : 'SUCCESS'), `${label}: unexpected execution ${execution}`);
  if (expectedError) assert(leader?.result?.payload === expectedError, `${label}: wrong rejection`);
}
save();
try {
  for (const [index, f] of fixtures.entries()) {
    const name = ['injection','injection-repeat','clean'][index];
    const localId = `v2-${name}-${run}`;
    await send(`${name}-create`,0,'create_proposal',[localId,input.source_language,JSON.stringify(input.source_segments),JSON.stringify(input.required_locales),JSON.stringify(input.glossary),JSON.stringify(actors.map(a => a.address)),2]);
    // Runner address string serialization may omit 0x; discover only by actual readback.
    let id = report.cases[name]?.proposal_id;
    if (!id) {
      for (const owner of [actors[0].address.toLowerCase(), actors[0].address.toLowerCase().slice(2)]) {
        const candidate = `${owner}:${localId}`;
        try {const p = await read('get_proposal',[candidate]); if (p.local_id === localId) {id = candidate; break}} catch {}
      }
    }
    assert(id, 'Created proposal cannot be read');
    const record = report.cases[name] ||= {proposal_id:id,fixture:f.name}; save();
    const proposal = await read('get_proposal',[id]);
    await send(`${name}-consent-a`,0,'accept_manifest',[id,1,proposal.manifest_digest]);
    await send(`${name}-consent-b`,1,'accept_manifest',[id,1,proposal.manifest_digest]);
    await send(`${name}-submit`,1,'submit_translation',[id,'es',1,f.bytes.toString('utf8')]);
    await send(`${name}-assess`,1,'assess_translation',[id,'es',1,1]);
    record.translation = await read('get_translation',[id,'es',1,1]);
    record.proposal = await read('get_proposal',[id]); save();
    assert(record.translation.failure_codes.length === 0, 'Semantic regression accidentally stopped at deterministic checks');
    if (name !== 'clean') {
      assert(['BLOCKED','UNRESOLVED'].includes(record.translation.state), 'SECURITY FAILURE: adversarial translation certified');
      assert(record.proposal.state === 'TRANSLATING' && record.proposal.ballot_digest === '', 'SECURITY FAILURE: adversarial proposal advanced');
      await send(`${name}-open-denied`,0,'open_ballot',[id,1],'BALLOT_NOT_READY');
      record.repeat_translation = await read('get_translation',[id,'es',1,1]);
      record.repeat_proposal = await read('get_proposal',[id]); save();
      assert(isDeepStrictEqual(record.translation,record.repeat_translation) && isDeepStrictEqual(record.proposal,record.repeat_proposal), 'Rejected ballot changed state');
    } else {
      assert(record.translation.state === 'CERTIFIED' && record.proposal.state === 'READY', 'Clean translation failed real semantic positive control');
      await send(`${name}-open`,0,'open_ballot',[id,1]);
      record.opened = await read('get_proposal',[id]); save();
      assert(record.opened.state === 'VOTING' && Boolean(record.opened.ballot_digest), 'Clean ballot did not open');
    }
  }
  report.completed_at = new Date().toISOString(); delete report.error; save();
  const links = report.steps.map(s => `| ${s.label} | [transaction](${s.explorer}) | ${s.transaction?.statusName} | ${s.transaction?.result_name} |`).join('\n');
  writeFileSync(`docs/live-evidence/remediation-${run}.md`, `# VoteGloss corrected live regression\n\nContract: ${contract}\n\nSource SHA-256: ${context.source_sha256}\n\n| Step | Explorer | Status | Consensus |\n|---|---|---|---|\n${links}\n\nRaw receipts and repeated state readbacks: [JSON](remediation-${run}.json).\n`);
  console.log(`PASS: ${path}`);
} catch (error) {report.error = String(error.stack || error); delete report.completed_at; save(); console.error(report.error); process.exitCode = 1}
