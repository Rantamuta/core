# Atomic Follow-up Checklist (Draft)

1. **Add unit tests for `Logger` behavior** (log level forwarding, file logging `.log` suffix, and transport usage).  
   *Rationale:* Captures current winston integration before any upgrades.

2. **Add YAML parse/save round‑trip tests for `Data.parseFile` / `Data.saveFile`.**  
   *Rationale:* Locks in data serialization expectations for `.yml`/`.yaml` and `.json`.

3. **Add unit tests for `Broadcast.wrap` output** (ANSI-aware wrapping and CRLF normalization).  
   *Rationale:* Protects player-visible formatting before changing wrap-ansi.

4. **Add a regression test to assert `Broadcast.at` color parsing behavior** (extend existing test with wrapWidth=false/true coverage).  
   *Rationale:* Ensures color parsing stays stable with wrapping behavior changes.

5. **Upgrade js-yaml from v3 to v4 and update `Data.saveFile` API usage** (`safeDump` → `dump`) in a dedicated PR after tests.  
   *Rationale:* The usage surface is small and well-contained to `Data.js`.

6. **Upgrade winston from v2 to v3 and adjust `Logger` transport configuration** with output‑format regression tests.  
   *Rationale:* Logger is a narrow wrapper, but log output is externally visible.

7. **Upgrade wrap-ansi from v2 to a current major and adjust `Broadcast.wrap` usage as needed.**  
   *Rationale:* Single call site, but output formatting is player-visible and needs tests first.

8. **Investigate transitive `glob@8` + `inflight` deprecations** (via c8/test-exclude) and propose a targeted dev dependency bump to eliminate deprecated transitive packages.  
   *Rationale:* Keeps dev tooling free of deprecated dependencies without touching runtime behavior.
