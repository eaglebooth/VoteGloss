# Architecture distinction

VoteGloss is a proposal-local multilingual ballot gate. It stores one bounded source
package and language edition set, receives electorate consent to a manifest, checks
translation segment pairs, then opens and counts an internal one-address-one-vote
poll.

It does not maintain implementation lineages, compare deployed program layouts,
fetch an external authoritative record during assessment, create activation
capabilities, route corrections across documents, compile expense declarations, or
monitor temporal obligations.

The abstract mechanism is:

```text
declare source + locale/roster policy
→ electorate consents to exact manifest
→ translators bind complete segment maps to revision
→ deterministic token checks
→ independent semantic comparison per segment
→ all-locales readiness barrier
→ internal ballot opens over committed editions
→ roster votes once and deterministic tally closes
```

This is materially different from StateLoom's implementation-lineage/study/activation
flow and ErrataRoute's external-erratum/document-edge correction routing. The reused
items are security invariants (sender authorization, version binding, bounded output,
independent verification, no-mutation rejection), not their acquisition or lifecycle
mechanisms.

Scope: the roster is declared by the proposal creator and individually consents; it is
not proven to match an external DAO token snapshot. The result is a VoteGloss poll and
is not represented as binding an external governance system.
