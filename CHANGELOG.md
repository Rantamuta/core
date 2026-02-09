# Changelog

All entries follow `docs/CHANGELOG_POLICY.md`.

## Unreleased

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
  - None.
- Timestamp:
  - 2026.02.09 09:30

### Drift / Modernization
- Summary:
  - Replaced RanvierMUD's `sty` dependency with a homegrown color tag parser.
- Why:
  - Reduce dependency surface and align color parsing with engine-specific needs.
- Impact:
  - Downstream code that relied on `sty` behaviors should use the core color tag parser instead.
- Migration/Action:
  - Update downstream logging or formatting to use the core color tag format where applicable.
- References:
  - None.
