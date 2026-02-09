# Changelog

All entries follow `docs/CHANGELOG_POLICY.md`.

## Unreleased

### CI audit reporting

- Summary:
  - CI now runs a non-blocking `npm audit` and uploads the JSON report as a workflow artifact.
- Why:
  - Provide visibility into dependency vulnerabilities without failing the build.
- Impact:
  - No runtime impact; CI now publishes an audit report artifact for each run.
- Migration/Action:
  - None.
- References:
  - PR: #26  Add non-blocking CI dependency audit artifact
- Timestamp: 2026.02.09 14:43

### Logger pretty errors warning

- Summary:
  - `Logger.enablePrettyErrors` now warns once that long async stacks are no longer enabled and points to `docs/DEBUGGING_DIAGNOSTICS.md`.
- Why:
  - `longjohn` is being divested due to compatibility and performance risk, while preserving API compatibility.
- Impact:
  - Callers will see a one-time warning; pretty-error formatting still runs without long async stack instrumentation.
- Migration/Action:
  - Use the documented Node diagnostics flags and Inspector workflow for debugging.
- References:
  - PR: #25 "Remove `longjohn`"
- Timestamp: 2026.02.09 14:29

### Quest loader error surfacing

- Summary:
  - `BundleManager.loadQuests` now surfaces loader failures instead of returning a silent empty list.
- Why:
  - Avoids masking quest data errors during bundle loading so failures are actionable.
- Impact:
  - Bundle load will fail fast if quest loaders throw; downstream loaders must handle or fix invalid quest data.
- Migration/Action:
  - Ensure quest loader data is valid; handle thrown errors where bundle loading is invoked if needed.
- References:
  - PR: Surface quest loader failures from BundleManager.loadQuests #21
- Timestamp: 2026.02.09 07:38

### Data file error context

- Summary:
  - Added action-specific error messages for `Data.parseFile` and `Data.saveFile` that include full file paths.
- Why:
  - Improves diagnostics for missing files or unsupported extensions during data load/save operations.
- Impact:
  - Users will see clearer error messages that distinguish parse vs. save failures.
- Migration/Action:
  - None.
- References:
  - PR: pending
- Timestamp: 2026.02.10 12:00

### Config pre-load guard

- Summary:
  - Added an explicit pre-load guard for `Config.get` with a dedicated error type.
- Why:
  - Prevent ambiguous null access errors and make config lifecycle violations explicit.
- Impact:
  - Callers invoking `Config.get` before `Config.load` now receive a clear error instead of a generic runtime failure.
- Migration/Action:
  - Ensure `Config.load` is called before any `Config.get` usage.
- Timestamp: 2026.02.09 09:30

### Remove `sty` dependency

- Summary:
  - Replaced RanvierMUD's `sty` dependency with a homegrown color tag parser.
- Why:
  - `sty` is no longer supported and has long-standing, critical security issues. DIY parser `Ansi.js` added to reduce dependency surface and align color parsing with engine-specific needs.
- Impact:
  - Downstream code that relied on `sty` behaviors should use the core color tag parser instead.
- Migration/Action:
  - Update downstream logging or formatting to use the core color tag format where applicable.
- Timestamp: 2026.02.08 17:30
