![Rantamuta Sand Castle](https://avatars.githubusercontent.com/u/259600333?s=200&v=4)

# Rantamuta Engine ("`core`")

Actual core engine code for [Rantamuta](https://github.com/Rantamuta) game engine which is a maintenance and stewardship fork of  [RanvierMUD](https://ranviermud.com).

The 1.0 release is intended to be a **pure maintenance upgrade**: updating the runtime to modern Node.js, adding CI via GitHub Actions, fixing long-standing crashes and sharp edges, and restoring a reliable out-of-the-box experience. There is no engine redesign and no intentional change to the core architecture.

## 1.0 Maintenance Checklist (core)

This checklist is scoped to the `Rantamuta/core` engine only. It focuses on a **pure maintenance upgrade**: modern Node.js compatibility, CI, dependency hygiene, and sharp‑edge fixes. There is no redesign, no API‑breaking changes, and no assumptions about `ranviermud`, datasources, or bundles.

### Modernization

#### Runtime & Tooling

* [x] Node runtime target set to `>=22` in `package.json` (`engines.node`).
* [x] `.nvmrc` pins Node `v22.21.1` for local dev parity.
* [x] CommonJS module format retained (`index.js` + `require-dir`, no `type: "module"`).
* [x] Lockfile v3 present (`package-lock.json`).
* [x] `npm test` script defined (mocha + c8).
* [x] GitHub Actions CI present.
* [x] CI installs via `npm ci`.
* [x] CI currently runs on Node 22.
* [x] Remove or update legacy `.travis.yml` (still targets Node 10).

#### Dependencies & Security Hygiene

* [x] `longjohn`: Remove `longjohn` from dependencies (divestment, not gating)
  * Rationale: high runtime overhead, legacy async instrumentation, and ongoing compatibility risk on modern Node.
  * Replacement is documentation and adoption of modern Node diagnostics and improved contextual error reporting.
  * [x] Define when/where it is used and what behavior it provides
  * [x] Add one or two targeted tests that assert core does not depend on `longjohn` (and does not import it) under default execution
  * [x] Document recommended Node diagnostics for development debugging (replace “long async stacks” approach):
    * `--trace-uncaught`
    * `--trace-warnings`
    * inspector-based debugging (`node --inspect` / DevTools workflow)

* [x] `glob` / `inflight` (and similar): removed inflight by upgrading mocha to latest and overriding `glob` to latest.

* [x] Add non-blocking `npm audit` reporting in CI (artifact or summary).

#### Packaging & Distribution

* [x] `main` points to `index.js` (require-dir export surface preserved).
* [x] Entry point remains CommonJS and stable.
* [x] Document in `docs/NOTES.md` that `require-dir('./src/')` exposes all `src/*` modules as public API.
* [x] Remove npm packaging artifacts and references (e.g., `.npmignore`, `npm pack`, publish-focused docs) since this repo is not distributed as an npm package.

#### CI & Quality Gates

* [x] Unit test framework present (mocha) with coverage tooling (c8).
* [x] Unit tests exist in `test/unit` for utility modules.

#### Documentation

* [x] README states “pure maintenance upgrade” intent.
* [x] Supported Node versions: Node 22 LTS (see `engines.node` and `.nvmrc`).
* [x] Document supported Node versions (22 now).
* [x] Document in `docs/NOTES.md` the core‑only scope, extension points, and public API surface (Config, Logger, BundleManager, EntityLoader, GameServer).
* [x] Document in `docs/NOTES.md` sharp edges and failure modes (Config load order, BundleManager exit paths, EventManager detach behavior).
* [x] Establish in `docs/NOTES.md` a lightweight changelog policy for maintenance releases (record user-visible changes and dependency/security actions).
  * Scope: dependency upgrades/removals, runtime/CI changes, compatibility-impacting fixes, and removals of debugging hooks.
  * Format can be minimal (single `CHANGELOG.md` or “changelog entries in PR description”), but it must be consistent.

---

#### Stability & Error Handling

* [x] Replace `process.exit(0)` in `BundleManager` error paths with thrown errors or non-zero exit codes (library should not hard-exit).
* [x] Log loader errors in `loadQuests` instead of swallowing them silently.
* [x] Surface `loadQuests` loader exceptions instead of ignoring `fetchAll()` errors that can mask quest data issues.
* [x] Validate `loadInputEvents` exports with clearer errors that identify the bundle and event name when `event` is not a function.
* [x] Add bundle/area/entity context to warnings for missing scripts or invalid entity data, only if trivial context addition without changing control flow. Otherwise, cross off this item.
* [x] Guard `Config.get` against being called before `Config.load` (clear error or safe fallback).
* [x] Improve error messages in `Data.saveFile`/`Data.parseFile` with full path and action context.

## Developing

* Have a checkout of the normal ranviermud repo
* Have a checkout of this repo adjacent to it
* In this repo run npm install then `npm link` (might need `sudo`)
* Go back to the other repo and run `npm link ranvier`

Now any changes you make in this repo will automatically be available inside your ranvier project. Any time you do `npm
install` or `npm update` in your ranviermud repository you'll have to re-run `npm link ranvier` to re-establish the link.
