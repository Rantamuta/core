# Changelog

All entries follow `docs/CHANGELOG_POLICY.md`.

## Unreleased

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
