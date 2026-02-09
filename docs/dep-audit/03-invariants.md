# Behavior Invariants (Must Not Change)

## winston / Logger

- **MUST** remove the default `Console` transport and re-add it with `timestamp: true` during Logger module initialization.
- **MUST** keep `Logger.getLevel()` resolving in this order: `winston.level`, `process.env.LOG_LEVEL`, then `'debug'`.
- **MUST** keep `Logger.log`, `Logger.error`, `Logger.warn`, and `Logger.verbose` delegating to `winston.log()` with their current log levels.
- **MUST** keep `Logger.setFileLogging()` appending `.log` when missing and adding a File transport with `timestamp: true`.
- **MUST** keep `Logger.deactivateFileLogging()` removing the File transport.

## js-yaml / Data

- **MUST** keep `Data.parseFile()` accepting `.yml`, `.yaml`, and `.json` only, throwing an error for missing files or unknown extensions.
- **MUST** keep YAML parsing via `yaml.load` for `.yml`/`.yaml` and JSON parsing via `JSON.parse` for `.json`.
- **MUST** keep `Data.saveFile()` writing YAML via `yaml.safeDump`, JSON via `JSON.stringify(data, null, 2)`, and throwing on missing files or unknown extensions.

## wrap-ansi / Broadcast

- **MUST** keep `Broadcast.at()` parsing color tags before writing to the socket (asserted by existing unit test).
- **MUST** keep `Broadcast.wrap()` applying ANSI parsing before wrapping and normalizing newlines via `_fixNewlines`.
- **MUST** keep `_fixNewlines()` normalizing lone `\n` into `\r\n` and stripping a trailing ANSI reset (`\x1B[0m`).
