# Options Triage (No Decisions)

## winston

| Option | Notes | Risks tied to current usage |
| --- | --- | --- |
| Upgrade in place | Target winston v3 (current major). Requires validating `winston.transports.*` usage and log output formatting. | - Transport configuration APIs or defaults may have changed; Logger relies on `winston.transports.Console` and `winston.transports.File` with `timestamp: true`.
- Log level handling (`winston.level` + `winston.log`) could change output or filtering.
- Log output shape/fields could change and affect operator-facing logs. |
| Replace | No clear drop-in replacement identified; Logger exposes a winston-shaped wrapper internally. | - Any replacement would need to reproduce existing log output to avoid behavior changes.
- Changes to `Logger` internals risk breaking downstream usage of the public API. |
| Remove | Implement a small internal logger only if usage surface is proven minimal. | - Re-implementing logging risks losing winston features used by operators (file logging, timestamps).
- Output format changes could break scripts or expectations. |
| Keep/pin | Retain winston v2 for now. | - Staying on an older major risks Node 22 compatibility issues and known ecosystem deprecations.
- Delays needed modernization work while other deps move forward. |

## js-yaml

| Option | Notes | Risks tied to current usage |
| --- | --- | --- |
| Upgrade in place | Target js-yaml v4 (current major). Requires verifying `yaml.load` and `yaml.safeDump` API compatibility and output parity. | - `safeDump` is removed/renamed in newer majors, requiring call-site changes in `Data.saveFile`.
- YAML output ordering or formatting changes could affect on-disk data diffs.
- YAML parsing semantics may change for edge cases (schemas, tags). |
| Replace | No clear drop-in replacement; alternatives (e.g., `yaml`) have different APIs and output behavior. | - Parser/serializer differences could alter data formats consumed by downstream bundles.
- Requires more extensive regression tests for YAML round-trips. |
| Remove | Only feasible if YAML support is dropped or re-implemented internally. | - Removing YAML support would be behavior-breaking for existing bundles and data files.
- Re-implementation risk is high given YAML complexity. |
| Keep/pin | Retain js-yaml v3 for now. | - Staying on an older major risks security and Node compatibility issues.
- `safeDump` is already legacy API in newer js-yaml versions. |

## wrap-ansi

| Option | Notes | Risks tied to current usage |
| --- | --- | --- |
| Upgrade in place | Target the latest major (v7+). Validate wrapping behavior in `Broadcast.wrap`. | - ANSI wrapping behavior or default width handling could change, affecting player-visible output.
- API signature or option defaults may differ in newer majors. |
| Replace | No clear drop-in replacement; any alternative needs ANSI-aware wrapping parity. | - Differences in ANSI handling could break colorized output or alignment in game clients.
- Replacement increases maintenance burden for a core output path. |
| Remove | Implement a local wrapper only if matching current behavior is feasible. | - Custom wrapping logic may diverge from current behavior or mishandle ANSI sequences.
- Risk of regressions in player-visible text formatting. |
| Keep/pin | Retain wrap-ansi v2 for now. | - Staying on an older major risks Node compatibility and dependency ecosystem drift.
- Blocks modernization of dependent tooling that expects newer wrap-ansi versions. |
