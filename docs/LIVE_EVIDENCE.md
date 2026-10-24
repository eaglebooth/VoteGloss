# VoteGloss live evidence

> Historical release evidence (2026-10-19), including the injection security failure.
> This source-parity statement applies only to the original release, not the current
> corrected source. See [remediation status](REVIEWER_REMEDIATION.md). Do not reuse
> these transactions as evidence that version 0.2.0 has passed live regression.

## Deployment identity and source parity

- Contract: `0x0379FE8695da5d779ec0b583bA3DcEc50EA9d374`
- Network: GenLayer Studionet (chain ID `61999`)
- Read endpoint: `https://studio.genlayer.com/api`
- Read method: `gen_getContractCode` for the address above; base64 response decoded as UTF-8.
- Verification date: 2026-10-19
- Deployed source length: `26,161` bytes
- Deployed source SHA-256: `AF126401170A4EF182542CA84D1677325477B2040171C8675FDBE38889F7B7B0`
- Repository source: `contracts/vote_gloss.py`
- Repository source SHA-256: `AF126401170A4EF182542CA84D1677325477B2040171C8675FDBE38889F7B7B0`
- Result: the decoded RPC source and repository file have matching byte length and SHA-256; the returned code identifies `class VoteGloss` and the pinned v0.2.16 header.

This establishes source parity for the code currently returned by Studionet. It is a
read-only RPC observation, not a deployment transaction receipt. The deployment
transaction hash has not been captured in this evidence set.

## Live transaction tests

Executed 2026-10-19 on Studionet using two independent test wallets (A/B), separate
from the deployment wallet. Each linked transaction was submitted live. RPC returned
`ACCEPTED` / `MAJORITY_AGREE`; this is transaction-consensus status, not proof that
the requested application transition succeeded. Outcomes below are based on
post-transaction contract readbacks. Explorer links use the verified Studionet route.

### Happy path and duplicate-vote conflict

Proposal: `eb57bc7125fa60d7482ce12058397369ab3581f8:vg-20261019-happy-01`.

| Action | Sender | Live transaction | Verified result |
|---|---|---|---|
| Create proposal | A | [0x5b3647d379265c71e45fbfaad573bd992ac40e1b0e1bbc69556b8b12c879b2e5](https://explorer-studio.genlayer.com/tx/0x5b3647d379265c71e45fbfaad573bd992ac40e1b0e1bbc69556b8b12c879b2e5) | Proposal created |
| Accept revision | A | [0xd09d4b3aac4917537faf4baf9c82ba0d43c656f998449364abebdf251e2f57a5](https://explorer-studio.genlayer.com/tx/0xd09d4b3aac4917537faf4baf9c82ba0d43c656f998449364abebdf251e2f57a5) | Consent recorded |
| Accept revision | B | [0xe83f1cba51f0bb5c6489b5eb5f1e27de9723bafe42e914b6ada0009fa808e69f](https://explorer-studio.genlayer.com/tx/0xe83f1cba51f0bb5c6489b5eb5f1e27de9723bafe42e914b6ada0009fa808e69f) | Proposal entered `TRANSLATING` |
| Owner attempts translator-only action | A | [0x93e2d3e2db189e3cc8f64688ceaec1373488c3c2454c20ce75097a919b42ad47](https://explorer-studio.genlayer.com/tx/0x93e2d3e2db189e3cc8f64688ceaec1373488c3c2454c20ce75097a919b42ad47) | No translation readable; proposal remained `TRANSLATING` (unauthorized role did not advance state) |
| Submit translation | B | [0xe3d7ee5bcaffb6bd11e0ba95def7fb8a5b4b82ac5b94c879471163c1380142c8](https://explorer-studio.genlayer.com/tx/0xe3d7ee5bcaffb6bd11e0ba95def7fb8a5b4b82ac5b94c879471163c1380142c8) | Translation submitted |
| Semantic assessment | Consensus | [0x561f402a227bf7259779c5fcdcc67eacc204f792b475d1852b589b4c10c01367](https://explorer-studio.genlayer.com/tx/0x561f402a227bf7259779c5fcdcc67eacc204f792b475d1852b589b4c10c01367) | `CERTIFIED`; both segments `PRESERVED/NONE`; proposal `READY` |
| Open ballot | A | [0x3e5c26835369ec968a2243e0d7cdd997b72652142700d99c61316a05d91d8bab](https://explorer-studio.genlayer.com/tx/0x3e5c26835369ec968a2243e0d7cdd997b72652142700d99c61316a05d91d8bab) | `VOTING`; ballot digest `9aece76675dca918bde26ff89e5df3b3d65cee4fdfccea63855e71f3104efbb4` |
| Vote YES | A | [0xffe19c025b5abbb354c49009791a6e43b2c01d2da900e270ca71729bdaa78d77](https://explorer-studio.genlayer.com/tx/0xffe19c025b5abbb354c49009791a6e43b2c01d2da900e270ca71729bdaa78d77) | First vote recorded |
| Duplicate YES vote | A | [0x63e8fc761ba178818014e9319c9b9490dee83ab2ad88b3f92a730505a0d5677e](https://explorer-studio.genlayer.com/tx/0x63e8fc761ba178818014e9319c9b9490dee83ab2ad88b3f92a730505a0d5677e) | Did not create an additional counted vote; final unique count below |
| Vote YES | B | [0xe229bfb57a451d66c4bf7f86fada71aee69d1315ddd7c4cf4ee9ce67e9e3f8db](https://explorer-studio.genlayer.com/tx/0xe229bfb57a451d66c4bf7f86fada71aee69d1315ddd7c4cf4ee9ce67e9e3f8db) | Final readback `PASSED`, YES=2, NO=0, ABSTAIN=0, votes=2 |

### Failure, retry/recovery, and conflicting ballot

Proposal: `eb57bc7125fa60d7482ce12058397369ab3581f8:vg-20261019-failure-01`.

| Action | Sender | Live transaction | Verified result |
|---|---|---|---|
| Create proposal | A | [0x33fa1289afea6a953c8691580c96d1c428f1ce96da485df1782bcc2748c2591a](https://explorer-studio.genlayer.com/tx/0x33fa1289afea6a953c8691580c96d1c428f1ce96da485df1782bcc2748c2591a) | Proposal created |
| Stale-revision consent attempt | B | [0x73b44747614ee0332b92ec4f5c7d09cdc5e205a592df41691310cb40fd906bd2](https://explorer-studio.genlayer.com/tx/0x73b44747614ee0332b92ec4f5c7d09cdc5e205a592df41691310cb40fd906bd2) | No state transition; only valid current-revision consents progressed |
| Accept current revision | A | [0xe9c86e49c73ef5ac12f042f1a6f67ad51d45150ccef5f056f06d79753a3c5af1](https://explorer-studio.genlayer.com/tx/0xe9c86e49c73ef5ac12f042f1a6f67ad51d45150ccef5f056f06d79753a3c5af1) | Consent recorded |
| Replay consent | A | [0x7394ce099ead86eb75b3b61b5593b7b3280401a5912affc033506cfc3b072cd2](https://explorer-studio.genlayer.com/tx/0x7394ce099ead86eb75b3b61b5593b7b3280401a5912affc033506cfc3b072cd2) | Did not increment consent count |
| Accept current revision | B | [0x53a938f0d571ba7badb28eef725c653b2fb06439f3f5a8aab024b944a21da721](https://explorer-studio.genlayer.com/tx/0x53a938f0d571ba7badb28eef725c653b2fb06439f3f5a8aab024b944a21da721) | Exactly two valid consents; proposal `TRANSLATING` |
| Submit translation missing required number | B | [0x775bddc2f7d23ec43adde2d317994437991dbfe48d1cb1764e12f7dfac1c6842](https://explorer-studio.genlayer.com/tx/0x775bddc2f7d23ec43adde2d317994437991dbfe48d1cb1764e12f7dfac1c6842) | Fault-injection input submitted |
| Assess invalid translation | Consensus | [0x3a1260e89e88f8d36d3170a5b2f60e043d0ddd80fcacb7e07d6b9293d675464d](https://explorer-studio.genlayer.com/tx/0x3a1260e89e88f8d36d3170a5b2f60e043d0ddd80fcacb7e07d6b9293d675464d) | `BLOCKED`; `CRITICAL_TOKEN_MISSING:10,000` |
| Attempt ballot while blocked | A | [0xfd7715a40452b9004b694dfc4beaff7b859de486fa8dc79e931cf7cf044ca479](https://explorer-studio.genlayer.com/tx/0xfd7715a40452b9004b694dfc4beaff7b859de486fa8dc79e931cf7cf044ca479) | Remained `TRANSLATING`; ballot digest empty |
| Retry with corrected translation (attempt 2) | B | [0x7aa457d3339965eec543ce05d0bb8002e3da92e11fbafde581a28e74a572e0ee](https://explorer-studio.genlayer.com/tx/0x7aa457d3339965eec543ce05d0bb8002e3da92e11fbafde581a28e74a572e0ee) | Retry accepted |
| Assess corrected attempt | Consensus | [0xf6c665907b8505a1821936f1fdc0cec33cf31f0d8c5eed92598dddaa55204b5a](https://explorer-studio.genlayer.com/tx/0xf6c665907b8505a1821936f1fdc0cec33cf31f0d8c5eed92598dddaa55204b5a) | Attempt 2 `CERTIFIED`, both segments `PRESERVED`, proposal `READY` |
| Open ballot | A | [0x8019f883eed43ccc91aa066394f0eabf2b0e28768c0ae99c62b1360cb171da46](https://explorer-studio.genlayer.com/tx/0x8019f883eed43ccc91aa066394f0eabf2b0e28768c0ae99c62b1360cb171da46) | Ballot opened after valid recovery |
| Vote NO | A | [0xd24a5f60bbf70416a7c3480335e61acd5876624226967dbd328190ed9f28c5b1](https://explorer-studio.genlayer.com/tx/0xd24a5f60bbf70416a7c3480335e61acd5876624226967dbd328190ed9f28c5b1) | NO recorded |
| Vote YES | B | [0x592fae8e8cc44004accf89eb7d61636351af77cadb8bd6dbe4fdbe53207e7a86](https://explorer-studio.genlayer.com/tx/0x592fae8e8cc44004accf89eb7d61636351af77cadb8bd6dbe4fdbe53207e7a86) | Final `REJECTED`, YES=1, NO=1, ABSTAIN=0, votes=2 |

### Adversarial audits

| Audit | Proposal | Key live transactions | Post-assessment readback |
|---|---|---|---|
| Negation reversal | `...:vg-20261019-audit-negation` | [create](https://explorer-studio.genlayer.com/tx/0xd31cd83c01a114ae9b22cabc67785cb426a012ed5ebd0551bb203b041638fdfd), [A consent](https://explorer-studio.genlayer.com/tx/0xe6cccca5dd1dabbb4198dca158b24e3d05de618310d06721b2279ab8769f6c7b), [B consent](https://explorer-studio.genlayer.com/tx/0x146d4899861b6804e4e5d38bc3789daa340f0ef7f419dab54aadc30fea580f38), [submit reversed negation](https://explorer-studio.genlayer.com/tx/0x1ac13de51883cc9b10d09fe768e40e869c36f661dbc1fdc03ba8584e2b1c412a), [assess](https://explorer-studio.genlayer.com/tx/0x9df5f2a672a1d510f3ad0e97ad62a77b21eee928df5eed6d494da31aa6cf538e) | `BLOCKED`; `MATERIAL_DRIFT/CONTRADICTION`; allocation preserved; proposal stayed `TRANSLATING` |
| Prompt injection / appended instruction | `...:vg-20261019-audit-injection` | [create](https://explorer-studio.genlayer.com/tx/0x95ab68af52d905b0057a0fcfb22d44e4c25c3dfe7f73ccaf381e9b2a474a0a82), [A consent](https://explorer-studio.genlayer.com/tx/0x6e492b63cb66b98875f5740dc43c2bb40d44fac9650fc1d7bc6d4f30495bb7a7), [B consent](https://explorer-studio.genlayer.com/tx/0xb286f81c82be835248070f1284337e8698f0d9509ec465fcd5786fddbfb935de), [submit injected translation](https://explorer-studio.genlayer.com/tx/0xc04a4eee8f8094da3538d40465796b597c948fd1727fa23468748a7ca6dd8e38), [assess](https://explorer-studio.genlayer.com/tx/0x7b6d34e2db258d518e52875c45cc10f9d4b50286acbe585821f491a5e7b61a2a) | **SECURITY FAILURE:** prompt-like appended instruction was certified; both segments `PRESERVED/NONE`, proposal `READY`, no failure codes. Ballot was intentionally not opened. |

### E2E conclusion / submission caveat

- Happy path: passed through final `PASSED` readback.
- Missing critical token: blocked; corrected attempt 2 recovered and was certified.
- Conflicting votes: final tie resolved as `REJECTED` with accurate 1–1 tally.
- Stale consent/replay and duplicate vote: tested; readbacks showed no invalid extra progress/count.
- Negation attack: blocked as material contradiction.
- Prompt-injection audit: **failed**. The deployed semantic assessment does not reliably reject appended instruction-like content. Do not describe this deployed version as passing all adversarial tests or submit it as security-complete. A source fix, local regression test, redeployment, and repeat live audit are still required.
- UI state parity: this contract-only project has no frontend; verification here is via direct contract readbacks, not UI interaction.
- These are live Studionet test transactions, not a captured deployment transaction or proof of production readiness.
