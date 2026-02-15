# Notes

This section is for downstream game repo maintainers, bundle authors, and automated agents working on maintenance tasks. It summarizes how the core engine is intended to be extended without implying changes to the public API surface.

### Core-only scope

This repository is the core engine only. It is designed to be extended by downstream repos through bundles, custom modules, and configuration, rather than by modifying core internals.

## Proposals

- Runtime area hot-reload design spec: `docs/proposals/AREA_HOT_RELOAD.md`
- Query hook guard + event-driven script model: `docs/proposals/QUERY_HOOK_GUARD_AND_EVENT_DRIVEN_SCRIPTS.md`

## Public API surface

The engine entrypoint uses `require-dir('./src/')`, which means every module under `src/` is part of the public API surface and should be treated as stable for downstream consumers.

### Extension points and public API surfaces

The entrypoint exports every module under `src/`, so all of these surfaces are public API. The table below highlights the most common extension seams and how downstream repos typically integrate with them.

| Surface | What it does | How downstream repos extend it | Integration point | Stability notes |
| --- | --- | --- | --- | --- |
| Config | Loads and exposes configuration data used by core systems. | Provide config files and call `Config.load` during boot, then read via `Config.get`. | `src/config.js` (`Config.load`, `Config.get`) | Public API; ensure config load order is respected. |
| Logger | Shared logging facade used across the engine. | Configure transports/levels via config or initialization wiring at boot. | `src/logger.js` | Public API; avoid reaching into logger internals. |
| BundleManager | Discovers and loads bundles (areas, entities, commands, behaviors, quests, input events). | Add bundles to the bundle path; register bundles during boot. | `src/bundles/BundleManager.js` | Public API; bundle loading error paths are documented below. |
| EntityLoader | Constructs entities from bundle definitions and scripts. | Provide entity data/scripts in bundles; register loader behavior where needed. | `src/entities/EntityLoader.js` | Public API; loader validation behavior should be treated as stable. |
| GameServer | Coordinates lifecycle and runtime startup/shutdown. | Hook into lifecycle events and register systems/bundles during boot. | `src/GameServer.js` | Public API; do not depend on private internals. |

### Minimal integration path (downstream repo)

1. Provide configuration files and call `Config.load` early in your boot sequence. (See Config load order below.)
2. Configure logging (transports/levels) before starting core systems.
3. Register bundle paths and load bundles via `BundleManager` during boot.
4. Ensure entity data/scripts are available to `EntityLoader` through bundles.
5. Use `GameServer` lifecycle hooks to wire startup/shutdown and system registration.

### What this document does not guarantee

- It does not change or redefine the export surface; `require-dir('./src/')` remains the contract.
- It does not guarantee behavior for private helpers or internal module structure not documented here.
- It does not imply compatibility with external forks beyond the public API stability policy.

## Sharp edges and failure modes

## Longjohn and pretty-error usage

Update (2026-02-09): `longjohn` has been removed and `Logger.enablePrettyErrors` now emits a one-time warning that long async stacks are no longer enabled. See CHANGELOG "Logger pretty errors warning".

In core, `longjohn` is only loaded inside `Logger.enablePrettyErrors()` in `src/Logger.js`, and it is not required during default engine load. `longjohn` is side-effect driven (the require installs long async stack trace hooks), while `pretty-error` formats stack output. Based on a downstream repo scan reported by the maintainer (no references to `enablePrettyErrors` or `pretty-error`), this path appears to be unused in the current ecosystem and remains opt-in.

Historically, `longjohn` was installed to provide long async stack traces to aid debugging, and `pretty-error` was installed to format stack traces and runtime errors for readability. Together they provided a more developer-friendly error experience: `longjohn` captured deeper async call chains while `pretty-error` rendered them in a cleaner, colorized format.

### Config load order

Update (2026-02-09): `Config.get` now throws a dedicated pre-load guard error instead of a generic `TypeError`. See CHANGELOG "Config pre-load guard".

`Config.get` assumes `Config.load` has already been called and will throw if `__cache` is still `null` (because the `in` operator is used against the cache). In practice, any module calling `Config.get` before the boot process loads the configuration will crash with a `TypeError`. Ensure `Config.load` is invoked during startup before any gameplay systems or entities access configuration defaults.

### BundleManager exit paths

Update (2026-02-10): `BundleManager` no longer calls `process.exit(0)` on these paths; it now throws errors to the caller. See CHANGELOG "BundleManager hard-exit removal".

`BundleManager.loadBundles` hard-exits the process in two error paths:

- If `AttributeFactory.validateAttributes()` throws, the error is logged and the process exits with code `0`.
- If an area fails to `hydrate`, the error is logged and the process exits with code `0`.

This means bundle load failures can terminate the server without signaling failure via a non-zero exit code, and without propagating an exception to callers. Plan for these exits when diagnosing startup failures and consider trapping logs around bundle loading.

Additional bundle-related sharp edges worth noting:

- `loadEntities` returns an empty array when entity data is falsy, emitting only a warning, which can make bad data look like “no entities.”
- `loadHelp` warns and skips invalid help entries instead of failing, which can hide malformed help data during startup.
- Update (2026-02-09): `loadQuests` now surfaces loader failures instead of swallowing them. See CHANGELOG "Quest loader error surfacing".  `loadQuests` swallows loader errors; exceptions from `fetchAll()` are caught and ignored, which can mask quest data issues by returning an empty quest list.
- Update (2026-02-09): `loadInputEvents` error messages now include the invalid export type (behavior unchanged). See CHANGELOG "Input event validation errors".  `loadInputEvents` throws immediately when an input event module does not export a function under `event`, halting bundle loading unless callers handle the exception.
- Update (2026-02-09): Missing script warnings now include bundle/area/entity context. See CHANGELOG "Bundle warning context".  Missing area or entity scripts only emit warnings; the loader continues, which can hide missing behavior scripts unless logs are monitored closely.

### EventManager detach behavior

`EventManager.detach` removes *all* listeners for the specified event(s) by calling `emitter.removeAllListeners(event)`. This is broader than “remove only the listeners owned by this manager,” so it will also remove other listeners attached to the same events. If `events` is omitted, the method removes listeners for every event tracked by the manager; if `events` is neither a string nor an iterable, it throws a `TypeError`. Use `detach` carefully when an emitter is shared across systems.
