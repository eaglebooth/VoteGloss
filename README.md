# VoteGloss

VoteGloss is a contract-only GenLayer language gate for small DAO polls. It opens its
internal ballot only after the declared electorate consents to one exact proposal
manifest and every required language edition preserves the proposal's operative
meaning under independent validator agreement.

It is not a production DAO governor, token-weight voting system, legal translation
certifier, or proof that a proposer submitted a community's canonical proposal. The
poll uses a proposer-declared roster that must consent to the exact manifest.

## Why GenLayer

Preserving the meaning of translated conditions, negations, exceptions, and duties is
semantic. Deterministic code handles segment IDs, exact revision/digest binding,
critical numeric/address/placeholder tokens, glossary presence, roster consent,
one-vote replay protection, and final tally. GenLayer judges the bounded
source/translation relation; validators independently assess each segment's
consequential `PRESERVED`, `MATERIAL_DRIFT`, or `UNCLEAR` result.

## Lifecycle

```text
create_proposal
→ every declared voter accepts exact manifest
→ submit_translation for each required locale
→ assess_translation
   ├─ deterministic mismatch → BLOCKED
   ├─ semantic drift → BLOCKED
   ├─ ambiguity / failed consensus → UNRESOLVED or retryable sealed state
   └─ every segment preserved → CERTIFIED
→ all locales certified → open_ballot
→ each roster address votes once
→ all roster votes cast → PASSED / REJECTED / NO_QUORUM
```

There is no wall-clock deadline or timeout recovery path. A ballot closes only after
every address in the consented roster has cast; the contract holds no funds.

## Build and test

```powershell
python -m pip install -r requirements-dev.txt
python scripts/verify.py
```

The direct contract harness exercises actual public entrypoints and separately invokes
leader and validator callbacks. Its semantic outputs are controlled fixtures, not
live consensus. No contract has been deployed yet, so there is no live transaction or
deployment address to report. Add `docs/LIVE_EVIDENCE.md` only after a real deployment
and transaction readback; never populate it with predicted hashes or placeholder URLs.

## Evidence and limits

- [Proof obligation](docs/PROOF_OBLIGATION.md)
- [Test resources](docs/TEST_RESOURCE_MANIFEST.md)
- [Adversarial controls](docs/TEST_CONTROL_MATRIX.md)
- [Architecture distinction](docs/ORIGINALITY.md)
- [Reviewer call guide](docs/REVIEWER_CALL_GUIDE.md)
- [Live deployment/source-parity evidence](docs/LIVE_EVIDENCE.md)
- [Public use-case context](https://forum.arbitrum.foundation/t/seed-latam-delegate-communication-thread/13895)

Status: source, fixtures, and local tests are built and verified. No deployment address
or live transaction is claimed until an exact source deployment and readback are verified.
