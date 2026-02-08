# Notes

## Public API surface

The engine entrypoint uses `require-dir('./src/')`, which means every module under `src/` is part of the public API surface and should be treated as stable for downstream consumers.

## Sharp edges and failure modes

### Config load order

`Config.get` assumes `Config.load` has already been called and will throw if `__cache` is still `null` (because the `in` operator is used against the cache). In practice, any module calling `Config.get` before the boot process loads the configuration will crash with a `TypeError`. Ensure `Config.load` is invoked during startup before any gameplay systems or entities access configuration defaults.

### BundleManager exit paths

`BundleManager.loadBundles` hard-exits the process in two error paths:
- If `AttributeFactory.validateAttributes()` throws, the error is logged and the process exits with code `0`.
- If an area fails to `hydrate`, the error is logged and the process exits with code `0`.

This means bundle load failures can terminate the server without signaling failure via a non-zero exit code, and without propagating an exception to callers. Plan for these exits when diagnosing startup failures and consider trapping logs around bundle loading.

Additional bundle-related sharp edges worth noting:
- `loadQuests` swallows loader errors; exceptions from `fetchAll()` are caught and ignored, which can mask quest data issues by returning an empty quest list.
- `loadInputEvents` throws immediately when an input event module does not export a function under `event`, halting bundle loading unless callers handle the exception.
- `loadEntities` returns an empty array when entity data is falsy, emitting only a warning, which can make bad data look like “no entities.”
- Missing area or entity scripts only emit warnings; the loader continues, which can hide missing behavior scripts unless logs are monitored closely.
- `loadHelp` warns and skips invalid help entries instead of failing, which can hide malformed help data during startup.

### EventManager detach behavior

`EventManager.detach` removes *all* listeners for the specified event(s) by calling `emitter.removeAllListeners(event)`. This is broader than “remove only the listeners owned by this manager,” so it will also remove other listeners attached to the same events. If `events` is omitted, the method removes listeners for every event tracked by the manager; if `events` is neither a string nor an iterable, it throws a `TypeError`. Use `detach` carefully when an emitter is shared across systems.
