# Ranvier Engine Audit (Phase 0)

## Current state summary
- **Package**: `ranvier` v3.0.6, MIT licensed, maintained in the repo `github:ranviermud/core`.【F:package.json†L2-L11】
- **Entrypoint/build**: CommonJS only (`main: index.js`), which re-exports *every module* under `src/` using `require-dir`. There is no `exports` map, and no build step in `scripts`.【F:package.json†L12-L21】【F:index.js†L1-L3】
- **Testing**: `npm test` uses Mocha + NYC and runs tests recursively under `test/`. No CI currently configured.【F:package.json†L13-L20】
- **Lockfile**: `package-lock.json` is lockfile v1, which ties this repo to npm v6-era behaviors by default.【F:package-lock.json†L1-L6】

## Exported API surface (public vs internal)

**Public (implicit):**
- Because `index.js` exports `require-dir('./src/')`, **every file in `src/` becomes part of the public API** for downstream consumers (e.g., `require('ranvier').GameServer`), independent of npm publishing. 【F:index.js†L1-L3】
- This implies the public surface includes (non-exhaustive but representative core runtime types):
  - **Game server / lifecycle**: `GameServer`, `EventManager`, `EventUtil`, `Logger`, `Config`.【F:src/GameServer.js†L1-L1】【F:src/EventManager.js†L1-L1】【F:src/EventUtil.js†L1-L1】【F:src/Logger.js†L1-L1】【F:src/Config.js†L1-L1】
  - **Bundle system**: `BundleManager`, `EntityLoader`, `EntityLoaderRegistry`, `DataSourceRegistry`.【F:src/BundleManager.js†L1-L1】【F:src/EntityLoader.js†L1-L1】【F:src/EntityLoaderRegistry.js†L1-L1】【F:src/DataSourceRegistry.js†L1-L1】
  - **Command system**: `Command`, `CommandManager`, `CommandQueue`, `CommandType`.【F:src/Command.js†L1-L1】【F:src/CommandManager.js†L1-L1】【F:src/CommandQueue.js†L1-L1】【F:src/CommandType.js†L1-L1】
  - **Player/account**: `Player`, `PlayerManager`, `Account`, `AccountManager`, `PlayerRoles`.【F:src/Player.js†L1-L1】【F:src/PlayerManager.js†L1-L1】【F:src/Account.js†L1-L1】【F:src/AccountManager.js†L1-L1】【F:src/PlayerRoles.js†L1-L1】
  - **World/area/room/entities**: `Area`, `AreaManager`, `Room`, `RoomManager`, `Item`, `Npc`, `Character`, and related factories/managers.【F:src/Area.js†L1-L1】【F:src/AreaManager.js†L1-L1】【F:src/Room.js†L1-L1】【F:src/RoomManager.js†L1-L1】【F:src/Item.js†L1-L1】【F:src/Npc.js†L1-L1】【F:src/Character.js†L1-L1】【F:src/ItemFactory.js†L1-L1】【F:src/MobFactory.js†L1-L1】
- **Internal/private (not enforced):** There is no explicit separation; consumers can (and likely do) require any `src/*` module directly via the `ranvier` package namespace. This makes most internals de facto public.

## Node 20 compatibility assessment (risk analysis)

### Runtime API risks
- **CommonJS-only**: The package exports are CJS-only. Node 20 supports CJS, so runtime execution is fine, but any downstream ESM-only tooling will still need interop. This is not a Node 20 break, but it blocks “modern ESM-first” expectations without additional wrapper work.【F:package.json†L12-L21】【F:index.js†L1-L3】

### Dependency/version risks
The package is pinned to older dependency major versions that predate Node 20 and have known compatibility or maintenance concerns:
- `js-yaml@^3.12.0`: very old (current major is 4.x+). Older versions are not maintained and may rely on outdated Node behaviors.【F:package.json†L22-L31】
- `uuid@^3.3.2`: v3 is deprecated; modern Node 20 guidance is v8+ or `crypto.randomUUID` (Node 14.17+). v3 will likely still run, but it is a maintenance risk.【F:package.json†L22-L31】
- `winston@^2.4.4`: v2 is legacy; many ecosystem integrations now expect v3+. Compatibility is often OK at runtime, but it is a long-term risk.【F:package.json†L22-L31】
- `wrap-ansi@^2.0.0`: very old; newer versions have breaking changes. Older versions may rely on deprecated dependencies with known Node 20 friction.【F:package.json†L22-L31】
- `longjohn@^0.2.11`: unmaintained, known to be problematic with modern Node versions due to async stack handling changes. This is a **high** compatibility risk on Node 20.【F:package.json†L22-L31】
- Dev tooling (`mocha@^5`, `nyc@^13`) is also old and may require upgrades for Node 20 runtime stability in CI.【F:package.json†L32-L38】

### Lockfile/tooling risks
- `package-lock.json` is lockfile v1, which is tied to npm v6. Node 20 ships with newer npm (v10+), which can read v1 but will likely rewrite it. This is a **process risk** for consistent installs in CI unless the toolchain is pinned or the lockfile is upgraded intentionally.【F:package-lock.json†L1-L6】

### Native dependencies
- No native dependencies are listed (`bcryptjs` is pure JS). This reduces native compilation risk on Node 20.【F:package.json†L22-L31】

## Critical invariants to protect with tests
These are the minimum behavioral contracts to keep stable while modernizing:
1. **GameServer lifecycle**: startup/shutdown event flow and key event emissions.
2. **BundleManager**: bundle discovery order, filtering by config, and failure handling.
3. **CommandManager**: command load + dispatch semantics and default routing behavior.
4. **Player/Account managers**: save/load interactions with datasources and entity lifecycles.
5. **Timing/scheduler**: any tick/scheduler behavior that bundles rely on for sequencing.

## Recommended staged upgrade plan (with checkpoints/rollback)

### Stage 0 — Audit (this document)
- Capture public API surface and high-risk dependencies.
- **Checkpoint**: Consensus on audit and acceptable risk list.
- **Rollback**: None (read-only).

### Stage 1 — Safety rails (tests + CI)
- Add GitHub Actions CI matrix for Node 18 and Node 20.
- Add a minimal, deterministic test suite (Jest or Vitest) covering the critical invariants.
- Document local test execution.
- **Checkpoint**: CI green on Node 20 with no runtime changes.
- **Rollback**: Revert CI/test commits; no production code changes.

### Stage 2 — Node 20 uplift (incremental)
- Update `engines.node` to `>=20` (or `^20`), and any tooling to match.
- Upgrade dependencies *only as required* to keep tests green.
- If a dependency blocks Node 20, replace it with the smallest compatible alternative and add tests proving no behavioral drift.
- **Checkpoint**: CI green on Node 20 after each dependency change.
- **Rollback**: Revert to previous dependency versions; tests identify regressions.

### Stage 3 — Downstream integration guidance (optional)
- Provide documentation for downstream repos: dependency pinning and recommended Node/npm versions.
- **Checkpoint**: Documented workflow for game repos to adopt the fork.
- **Rollback**: Documentation-only.
