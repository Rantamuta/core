# Debugging and Diagnostics (Node.js)

This document is a quick guide to debugging Node.js services using built-in CLI flags and the Inspector workflow. It replaces older methods, particularly calls to `enablePrettyErrors()` in `Logger`.

## Quick CLI flags

- `--trace-uncaught`: print stack traces for uncaught exceptions, including the throw site.
- `--trace-warnings`: print stack traces for process warnings (including deprecations).
- `--trace-deprecation`: print stack traces for deprecation warnings.

Example:

`node --trace-uncaught --trace-warnings path/to/your/game/entry.js`

## Inspector debugging (recommended)

Start the process with the Inspector enabled and attach a client.

- `node --inspect path/to/your/game/entry.js` starts the Inspector and continues running immediately.
- `node --inspect-brk path/to/your/game/entry.js` starts the Inspector and breaks on the first line.

Common clients:

- Chrome DevTools (or Edge DevTools): open `chrome://inspect` (or `edge://inspect`), configure the host/port if needed, and attach to the Node process.
- VS Code: use the "Attach to Node Process" command or create an "attach" configuration and connect to the running process.

## Security note

The Inspector gives full access to the running process. Keep it bound to localhost (the default) and avoid exposing the port publicly unless you have a secure tunnel.

## Resources

- Node.js CLI options: <https://nodejs.org/api/cli.html>
- Node.js debugging guide (Inspector, Chrome DevTools, VS Code): <https://nodejs.org/en/learn/getting-started/debugging>
- VS Code Node.js debugging: <https://code.visualstudio.com/docs/nodejs/nodejs-debugging>
