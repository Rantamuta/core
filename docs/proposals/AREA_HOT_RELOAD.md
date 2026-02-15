# Area Hot Reload Proposal (Non-Disruptive Runtime Reload)

Status: Proposed  
Owner: Core maintainers  
Last updated: 2026-02-15

## Purpose
Enable reloading a single area at runtime so connected players are not disconnected and player-held items remain in place, while room/NPC/world-item content and scripts for that area are refreshed from disk.

This document is an implementation specification, not a brainstorming note.

## Goals
1. Reload one loaded area without server restart.
2. Keep all connected players online during reload.
3. Preserve player inventory and equipment objects.
4. Reset area world state (rooms/NPC spawns/room items) to freshly loaded definitions.
5. Apply updated area/room/NPC/item scripts for newly hydrated world entities.
6. Provide rollback so a failed reload leaves the previous area live.

## Non-Goals
1. No change to entrypoint or export strategy (`index.js`, `main`, exports map).
2. No ESM migration.
3. No global bundle hot-reload in this phase (area-only).
4. No guarantees that already-held item script listeners are live-patched in place.
5. No command UX in core by default; downstream bundles can call the new API.

## Compatibility Constraints
1. Preserve public API compatibility for existing methods.
2. New behavior must be additive.
3. CommonJS runtime remains default.
4. Strict mode duplicate behavior must remain unchanged outside explicit reload flow.

## Current Behavior Summary
1. Bundle loading is startup-oriented; areas are loaded and hydrated once (`src/BundleManager.js`).
2. Area hydration creates room instances, room default items, and room default NPCs (`src/Area.js`, `src/Room.js`).
3. Script listeners are attached during create/hydrate from factory behavior registries (`src/EntityFactory.js`, `src/Scriptable.js`).
4. There is no area transaction/swap API today; manager APIs are add/remove primitives (`src/AreaManager.js`, `src/RoomManager.js`, `src/ItemManager.js`, `src/MobManager.js`).
5. `require()` cache is not invalidated for area scripts during runtime reload attempts (`src/BundleManager.js`).

## Required Runtime Invariants
1. Player socket/session continuity: no forced disconnects.
2. Player objects remain hydrated and in `PlayerManager`.
3. Player inventory/equipment object identity is preserved.
4. Reload is atomic from player perspective: either old area stays or new area fully replaces it.
5. All old world NPCs/items in the reloaded area are pruned.
6. New room map and definitions become authoritative for movement/lookups.

## Proposed Public API
Add one public method to `BundleManager`:

```js
async reloadArea(areaName, options = {})
```

Return shape:

```js
{
  ok: true,
  areaName: 'midgaard',
  bundle: 'world',
  durationMs: 42,
  playersRebound: 3,
  playersFallback: 1,
  roomsAdded: ['midgaard:100', 'midgaard:101'],
  roomsRemoved: ['midgaard:102']
}
```

Error behavior:
1. Throw on precondition failure (invalid area, reload already in progress for area).
2. Throw on load/hydrate failure after rollback attempt.
3. Include `cause` when wrapping lower-level errors.

## Options Contract
`options` (all optional):
1. `silentRebind` (boolean, default `true`): move players to replacement rooms without enter/leave events.
2. `fallbackRoom` (string | null, default `null`): explicit fallback `entityRef`; if null use placeholder room.
3. `invalidateRequireCache` (boolean, default `true`): clear `require.cache` under the area scripts directory before reload.

## Locked Design Decisions
1. Area reload is transactional and area-scoped, not bundle-scoped.
2. Existing player-held items remain as-is; they are not recreated during reload.
3. World NPCs and world items in the area are always reset.
4. Players are rebound by room id (`room.id`) when available; otherwise fallback room.
5. A per-area reload lock prevents concurrent reloads for the same area.

## Implementation Blueprint

### Phase A: Scoped Removal Helpers (foundation)
Add minimal helper methods to avoid direct Map mutation from `BundleManager`.

#### A1. `src/BehaviorManager.js`
Add methods:
1. `remove(name)`
2. `clear()`

#### A2. `src/EntityFactory.js`
Add methods:
1. `hasDefinition(entityRef)`
2. `removeDefinition(entityRef)`
3. `removeScript(entityRef)`

#### A3. `src/QuestFactory.js`
Add methods:
1. `remove(qid)`
2. `removeByArea(areaName)`
3. `getByArea(areaName)` (returns array of qids)

#### A4. `src/RoomManager.js`
Add method:
1. `removeByArea(areaName)` (remove all `rooms` entries with `entityRef` prefix `${areaName}:`)

#### A5. Type updates
Update:
1. `types/BehaviorManager.d.ts`
2. `types/EntityFactory.d.ts`
3. `types/QuestFactory.d.ts`
4. `types/RoomManager.d.ts`

### Phase B: BundleManager Area Reload Transaction

#### B1. Add public method in `src/BundleManager.js`
1. `async reloadArea(areaName, options = {})`

#### B2. Add private helpers in `src/BundleManager.js`
1. `_assertReloadPreconditions(areaName)`
2. `_collectAreaPlayerBindings(area)`
3. `_captureAreaDefinitionSnapshot(areaName)`
4. `_purgeAreaDefinitionScope(areaName)`
5. `_invalidateAreaScriptRequireCache(bundle, areaName)`
6. `_hydrateStagedArea(areaName)`
7. `_removeOldAreaRuntimeEntities(oldArea)`
8. `_bindPlayersToReplacementRooms(bindings, newArea, options)`
9. `_restoreAreaDefinitionSnapshot(snapshot)`
10. `_getFallbackRoom(options)`

#### B3. Add reload lock field
In constructor:
1. `this._areaReloadLocks = new Set();`

### Phase C: Reload Algorithm (exact order)

```text
1) Validate and lock area.
2) Resolve old area and bundle.
3) Capture player bindings from old area rooms.
4) Snapshot current area-scoped definitions/scripts/quests.
5) Purge area-scoped definitions/scripts/quests from factories.
6) Invalidate area script require cache (optional).
7) Load fresh area definitions via existing loaders (manifest, quests, entities, scripts).
8) Hydrate staged area using temporary Room/Item/Mob managers (not live managers).
9) Commit swap:
   9.1) Remove old world NPCs/items/rooms for the area from live managers.
   9.2) Replace area in AreaManager.
   9.3) Register staged rooms/items/NPCs into live managers.
   9.4) Rebind players to matching room ids, fallback when missing.
10) Unlock and return summary.
11) On any error after step 4, restore snapshot and unlock, then throw.
```

### Phase D: Commit Details (non-ambiguous)

#### D1. Player binding capture
Store each binding as:

```js
{
  player,
  previousRoomRef: player.room.entityReference,
  previousRoomId: player.room.id,
}
```

Use only players physically in `oldArea.rooms` sets.

#### D2. Staged hydrate state
Create a shallow `stageState` clone with temporary managers:
1. `RoomManager`
2. `ItemManager`
3. `MobManager`

Keep all other state references identical.

#### D3. Old runtime teardown
For each old area room:
1. Remove non-player items in room via `ItemManager.remove`.
2. Remove NPCs via `MobManager.removeMob`.
3. Remove room from live `RoomManager`.

Then remove old area from `AreaManager`.

#### D4. New runtime registration
1. Add staged area into `AreaManager`.
2. Add every staged room into live `RoomManager`.
3. Add every staged item into live `ItemManager`.
4. Add every staged NPC into live `MobManager`.

#### D5. Player rebind
1. Map by `previousRoomId` into new area `rooms` map.
2. If missing, send player to fallback room.
3. Default fallback is placeholder room from `AreaManager.getPlaceholderArea()`.
4. If `silentRebind` is true:
   - remove player from old room set directly
   - set `player.room = targetRoom`
   - add player to target room set directly
5. If `silentRebind` is false, use `player.moveTo(targetRoom)`.

### Phase E: Rollback Details
Rollback trigger: any exception between purge and commit completion.

Rollback actions:
1. Purge partially loaded area-scoped definitions again.
2. Restore snapshot definitions/scripts/quests.
3. Keep old area instance in `AreaManager` if it was never removed.
4. If old area was removed during a partial commit, re-add old area and old rooms to live managers.
5. Rebind players back to previous room refs where possible, otherwise fallback room.
6. Unlock area and rethrow wrapped error.

## Definition Scope Rules
Area-scoped keys to purge/restore are exact and mandatory:
1. `AreaFactory.entities` key: `${areaName}`
2. `AreaFactory.scripts` key: `${areaName}`
3. `RoomFactory.entities/scripts` keys with prefix `${areaName}:`
4. `ItemFactory.entities/scripts` keys with prefix `${areaName}:`
5. `MobFactory.entities/scripts` keys with prefix `${areaName}:`
6. `QuestFactory.quests` keys with prefix `${areaName}:`

No other registries are modified in area reload v1.

## Require Cache Invalidation Rules
1. Invalidate cache entries whose absolute path starts with `<bundlesPath>/<bundle>/areas/<areaName>/scripts/`.
2. Do not invalidate global bundle modules outside that subtree in v1.
3. If directory does not exist, skip with no error.

## File-by-File Edit Inventory

### Production JS
1. `src/BehaviorManager.js` add `remove`, `clear`.
2. `src/EntityFactory.js` add scoped definition/script removal helpers.
3. `src/QuestFactory.js` add area-scoped query/removal helpers.
4. `src/RoomManager.js` add `removeByArea` helper.
5. `src/BundleManager.js` add `reloadArea` transaction and private helpers.

### Type Definitions
1. `types/BehaviorManager.d.ts`
2. `types/EntityFactory.d.ts`
3. `types/QuestFactory.d.ts`
4. `types/RoomManager.d.ts`
5. `types/BundleManager.d.ts`

### Tests
1. `test/unit/BundleManagerAreaReload.js` new.
2. `test/unit/QuestFactory.js` new or append existing equivalent for new helpers.
3. `test/unit/RoomManager.js` new or append equivalent for `removeByArea`.

## Test Plan (must exist before merge)

### Core reload behavior
`test/unit/BundleManagerAreaReload.js` cases:
1. Reload success updates room definitions and keeps player connected.
2. Player in removed room is sent to fallback room.
3. Player inventory/equipment object identity is unchanged after reload.
4. World NPCs/items from old area are removed and replaced by staged ones.
5. Area script change is applied when require cache invalidation is enabled.
6. Reload failure restores previous definitions and leaves old area active.
7. Concurrent reload of same area throws a lock error.

### Helper behavior
1. QuestFactory area-scoped remove/query works for mixed-area quest sets.
2. RoomManager `removeByArea` only removes matching area rooms.
3. EntityFactory remove methods only remove targeted keys.

### Verification commands
1. `npm test -- test/unit/BundleManagerAreaReload.js`
2. `npm test`
3. `npm run typecheck`

## Acceptance Criteria
1. A downstream admin command can call `BundleManager.reloadArea('areaName')` during runtime.
2. No connected players are disconnected as a side effect.
3. Players in unaffected rooms of the area remain in equivalent rooms after reload by id.
4. If a room was deleted, players are moved safely to fallback.
5. Updated area scripts are applied for area/room/NPC/item instances created by the new hydrate cycle.
6. On failure, old area remains usable and no partial area state is left active.

## Operational Logging Requirements
Add verbose/info logs in `reloadArea` with these checkpoints:
1. start (`area`, `bundle`)
2. snapshot captured counts
3. cache invalidation count
4. staged hydrate counts (`rooms`, `items`, `npcs`)
5. commit completion summary (`playersRebound`, `playersFallback`, elapsed)
6. rollback invocation summary on failure

## Risk Register
1. Listener duplication from script reattachment.
   - Mitigation: purge script scopes before reloading definitions.
2. Partial commit leaving mixed old/new entities.
   - Mitigation: transactional order and rollback path.
3. Player references to deleted rooms.
   - Mitigation: explicit fallback rebind policy.
4. Combat links to removed NPCs.
   - Mitigation: remove NPCs through `MobManager.removeMob` and ensure combat cleanup in reload flow before prune if needed.

## Open Follow-Up (not required for v1)
1. Optional downstream-facing built-in command wrapper (`reload area <name>`).
2. Optional hot-reload of non-area bundle content (commands, skills, channels).
3. Optional in-place rebind of carried item scripts.

## Contributor Execution Checklist
1. Implement Phase A helpers and tests.
2. Implement `BundleManager.reloadArea` with lock, snapshot, purge, stage, commit, rollback.
3. Add/adjust type definitions for new APIs.
4. Add unit tests listed above.
5. Run verification commands.
6. Ensure no entrypoint/export changes.

