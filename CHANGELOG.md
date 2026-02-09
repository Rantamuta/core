# Changelog

All entries follow `docs/CHANGELOG_POLICY.md`.

## Unreleased

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
