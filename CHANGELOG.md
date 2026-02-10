# Changelog

All entries follow `docs/CHANGELOG_POLICY.md`.

## Unreleased

### Bundle load order respects config

- Summary:
  - `BundleManager.loadBundles` now loads bundles in the order listed by `Config.get('bundles')` and warns when a configured bundle is missing or not a directory.
- Why:
  - Ensures bundle loading is deterministic and matches explicit configuration.
- Impact:
  - Bundle load order follows config order instead of filesystem order.
  - Missing or invalid bundle paths now emit warnings.
- Migration/Action:
  - Ensure configured bundle names map to on-disk bundle directories and are ordered intentionally.
- References:
  - PR: #35 Load bundles in config order
- Timestamp: 2026.02.10 18:00

## Rantamuta v1.0.0 — Salpausselkä

**The Salpausselkä Release**

Salpausselkä refers to a series of prominent glacial ridges found only in Finland, formed at the end of the last Ice Age. They mark a stable boundary where movement slowed, pressure settled, and the landscape took on its lasting shape.

This release serves a similar role for Rantamuta: a stable baseline where behavior is preserved, modernization is complete, and future evolution can proceed on solid ground.

This release is the initial stable release of the Rantamuta core engine.

Rantamuta `v1.0.0` is based on the RanvierMUD engine at version `3.0.6` and is intended to preserve equivalent runtime behavior at the point of the fork, with modernization changes only.

Future releases may diverge in behavior as the Rantamuta project evolves.

### BundleManager hard-exit removal

- Summary:
  - Removed `process.exit(0)` calls from `BundleManager` error paths and replaced them with thrown errors that surface to the caller.
- Why:
  - `process.exit(0)` incorrectly signaled successful startup on bundle or area hydration failures and made the core engine unsafe to consume as a library. `0` incorrectly signals _no error_ and the consumer, not the dependency library, properly determines exit.
- Impact:
  - Bundle and area load failures now cause bundle loading to fail via a thrown error instead of terminating the process directly.
  - Downstream wrappers are responsible for handling the error and setting an appropriate exit code.
- Migration/Action:
  - Wrappers invoking `BundleManager.loadBundles` should ensure failures are caught and result in a non-zero process exit.
  - No action is required for callers that already allow startup failures to crash the process.
- References:
  - PR: #29 Replace `process.exit(0)` in `BundleManager` with thrown errors
- Timestamp: 2026.02.10 16:20

### Bundle warning context

- Summary:
  - Bundle/area/entity context was added to warnings for missing scripts and invalid entity data.
- Why:
  - Improves diagnostics when bundles are misconfigured or scripts are missing.
- Impact:
  - No control flow change; only log message text is more specific.
- Migration/Action:
  - None.
- References:
  - PR: #28 Add bundle/area/entity context to warnings
- Timestamp: 2026.02.09 15:18

### Input event validation errors

- Summary:
  - `BundleManager.loadInputEvents` now includes the invalid export type in its error message when `event` is not a function.
- Why:
  - Improves diagnostics by making it clear what the loader actually received.
- Impact:
  - Only the error string changes; invalid input events still throw.
- Migration/Action:
  - None.
- References:
  - PR: #27 Validate `loadInputEvents` with clearer errors
- Timestamp: 2026.02.09 14:56

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
  - Commit: 19fe39e
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
- References:
  - Commit: 8e298cc
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
