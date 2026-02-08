# AGENTS.md

## Purpose

This repository is maintained with help from automated agents (Codex). This document defines non-negotiable constraints, upgrade policy, and the expected workflow so changes remain incremental and reviewable.

## Agent role and stance

Agents working in this repository must act as **senior maintainers**.

- Your responsibility is **decision quality**, not speed or enthusiasm.
- Prefer explicit tradeoffs and documented uncertainty over confident but fragile changes.
- If a change could affect downstream users, assume compatibility matters unless explicitly told otherwise.

## Engine-specific stricture: freeze the export surface

During the Node LTS uplift:

- Do **not** modify `index.js` (the entrypoint) or its export strategy.
- Do **not** add an `exports` map, change `main`, or restructure how modules are exposed.
- Treat the current `require-dir('./src/')` behavior as a compatibility contract for downstream repos.

## Lockfile policy (mandatory early step)

- The existing `package-lock.json` (lockfile v1) must be upgraded to **lockfile v3** intentionally.
- Perform this upgrade in a **dedicated commit** with no other changes.
- After the upgrade, CI must use `npm ci` and must not rewrite the lockfile.
- Do not attempt Node LTS or dependency upgrades until the lockfile v3 baseline is established.

## High-level goals

- Keep the project runnable and maintainable on modern Node LTS.
- Prefer small, reversible changes over rewrites.
- Avoid intentional behavior changes unless explicitly requested and tested.

## Non-goals

- No architectural rewrite.
- No conversion to ESM as part of Node LTS uplift.
- No TypeScript migration unless it is strictly required for a specific objective.

## Runtime compatibility policy

- Target runtime: Node 22 LTS.
- CI should run on Node 18 and Node 22 during transition.
- CommonJS remains supported and is the default module system.

## Package manager and lockfile policy

- Use npm with lockfile v3.
- The lockfile should be updated intentionally, in a dedicated commit.
- CI should use `npm ci` and must not rewrite the lockfile.

## Public API stability

- Treat all modules under `src/` as public API due to `require-dir` exports.
- Do not rename or relocate `src/*` modules during modernization.
- Do not add an `exports` map or change entrypoints during Node LTS uplift.

## Required safety rails before risky changes

Before upgrading runtime dependencies or making behavioral changes:

- Add CI (GitHub Actions) on Node 18 and Node 22.
- Ensure a minimal deterministic test suite exists for:
  - GameServer lifecycle events
  - BundleManager loading semantics
  - CommandManager load and dispatch
- Prefer unit tests plus a minimal smoke test. Avoid flaky network-binding tests unless needed.

## Commit discipline

- One logical change per commit.
- No drive-by refactors, reformatting, or “while we are here” edits.
- Dependency upgrades should be isolated to their own commits.

## Pull request / change log expectations

Every PR must include:

- What changed and why
- How it was validated (tests, manual steps)
- Risks and rollback plan if applicable

## Escalation rule for uncertainty

If behavior is unclear:

- Add a test that captures current behavior first.
- Document assumptions in the PR description.
- Do not guess and move on.
