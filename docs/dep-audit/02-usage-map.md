# Dependency Usage Map

## winston

**Import sites**
- `src/Logger.js`: `const winston = require('winston');`

**APIs used**
- `winston.remove(winston.transports.Console)` and `winston.add(winston.transports.Console, { timestamp: true })` configure the default Console transport at module load.
- `winston.level` is read/written via `Logger.getLevel()` and `Logger.setLevel()`.
- `winston.log(level, ...messages)` is used for `log`, `error`, `warn`, and `verbose`.
- `winston.add(winston.transports.File, { filename, timestamp: true })` is used for file logging; `winston.remove(winston.transports.File)` disables it.

**Classification**
- **Output-sensitive**: changes affect log output format/fields and runtime log behavior.
- **Public-API-sensitive**: `Logger` is exported from `src/` and is part of the public API surface.
- **Internal-only**: no (logs are externally visible).

## js-yaml

**Import sites**
- `src/Data.js`: `const yaml = require('js-yaml');`

**APIs used**
- `yaml.load` parses `.yml` and `.yaml` files in `Data.parseFile`.
- `yaml.safeDump` serializes `.yml` and `.yaml` files in `Data.saveFile`.

**Classification**
- **Data-format-sensitive**: YAML parsing/serialization directly impacts on-disk data.
- **Public-API-sensitive**: `Data` is exported from `src/` and is part of the public API surface.
- **Output-sensitive**: indirectly (output files and errors are visible to operators).

## wrap-ansi

**Import sites**
- `src/Broadcast.js`: `const wrap = require('wrap-ansi');`

**APIs used**
- `wrap(ansi.parse(message), width)` is used in `Broadcast.wrap` to apply ANSI-aware wrapping after color parsing.

**Classification**
- **Output-sensitive**: wraps user-facing text written to sockets.
- **Public-API-sensitive**: `Broadcast` is exported from `src/` and is part of the public API surface.
- **Internal-only**: no (player-visible output is affected).
