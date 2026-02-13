export = Room;
/**
 * @property {Area}          area         Area room is in
 * @property {{x: number, y: number, z: number}} [coordinates] Defined in yml with array [x, y, z]. Retrieved with coordinates.x, coordinates.y, ...
 * @property {Array<number>} defaultItems Default list of item ids that should load in this room
 * @property {Array<number>} defaultNpcs  Default list of npc ids that should load in this room
 * @property {string}        description  Room description seen on 'look'
 * @property {Array<object>} exits        Exits out of this room { id: number, direction: string }
 * @property {number}        id           Area-relative id (vnum)
 * @property {Set}           items        Items currently in the room
 * @property {Set}           npcs         Npcs currently in the room
 * @property {Set}           players      Players currently in the room
 * @property {string}        script       Name of custom script attached to this room
 * @property {string}        title        Title shown on look/scan
 * @property {object}        doors        Doors restricting access to this room. See documentation for format
 *
 * @extends GameEntity
 */
declare class Room extends GameEntity {
    constructor(area: Area, def: RoomDefinition);
    def: RoomDefinition;
    area: Area;
    defaultItems: SpawnReference[];
    defaultNpcs: SpawnReference[];
    metadata: Record<string, unknown>;
    script?: string | null;
    behaviors: Map<string, unknown>;
    coordinates: RoomCoordinates | null;
    description: string;
    entityReference: string;
    exits: RoomExit[];
    id: string | number;
    title: string;
    doors: Map<string, RoomDoor>;
    defaultDoors?: Record<string, RoomDoor>;
    items: Set<Item>;
    npcs: Set<Npc>;
    players: Set<Player>;
    /**
     * spawnedNpcs keeps track of NPCs even when they leave the room for the purposes of respawn. So if we spawn NPC A
     * into the room and it walks away we don't want to respawn the NPC until it's killed or otherwise removed from the
     * area
     */
    spawnedNpcs: Set<Npc>;
    /**
     * @param {Player} player
     */
    addPlayer(player: Player): void;
    /**
     * @param {Player} player
     */
    removePlayer(player: Player): void;
    /**
     * @param {Npc} npc
     */
    addNpc(npc: Npc): void;
    /**
     * @param {Npc} npc
     * @param {boolean} removeSpawn
     */
    removeNpc(npc: Npc, removeSpawn?: boolean): void;
    /**
     * @param {Item} item
     */
    addItem(item: Item): void;
    /**
     * @param {Item} item
     */
    removeItem(item: Item): void;
    /**
     * Get exits for a room. Both inferred from coordinates and  defined in the
     * 'exits' property.
     *
     * @return {Array<{ id: string, direction: string, inferred: boolean, room: Room= }>}
     */
    getExits(): Array<{
        id: string | number;
        roomId?: string;
        direction: string;
        inferred: boolean;
        [key: string]: unknown;
    }>;
    /**
     * Get the exit definition of a room's exit by searching the exit name
     * @param {string} exitName exit name search
     * @return {false|Object}
     */
    findExit(exitName: string): false | RoomExit;
    /**
     * Get the exit definition of a room's exit to a given room
     * @param {Room} nextRoom
     * @return {false|Object}
     */
    getExitToRoom(nextRoom: Room): false | RoomExit;
    /**
     * Check to see if this room has a door preventing movement from `fromRoom` to here
     * @param {Room} fromRoom
     * @return {boolean}
     */
    hasDoor(fromRoom: Room): boolean;
    /**
     * @param {Room} fromRoom
     * @return {{lockedBy: EntityReference, locked: boolean, closed: boolean}}
     */
    getDoor(fromRoom: Room | null | undefined): RoomDoor | null | undefined;
    /**
     * Check to see of the door for `fromRoom` is locked
     * @param {Room} fromRoom
     * @return {boolean}
     */
    isDoorLocked(fromRoom: Room): boolean;
    /**
     * @param {Room} fromRoom
     */
    openDoor(fromRoom: Room): void;
    /**
     * @param {Room} fromRoom
     */
    closeDoor(fromRoom: Room): void;
    /**
     * @param {Room} fromRoom
     */
    unlockDoor(fromRoom: Room): void;
    /**
     * @param {Room} fromRoom
     */
    lockDoor(fromRoom: Room): void;
    /**
     * @param {GameState} state
     * @param {string} entityRef
     * @return {Item} The newly created item
     */
    spawnItem(state: GameState, entityRef: string): Item;
    /**
     * @param {GameState} state
     * @param {string} entityRef
     * @fires Npc#spawn
     * @return {Npc}
     */
    spawnNpc(state: GameState, entityRef: string): Npc;
    hydrate(state: GameState): void;
    /**
     * Used by Broadcaster
     * @return {Array<Character>}
     */
    getBroadcastTargets(): Array<Room | Character>;
}
import Area = require("./Area");
import GameEntity = require("./GameEntity");
import Character = require("./Character");
import Item = require("./Item");
import Npc = require("./Npc");
import Player = require("./Player");
import GameState = require("./GameState");

type EntityReference = string;
type SpawnReference = string | {
    id: string;
};
type RoomCoordinates = {
    x: number;
    y: number;
    z: number;
};
type RoomDoor = {
    lockedBy?: EntityReference;
    locked: boolean;
    closed: boolean;
    [key: string]: unknown;
};
type RoomExit = {
    id?: string | number;
    roomId?: string;
    direction: string;
    inferred?: boolean;
    [key: string]: unknown;
};
type RoomDefinition = {
    id: string | number;
    title: string;
    description: string;
    coordinates?: [number, number, number];
    items?: SpawnReference[];
    npcs?: SpawnReference[];
    metadata?: Record<string, unknown>;
    script?: string | null;
    behaviors?: Record<string, unknown>;
    exits?: RoomExit[];
    doors?: Record<string, RoomDoor>;
};
