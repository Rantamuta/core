export = Area;
/**
 * Representation of an in game area
 * See the {@link http://ranviermud.com/extending/areas/|Area guide} for documentation on how to
 * actually build areas.
 *
 * @property {string} bundle Bundle this area comes from
 * @property {string} name
 * @property {string} title
 * @property {string} script A custom script for this item
 * @property {Map}    map a Map object keyed by the floor z-index, each floor is an array with [x][y] indexes for coordinates.
 * @property {Map<string, Room>} rooms Map of room id to Room
 * @property {Set<Npc>} npcs Active NPCs that originate from this area. Note: this is NPCs that
 *   _originate_ from this area. An NPC may not actually be in this area at unknown given moment.
 * @property {Object} info Area configuration
 * @property {Number} lastRespawnTick milliseconds since last respawn tick. See {@link Area#update}
 *
 * @extends GameEntity
 */
declare class Area extends GameEntity {
    constructor(bundle: string | null, name: string, manifest: AreaManifest);
    bundle: string | null;
    name: string;
    title: string;
    metadata: Record<string, unknown>;
    rooms: Map<string | number, Room>;
    npcs: Set<Npc>;
    map: Map<number, AreaFloor>;
    script?: string | null;
    behaviors: Map<string, unknown>;
    /**
     * Get ranvier-root-relative path to this area
     * @return {string}
     */
    get areaPath(): string;
    /**
     * Get an ordered list of floors in this area's map
     * @return {Array<number>}
     */
    get floors(): Array<number>;
    /**
     * @param {string} id Room id
     * @return {Room|undefined}
     */
    getRoomById(id: string | number): Room | undefined;
    /**
     * @param {Room} room
     * @fires Area#roomAdded
     */
    addRoom(room: Room): void;
    /**
     * @param {Room} room
     * @fires Area#roomRemoved
     */
    removeRoom(room: Room): void;
    /**
     * @param {Room} room
     * @throws Error
     */
    addRoomToMap(room: Room): void;
    /**
     * find a room at the given coordinates for this area
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {Room|boolean}
     */
    getRoomAtCoordinates(x: number, y: number, z: number): Room | undefined;
    /**
     * @param {Npc} npc
     */
    addNpc(npc: Npc): void;
    /**
     * Removes an NPC from the area. NOTE: This must manually remove the NPC from its room as well
     * @param {Npc} npc
     */
    removeNpc(npc: Npc): void;
    /**
     * This method is automatically called every N milliseconds where N is defined in the
     * `setInterval` call to `GameState.AreaMAnager.tickAll` in the `ranvier` executable. It, in turn,
     * will fire the `updateTick` event on all its rooms and npcs
     *
     * @param {GameState} state
     * @fires Room#updateTick
     * @fires Npc#updateTick
     */
    update(state: GameState): void;
    hydrate(state: GameState): void;
    /**
     * Get all possible broadcast targets within an area. This includes all npcs,
     * players, rooms, and the area itself
     * @return {Array<Broadcastable>}
     */
    getBroadcastTargets(): Array<Broadcastable>;
}
import GameEntity = require("./GameEntity");
import AreaFloor = require("./AreaFloor");
import Npc = require("./Npc");
import Room = require("./Room");
import type { Broadcastable } from "./Broadcastable";
import GameState = require("./GameState");

type AreaManifest = {
    title: string;
    metadata?: Record<string, unknown>;
    script?: string | null;
    behaviors?: Record<string, unknown>;
};
