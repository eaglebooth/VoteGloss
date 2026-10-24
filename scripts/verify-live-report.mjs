// Independent read-only verification of saved regression receipts and current state.
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
const path = process.argv[2];
if (!path || !/^docs\/live-evidence\/remediation-[\w-]+\.json$/.test(path)) throw Error('Supply a local regression JSON path');
const report = JSON.parse(readFileSync(path));
if (!report.completed_at || report.error) throw Error('Regression has not passed');
const client = createClient({chain:studionet});
const contract = report.context.contract;
const code = Buffer.from(await client.getContractCode(contract),'utf8');
const local = readFileSync('contracts/vote_gloss.py');
const hash = x => createHash('sha256').update(x).digest('hex');
const check = (ok,message) => {if (!ok) throw Error(message)};
check(code.equals(local) && hash(code) === report.context.source_sha256,'Current source parity mismatch');
const read = async (functionName,args) => JSON.parse(String(await client.readContract({address:contract,functionName,args,transactionHashVariant:'latest-final'})));
const results = {verified_at:new Date().toISOString(),contract,source_sha256:hash(code),report_sha256:hash(readFileSync(path)),transactions:[],cases:{}};
for (const saved of report.steps) {
  const tx = await client.getTransaction({hash:saved.hash});
  const receipts = Array.isArray(tx.consensus_data?.leader_receipt) ? tx.consensus_data.leader_receipt : Object.values(tx.consensus_data?.leader_receipt || {});
  const leader = receipts.find(x => x.mode === 'leader') || receipts[0];
  const execution = leader?.genvm_result?.error_code ? 'ERROR' : leader?.execution_result || tx.txExecutionResultName;
  check(tx.statusName === 'FINALIZED' && tx.result_name === 'MAJORITY_AGREE',`${saved.label}: finality/consensus`);
  check(tx.from_address?.toLowerCase() === report.context.actors[saved.actor].toLowerCase() && tx.to_address?.toLowerCase() === contract.toLowerCase(),`${saved.label}: sender/target`);
  check(execution === (saved.expected_error ? 'ERROR' : 'SUCCESS'),`${saved.label}: execution`);
  if (saved.expected_error) check(leader?.result?.payload === saved.expected_error,`${saved.label}: rejection`);
  if (saved.method === 'assess_translation') {
    check(Boolean(leader?.eq_outputs) || Boolean(leader?.execution_stats?.llm),`${saved.label}: missing semantic execution evidence`);
  }
  results.transactions.push({label:saved.label,hash:saved.hash,status:tx.statusName,consensus:tx.result_name,execution});
}
for (const [name,saved] of Object.entries(report.cases)) {
  const proposal = await read('get_proposal',[saved.proposal_id]);
  const translation = await read('get_translation',[saved.proposal_id,'es',1,1]);
  check(isDeepStrictEqual(translation,saved.translation),`${name}: translation changed`);
  check(isDeepStrictEqual(proposal,name === 'clean' ? saved.opened : saved.repeat_proposal),`${name}: proposal changed`);
  if (name !== 'clean') check(translation.state === 'BLOCKED' && translation.verdicts.some(x => x.addition_kind === 'ASSESSOR_INSTRUCTION' && x.verdict === 'MATERIAL_DRIFT') && proposal.state === 'TRANSLATING' && !proposal.ballot_digest,`${name}: adversarial gate`);
  else check(translation.state === 'CERTIFIED' && proposal.state === 'VOTING' && Boolean(proposal.ballot_digest),'Clean positive control');
  results.cases[name] = {proposal,translation};
}
writeFileSync(path.replace(/\.json$/,'.verified.json'),JSON.stringify(results,null,2)+'\n');
console.log(`Verified ${results.transactions.length} finalized transactions, source parity and fresh state for ${Object.keys(results.cases).length} cases.`);
