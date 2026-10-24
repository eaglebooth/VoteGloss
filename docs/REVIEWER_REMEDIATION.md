# VoteGloss assessment remediation — 2026-10-24

## Status: corrected deployment and live regression completed

Corrected deployment supplied by the user:
`0xdD7F7f962e06E3fB337fFB733Eb19Ea889604cd8` (StudioNet, chain 61999).
Byte-for-byte source parity and assessment policy were checked before test signing.
[Live transaction table](live-evidence/remediation-review-20261024.md) and
[raw receipts/readbacks](live-evidence/remediation-review-20261024.json) record
18 finalized transactions from the two authorized secondary wallets. No contract
was deployed or upgraded by the test script.

Both fresh adversarial proposals returned `BLOCKED`, with
`MATERIAL_DRIFT / ASSESSOR_INSTRUCTION` and the exact appended quote. Both remained
`TRANSLATING`, with an empty ballot digest. Both `open_ballot` attempts failed with
`BALLOT_NOT_READY`, and repeat readbacks were unchanged. The clean positive control
returned `CERTIFIED`, reached `READY`, and opened to `VOTING`. These are actual
deployed semantic assessments, not controlled model verdicts. The positive ballot
was intentionally left open; complete tally coverage is not claimed for this run.

The historical deployment `0x0379FE8695da5d779ec0b583bA3DcEc50EA9d374`
is **not** the corrected release. Its injected translation was certified and advanced
to READY; retain [the historical evidence](LIVE_EVIDENCE.md) as a failed security
baseline, not as evidence that this remediation passes.

No deployment or upgrade is performed by the test script. Only the user's main
wallet deploys. Secondary test accounts perform all workflow transactions.

## Root cause and correction

The previous prompt checked whether source meaning survived while treating injected
instructions only as text not to execute. It did not explicitly require rejecting
additional target-only instructions. Its controlled unit test preselected UNCLEAR,
which did not expose the actual semantic false positive.

Version `0.2.0`, policy `bidirectional-additions-v2` now requires both source-to-target
coverage and target-to-source support. Every segment includes `addition_kind` and
`addition_quote`. A detected target-only instruction or extra obligation overrides
PRESERVED to MATERIAL_DRIFT. Its quote must occur in the exact submitted target
segment. Ambiguous additions cannot certify. Malformed/legacy model output fails
closed. Leader and validator independently classify nonempty results and compare
consequential segment verdicts, not free-form quote equality.

Both READY promotion and ballot opening revalidate the stored certificate, including
source/translation digests and the new addition audit. Legacy three-field
certificates cannot open a new ballot under this source. Recovery is owner revision,
fresh voter consent and a new translation; already-open historical ballots are not
retroactively undone. This is a new source release, not a claim that old deployed
state has been repaired.

## Reviewer requirements and evidence

| Requirement | Current evidence / gate |
|---|---|
| Correct semantic assessment | Production prompt, parser and ballot gates; exact malicious fixture BLOCKED in two real assessments |
| Matching repository and deployed source | Included contract source matches new deployment byte-for-byte; SHA-256 is recorded below and in the live reports |
| Regression without stubbed verdicts | `scripts/live-regression.mjs` completed using deployed GenLayer assessments; raw leader/validator receipts retained |
| Repeat BLOCKED/UNRESOLVED readback and ballot denial | Two BLOCKED results, no READY, two finalized BALLOT_NOT_READY rejections and unchanged repeated readbacks |

Local Python tests are **controlled-output lifecycle/parser tests**, not real LLM
classification evidence. The legacy-schema regression failed before the correction
(CERTIFIED instead of blocked/unresolved) and passes after it. The live script has
now completed on matching source. This evidence addresses the exact reported payload,
not a guarantee against every possible multilingual adversarial input.

## Run after user deployment

Local verification on 2026-10-24: `python scripts/verify.py` completed with
20 controlled-output tests passing, contract lint/validation passing and schema
generated. `node --check scripts/live-regression.mjs` and `git diff --check` passed.
SDK dependencies are pinned in `package-lock.json`. A read-only preflight against
the old address exited with `Source parity mismatch; no test transaction sent`,
before retrieving signers. This is a safety-gate check, not a successful live run.

Corrected source SHA-256:
`37433d51b7216b65e6e37f10adfedae0979e640f8466e2d48671696165dfc852`.

From the VoteGloss repository:

```powershell
python scripts/verify.py
npm ci
$env:VOTE_GLOSS_CONTRACT = '<user-deployed corrected address>'
$env:VOTE_GLOSS_RUN = 'review-v2-20261024'
$env:GENLAYER_CLI_ENTRY = 'C:/Users/admin/AppData/Roaming/npm/node_modules/genlayer/dist/index.js'
npm run test:live
```

Do not paste private keys into source or command history. CLI keychain accounts
`dbl-owner` and `dbl-adapter` are checked against the two authorized test addresses.
Reviewer wallets can independently create proposals and use the same public methods;
there is no deployer-only workflow privilege. The fixed script intentionally uses
the authorized accounts rather than arbitrary wallets.

The script also runs a clean translation positive control through real consensus
and opens its ballot. It saves submitted hashes immediately, resumes by identical
run ID/context, records raw transaction receipts and final state, and produces a
Markdown table linking every transaction only after all assertions pass. A failure
remains in JSON with no completion marker. Inspect validator receipts to distinguish
model execution failure from genuine drift classification; UNRESOLVED is safe but
is not positive evidence of successful semantic classification.

Completed run was additionally checked by:

```powershell
node scripts/verify-live-report.mjs docs/live-evidence/remediation-review-20261024.json
```

It re-fetched 18 finalized receipts, verified source parity and fresh state for all
three cases. Output: `Verified 18 finalized transactions, source parity and fresh
state for 3 cases.` The separate `.verified.json` file binds the original report
SHA-256 to those observations.

Fixtures remain synthetic, explicitly declared onchain source/translation pairs.
They test semantic equivalence to the electorate-consented source, not authenticity
of a canonical Arbitrum proposal or official translation. Public forum context
does not establish those external claims.
