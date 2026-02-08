# Notes

## Public API surface

The engine entrypoint uses `require-dir('./src/')`, which means every module under `src/` is part of the public API surface and should be treated as stable for downstream consumers.
