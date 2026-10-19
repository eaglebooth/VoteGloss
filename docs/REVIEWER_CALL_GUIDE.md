# Reviewer call guide

Network: deploy to the GenLayer test network selected in Studio / the deployment tool.
Record the network name and chain ID from the actual deployment receipt in live
evidence; this guide intentionally does not guess them.

The deploying account is not stored in contract state and has no special role. Use two
separate test wallets: Wallet A creates the proposal and votes; Wallet B accepts the
manifest, translates, and votes. The deployed contract address and deployment
transaction will be recorded in release evidence after deployment and on-chain
readback. No live deployment is claimed yet.

1. Wallet A calls `create_proposal(local_id, source_language, source_segments_json, required_locales_json, glossary_json, voters_json, quorum)`. Put A and B in the voter roster and set quorum to `2` for this two-wallet demonstration.
2. Read `get_proposal(proposal_id)` and copy `manifest_digest`.
3. Wallet A and then Wallet B call `accept_manifest(proposal_id, 1, manifest_digest)`. No translation can be submitted until the roster has accepted the exact same revision and digest.
4. Wallet B calls `submit_translation(proposal_id, "es", 1, translated_segments_json)` and records the returned attempt number.
5. Any account calls `assess_translation(proposal_id, "es", 1, attempt)`. Wait for transaction finality and inspect `get_translation`. A semantic drift, hard token failure, unclear result, or failed consensus cannot certify the locale.
6. After all required locales are `CERTIFIED`, any account calls `open_ballot(proposal_id, 1)`. The returned digest commits to the source manifest and certified translation pack digests.
7. A and B call `cast_vote(proposal_id, "YES"|"NO"|"ABSTAIN")` once each. The final unique roster vote deterministically closes the poll.
8. Verify `get_proposal`: ballot digest, vote counters, `PASSED`/`REJECTED`/`NO_QUORUM`, and terminal state must match the finalized transactions.

Use `tests/fixtures/proposal_sets/arbitrum-aip1-adapted/` to replay the synthetic
demonstration. It is adapted test data, not an official DAO translation. Never put
private keys in the repository or evidence.
