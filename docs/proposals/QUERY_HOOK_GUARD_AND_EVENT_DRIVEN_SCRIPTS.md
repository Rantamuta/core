# Query Hook Guard + Pipeline-Aligned Event Model Proposal

Status: Proposed  
Owner: Core maintainers  
Last updated: 2026-02-15

## Purpose
Define an engine-level hook safety and performance model that matches the reference bundle command pipeline (resolve -> capture -> target -> bubble -> commit -> render) while preserving gameplay behavior.

This proposal is implementation-oriented and designed to be actionable without extra context.

## Problem Statement
Observed in reference bundle scripts and room rendering:
1. Query hooks (`renderPredicates`, `allowAction`, capture checks) are expected to be read-only.
2. JavaScript cannot statically certify purity.
3. Current guard patterns are mostly convention + shallow freeze + local wrappers.
4. Designers compensate with method monkeypatching (`addItem`/`removeItem`) for derived state sync and reactions.
5. Some hook contexts are rebuilt per call, creating avoidable overhead in high-frequency paths.

## Key Constraints from Reference Bundle
1. Hook execution is phase-based (`room-view`, `capture`, `bubble`).
2. Mutation is transactional in mutator commit with rollback.
3. Internal trace metadata exists and should be attached to diagnostics.
4. Spawn/ready hook composition is common and must be validated where composed.

## Goals
1. Provide a shared `runReadOnlyHook` utility for query-phase hook execution.
2. Cache read-only proxy/view wrappers once per pass and reuse across hook calls.
3. Enforce strictness modes:
   - `dev`: throw detailed mutation error
   - `prod`: warn + fail-closed result
4. Validate hook shape at composition points (`spawn`/`ready`) and known hook collections.
5. Provide structured diagnostics including phase and trace identity.
6. Replace monkeypatch-driven reaction patterns with first-class mutation event surfaces.
7. Ensure event semantics are rollback-safe in transactional mutation pipelines.

## Non-Goals
1. No static purity certification.
2. No command architecture rewrite.
3. No forced one-shot migration of all bundles.
4. No gameplay semantic changes for valid hooks.

## Compatibility Constraints
1. Preserve core export strategy (`index.js` unchanged).
2. Additive APIs only.
3. Existing valid hooks remain behaviorally unchanged.
4. Production mode never crashes server solely due to a single hook mutation attempt.

## Hook Taxonomy (Pipeline-Aligned)

### Query Hooks (guarded)
Read-only decision hooks, evaluated in deterministic read phases:
1. `renderPredicates.*`
2. `allowAction`
3. command `captureChecks`
4. optional future query-only gate hooks

### Planner/Effect Hooks (not read-only guarded by default)
May return operations or trigger effects:
1. `bubbleEvent`
2. mutation-time reactions
3. explicit event listeners

## Phase Model

### Pass Types
1. `room_view` (look/enter render)
2. `capture` (policy veto path)
3. `bubble` (reaction accumulation)

### Pass Boundaries
Each pass creates one cached read-only view context and reuses it for all query hooks in that pass.

## Proposed Engine Utility API

New module: `src/HookRunner.js`

```js
class HookRunner {
  constructor({ Logger, Config, HookMutationContext })

  beginPass(passType, meta = {})
  endPass(pass)

  runReadOnlyHook(fn, context, options = {})
  runReadOnlyHooks(hookMap, context, options = {})

  validateHookCollection(hooks, schema, meta = {})
}
```

### `beginPass(passType, meta)` return
```js
{
  id: Symbol('hook-pass'),
  passType, // room_view | capture | bubble
  meta,
  startedAt: Date.now(),
  cache: new WeakMap(),
}
```

### `runReadOnlyHook` options
1. `pass` (recommended; enables cache reuse)
2. `hookName` (e.g. `renderPredicates`)
3. `hookKey` (e.g. `slab_open`)
4. `entityRef`
5. `scriptId`
6. `phase` (defaults from pass)
7. `trace` (optional command trace fields)
8. `failClosed` (default depends on hook family)
9. `mode` override (`dev`/`prod`)

### Default fail-closed values
1. Predicate boolean hooks: `false`
2. Veto hooks (`allowAction`): `undefined` (no allow/deny change)
3. Capture checks returning boolean: `false`

## Strictness Modes
Config:
1. `hookGuard.enabled` (boolean, initial default `false` during rollout)
2. `hookGuard.mode` (`dev` | `prod`, default `prod`)
3. `hookGuard.logLimitPerTick` (default 50)
4. `hookGuard.captureStack` (default true in dev)

Behavior:
1. `dev`: throw `HookMutationError`.
2. `prod`: log warning and return fail-closed value.

## Read-Only View Strategy

New module: `src/ReadOnlyView.js`

```js
createReadOnlyView(value, { pass, hookMeta, diagnostics })
```

Rules:
1. Primitives pass through.
2. Objects/functions are wrapped and memoized by pass-local `WeakMap`.
3. Nested path is tracked for diagnostics.
4. Block direct writes (`set`, `deleteProperty`, `defineProperty`, `setPrototypeOf`).
5. Block common mutator methods:
   - `Map#set/delete/clear`
   - `Set#add/delete/clear`
   - array mutators (`push`, `splice`, etc.)
   - common world mutators when reachable (`addItem`, `removeItem`, `moveTo`, etc.)

## Closure-Escape Mutation Sentinel

Problem: hooks may mutate via closure-captured objects not reached through guarded context.

New module: `src/HookMutationContext.js`
1. Implement with `AsyncLocalStorage`.
2. API:
   - `runInReadOnlyContext(meta, fn)`
   - `assertWritable(op, targetPath)`

Instrumentation target methods (initial set):
1. `Item.addItem/removeItem/open/close/lock/unlock`
2. `Room.addItem/removeItem/addNpc/removeNpc/addPlayer/removePlayer`
3. `Character.addItem/removeItem/equip/unequip`
4. `Player.moveTo`, `Npc.moveTo`

If called during read-only context, sentinel raises mutation violation with metadata.

## Hook Shape Validation (Composition-Time)

### Validation points
1. At hook composition in entity `spawn`/`ready` workflows.
2. At known collection assignment points (`renderPredicates`, `allowAction`, `captureChecks`).

### Schema kinds
1. `function`
2. `booleanOrFunction`
3. `optionalFunction`
4. `arrayOfFunction`

### Mode behavior
1. Dev: throw invalid-shape error.
2. Prod: warn and ignore invalid entry.

## Diagnostics Contract

### Error Type
`HookMutationError` fields:
1. `message`
2. `hookName`
3. `hookKey`
4. `entityRef`
5. `scriptId`
6. `phase`
7. `passId`
8. `mutationPath`
9. `operation`
10. `trace` object with optional:
    - `commandName`
    - `ruleKey`
    - `actorInput`
    - `canonicalInput`
11. `mode`
12. `cause`

### Log behavior in prod
1. Warning summary line.
2. Structured payload as second arg.
3. Per-tick rate limit enforced.

## Event Model to Replace Monkeypatch Patterns

## Core Event Additions (low-level)
1. `Room#itemAdded` `(item, room)`
2. `Room#itemRemoved` `(item, room)`
3. `Item#itemAdded` `(item, containerItem)`
4. `Item#itemRemoved` `(item, containerItem)`
5. `Character#itemAdded` `(item, character)`
6. `Character#itemRemoved` `(item, character)`

Emit after successful mutation and reference updates.

## Transaction-Safe Dispatch Requirement
For transactional mutators with rollback (reference bundle pattern), script-facing reaction events must be rollback-safe.

### Required behavior
1. If transaction aborts, no durable side effects from script reaction events should remain.
2. Preferred model: dispatch script-facing mutation reaction events only after successful commit.

### Integration contract (for mutator pipelines)
`applyMutationPlan(...)` should optionally return committed event journal:

```js
{
  ok: true,
  events: [
    { type: 'itemTransferred', itemRef, fromRef, toRef, metadata }
  ]
}
```

Dispatcher emits/broadcasts reaction hooks from this journal post-commit.

### Fallback model
If immediate event dispatch is unavoidable, events must carry transaction id and emit compensating rollback events. This is less preferred.

## Reference Bundle Integration Mapping

### Room View (`room_view` pass)
1. Wrap `evaluateRenderPredicate(...)` with `runReadOnlyHook`.
2. Reuse one pass for all predicates in one render build.

### Capture (`capture` pass)
1. Guard `allowAction` and `captureChecks` evaluation.
2. Attach trace metadata for diagnostics.

### Bubble (`bubble` pass)
1. Keep planner/reaction hooks unguarded unless explicitly declared query-only.
2. If guarded bubble sub-hooks are introduced, run under same pass model.

### Mutation reactions
1. Migrate `addItem/removeItem` monkeypatch patterns to event listeners.
2. For transactional pipelines, trigger script reactions from committed event journal.

## File-by-File Edit Inventory (Core)

### New files
1. `src/HookRunner.js`
2. `src/ReadOnlyView.js`
3. `src/HookMutationContext.js`
4. `src/HookMutationError.js`
5. `types/HookRunner.d.ts`
6. `types/HookMutationContext.d.ts`
7. `types/HookMutationError.d.ts`

### Modified files
1. `src/Room.js` (emit item events + optional sentinel checks)
2. `src/Item.js` (emit container item events + sentinel checks)
3. `src/Character.js` (emit item events + sentinel checks)
4. `src/Player.js` (sentinel in `moveTo`)
5. `src/Npc.js` (sentinel in `moveTo`)
6. `src/BundleManager.js` (optional validation helper integration)
7. `types/Room.d.ts`
8. `types/Item.d.ts`
9. `types/Character.d.ts`
10. `types/Player.d.ts`
11. `types/Npc.d.ts`
12. `types/BundleManager.d.ts`
13. `types/index.d.ts`

Note: transactional journal dispatch likely lands in bundle mutator/dispatcher first, then may move into core if command pipeline standardizes there.

## Test Plan

### New core tests
1. `test/unit/HookRunner.js`
2. `test/unit/ReadOnlyView.js`
3. `test/unit/HookMutationContext.js`
4. `test/unit/HookValidation.js`
5. `test/unit/EntityMutationEvents.js`

### Required cases

#### Guard correctness
1. Blocks direct property mutation in read-only hook.
2. Blocks collection mutators.
3. Dev mode throws `HookMutationError` with full metadata.
4. Prod mode warns and returns fail-closed value.

#### Closure-escape detection
1. Hook mutates via closure-captured room/item; sentinel detects violation.

#### Pass cache
1. Same object wrapped twice in one pass yields same proxy instance.
2. New pass gets new wrapper identity.

#### Hook validation
1. Invalid `renderPredicates` entry (non function/boolean) fails as configured.
2. Invalid `allowAction` non-function is diagnosed.

#### Event emissions
1. `Room.addItem/removeItem` emits expected events exactly once.
2. `Item.addItem/removeItem` emits expected events.
3. `Character.addItem/removeItem` emits expected events.

### Bundle integration tests (reference bundle)
1. Room render predicates evaluated under one `room_view` pass.
2. Capture checks guarded under `capture` pass.
3. Transaction rollback does not leak reaction side effects.
4. Bell tower behavior still deterministic after migration away from monkeypatch wrappers.

### Verification commands
1. `npm test`
2. `npm run typecheck`
3. Bundle repo scenario tests for bell tower flow.

## Performance Validation Plan

### Benchmark
1. Fixture with 20 predicates evaluated 10k times.
2. Compare:
   - per-call fresh wrapping
   - pass-scoped cached wrapping

### Measure
1. `process.hrtime.bigint()` timing.
2. Report p50/p95 and ops/sec.
3. Track memory growth across repeated passes.

### Acceptance target
1. Cached pass model must beat fresh-per-call wrapping.
2. No unbounded memory growth across many passes.

## Rollout Plan

### Phase 1: Core foundation
1. Land `HookRunner`, read-only view, sentinel, diagnostics, tests.
2. Keep `hookGuard.enabled=false` by default.

### Phase 2: Reference bundle adoption
1. Integrate into `room-view` and `capture` phases.
2. Add composition-time validation for `renderPredicates`/`allowAction`.

### Phase 3: Event migration
1. Replace monkeypatch patterns with mutation event listeners.
2. Implement transaction-safe event journal dispatch in mutator pipeline.

### Phase 4: Expansion
1. Extend guard to more query hook sites.
2. Expand hook schemas.

### Phase 5: Default-on decision
1. After compatibility/perf bake period, set `hookGuard.enabled=true`.

## Risks and Mitigations
1. Risk: false positives from broad mutator blocking.
   - Mitigation: explicit mutator allow/block list + staged rollout.
2. Risk: perf overhead from proxy/sentinel.
   - Mitigation: pass cache + benchmark gate.
3. Risk: rollback side effects from early event dispatch.
   - Mitigation: post-commit journal dispatch model.
4. Risk: bundle breakage from validation.
   - Mitigation: prod warn+skip path and migration guide.

## Acceptance Criteria
1. Guarded query hooks never mutate world state.
2. Valid hooks preserve deterministic behavior.
3. Guard overhead is lower than fresh-per-call wrapper model.
4. Diagnostics include phase + hook identity + mutation path + trace context.
5. At least one reference path removes custom read-only wrapper logic.
6. Bell tower-like monkeypatch sync pattern can be replaced with event listeners.
7. Transaction rollback does not leak script-facing reaction side effects.

## Contributor Checklist
1. Implement core guard modules and tests.
2. Add/validate mutation events in core entities.
3. Integrate guarded execution in reference bundle `room_view` and `capture` paths.
4. Add transaction-safe reaction event journal in mutator pipeline.
5. Run perf benchmark and publish numbers.
6. Keep export surface unchanged.

