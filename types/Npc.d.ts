export = Npc;
/**
 * @property {number} id   Area-relative id (vnum)
 * @property {Area}   area Area npc belongs to (not necessarily the area they're currently in)
 * @property {Map} behaviors
 * @extends Character
 * @mixes Scriptable
 */
declare class Npc extends Character {
    constructor(area: Area, data: NpcDefinition);
    area: Area;
    script?: string;
    behaviors: Map<string, unknown>;
    equipment: Map<string, Item>;
    defaultEquipment: Record<string, string>;
    defaultItems: string[];
    description?: string;
    entityReference: string;
    id: string | number;
    keywords: string[];
    quests: string[];
    uuid: string;
    commandQueue: CommandQueue;
    /**
     * Move the npc to the given room, emitting events appropriately
     * @param {Room} nextRoom
     * @param {function} onMoved Function to run after the npc is moved to the next room but before enter events are fired
     * @fires Room#npcLeave
     * @fires Room#npcEnter
     * @fires Npc#enterRoom
     */
    moveTo(nextRoom: Room, onMoved?: () => void): void;
    hydrate(state: GameState): void;
}
import Character = require("./Character");
import CommandQueue = require("./CommandQueue");
import Room = require("./Room");
import Area = require("./Area");
import Item = require("./Item");
import GameState = require("./GameState");
type NpcDefinition = {
    keywords: string[];
    name: string;
    id: string | number;
    area: Area;
    script?: string;
    behaviors?: Record<string, unknown>;
    equipment?: Record<string, string>;
    items?: string[];
    description?: string;
    entityReference: string;
    quests?: string[];
    uuid?: string;
    // NPC definitions include type-specific extension fields from bundles.
    [key: string]: unknown;
};
