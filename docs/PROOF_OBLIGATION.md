# VoteGloss proof obligation

## Claim

For a specific immutable proposal revision, language pair, glossary, and segment
map, each accepted translation preserves the proposal's operative meaning closely
enough to open VoteGloss's internal poll.

## Falsifier

A changed or omitted negation, amount, threshold, date, address, condition, exception,
right, or duty; a missing required glossary term; a missing/reordered segment; a stale
source revision; validator disagreement; or an unavailable semantic assessment.

## Sufficient evidence

The contract stores the exact proposal segments and glossary before translation.
Each translator submission is bound to the current revision, locale, exact segment
IDs, and recomputed canonical content digest. Deterministic checks preserve numeric,
address, placeholder and required-term tokens. GenLayer validators independently
compare each paired segment and agree on a bounded consequential verdict.

## Consequence

Only when every required locale has a current `CERTIFIED` translation can anyone open
the poll. The poll ballot digest commits to the proposal manifest and each certified
translation digest. Voters are fixed by the proposal manifest and consent to that
manifest before translation begins. Votes are one address, one vote for this narrow
poll; all listed voters must cast before the contract derives `PASSED`, `REJECTED`, or
`NO_QUORUM`.

## Epistemic boundary

VoteGloss does not prove that the proposer submitted the DAO's canonical proposal,
that the source is true, that a translation is legally valid, that the declared voter
roster matches a DAO's token snapshot, or that an external DAO will honor the result.
The public Arbitrum forum link in the fixture manifest is context only. The live
positive evidence uses explicitly labeled synthetic text unless a DAO provides and
authorizes an exact source package.

## Why GenLayer

The contract cannot determine by ordinary deterministic code whether a translated
condition or negation retains meaning. Removing semantic consensus removes the
translation certification predicate that gates the poll. Segment structure, numeric
tokens, source commitments, consent, voter eligibility, vote counting, and terminal
state are all deterministic.
