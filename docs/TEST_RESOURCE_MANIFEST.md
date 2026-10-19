# Test resource manifest

| Resource | Authority / locator | Binding | Classification | Expected effect |
|---|---|---|---|---|
| Arbitrum AIP-1 discussion | [Arbitrum DAO forum](https://forum.arbitrum.foundation/t/seed-latam-delegate-communication-thread/13895), AIP-1 / Special Grants discussion | Locator only; not fetched by contract | Public domain context | No direct on-chain effect |
| `source.json` | Repository fixture, adapted synthetic text | Proposal ID + revision + exact canonical digest | Synthetic test input | Can become a sealed proposal only after roster consent |
| `translation-es-valid.json` | Repository fixture | Locale + revision + exact segment ID order + digest | Synthetic positive translation | May be certified only with independent semantic consensus and hard checks |
| `translation-es-negation-drift.json` | Repository fixture | Same source object/revision | Synthetic adversarial translation | `BLOCKED`, ballot remains closed |
| `translation-es-missing-number.json` | Repository fixture | Same source object/revision | Synthetic deterministic negative | `BLOCKED` before the nondeterministic call |
| `translation-es-prompt-injection.json` | Repository fixture | Same source object/revision | Synthetic prompt-injection control | The injected sentence is untrusted data; no automatic positive outcome |

The contract intentionally does not fetch the forum. A proposer declares the exact
source text; the public forum link provides a real-world use-case reference, not
authority that the submitted text is canonical. Live evidence must label synthetic
fixtures and must not claim an official DAO translation.
