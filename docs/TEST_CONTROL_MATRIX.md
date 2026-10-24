# Test control matrix

| Control | Expected contract result | Required state assertion |
|---|---|---|
| All roster members accept same manifest | enters `TRANSLATING` | exact manifest/revision and consent count |
| Wrong or stale manifest digest | reject | proposal snapshot unchanged |
| Replayed manifest consent | reject | consent count unchanged |
| Outsider revises source | reject | exact proposal unchanged |
| Owner submits own translation | reject | no translation stored |
| Wrong locale, segment ID/order, or malformed JSON | reject | proposal and attempt index unchanged |
| Missing number/address/placeholder/glossary token | `BLOCKED` before AI | no certified pack or ballot |
| Semantic negation/condition drift | `BLOCKED` | no readiness or ballot digest |
| Target-only assessor instruction, despite otherwise correct translation | `BLOCKED` or `UNRESOLVED` | two real assessments BLOCKED; no READY; two denied ballot calls; see remediation live evidence |
| Detected added instruction returned alongside PRESERVED | normalize to drift | exact target quote retained; no ballot |
| Legacy verdict missing addition audit | `UNRESOLVED` | no READY |
| Legacy certificate already marked CERTIFIED | reject `open_ballot` | proposal unchanged |
| Independent diagnostic quotes differ, consequential drift agrees | allow drift consensus | BLOCKED; do not require free-form equality |
| `UNCLEAR` result or malformed consensus payload | `UNRESOLVED` or transaction rollback | cannot open ballot; retry may submit a new attempt only after unresolved result |
| Leader and validator disagree on a segment verdict | consensus rejection/revert | sealed pack remains retryable and proposal unchanged |
| One required locale absent or stale | reject `open_ballot` | state remains `TRANSLATING`/not ready |
| Source revised after translations | new revision requires roster consent and new translations | old packs cannot satisfy current revision |
| Non-roster voter | reject | complete proposal snapshot unchanged |
| Duplicate voter choice | reject | counters and original choice unchanged |
| All roster votes cast | derive terminal result | totals equal submitted unique choices |

Tests call VoteGloss public methods directly through a lightweight GenVM API harness.
The harness executes separate leader and validator callbacks but does not emulate
StudioNet consensus. Live claims require transactions against the final deployment.
