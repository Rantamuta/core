export = Item;
/**
 * @property {Area}    area        Area the item belongs to (warning: this is not the area is currently in but the
 *                                 area it belongs to on a fresh load)
 * @property {object}  metadata    Essentially a blob of whatever attrs the item designer wanted to add
 * @property {Array}   behaviors   list of behaviors this object uses
 * @property {string}  description Long description seen when looking at it
 * @property {number}  id          vnum
 * @property {boolean} isEquipped  Whether or not item is currently equipped
 * @property {?Character} equippedBy Entity that has this equipped
 * @property {Map}     inventory   Current items this item contains
 * @property {string}  name        Name shown in inventory and when equipped
 * @property {?Room}   room        Room the item is currently in
 * @property {string}  roomDesc    Description shown when item is seen in a room
 * @property {string}  script      A custom script for this item
 * @property {ItemType|string} type
 * @property {string}  uuid        UUID differentiating all instances of this item
 * @property {boolean} closeable   Whether this item can be closed (Default: false, true if closed or locked is true)
 * @property {boolean} closed      Whether this item is closed
 * @property {boolean} locked      Whether this item is locked
 * @property {?entityReference} lockedBy Item that locks/unlocks this item
 * @property {?(Character|Item)} carriedBy Entity that has this in its Inventory
 *
 * @extends GameEntity
 */
declare class Item extends GameEntity {
    constructor(area: Area | string, item: ItemDefinition);
    area: Area | string;
    metadata: Record<string, unknown>;
    behaviors: Map<string, unknown>;
    defaultItems: EntityReference[];
    description: string;
    entityReference: EntityReference;
    id: string | number;
    maxItems: number;
    isEquipped: boolean;
    keywords: string[];
    name: string;
    room: Room | null;
    roomDesc: string;
    script: string | null;
    type: ItemTypeValue | string;
    uuid: string;
    closeable: boolean;
    closed: boolean;
    locked: boolean;
    lockedBy: EntityReference | null;
    carriedBy: Character | Item | null;
    equippedBy: Character | null;
    /**
     * Create an Inventory object from a serialized inventory
     * @param {object} inventory Serialized inventory
     */
    initializeInventory(inventory: ConstructorParameters<typeof Inventory>[0] | null | undefined): void;
    inventory: Inventory | null;
    hasKeyword(keyword: string): boolean;
    /**
     * Add an item to this item's inventory
     * @param {Item} item
     */
    addItem(item: Item): void;
    /**
     * Remove an item from this item's inventory
     * @param {Item} item
     */
    removeItem(item: Item): void;
    /**
     * @return {boolean}
     */
    isInventoryFull(): boolean;
    _setupInventory(): void;
    /**
     * Helper to find the game entity that ultimately has this item in their
     * Inventory in the case of nested containers. Could be an item, player, or
     * @return {Character|Item|null} owner
     */
    findCarrier(): Character | Item | null;
    /**
     * Open a container-like object
     */
    open(): void;
    /**
     * Close a container-like object
     */
    close(): void;
    /**
     * Lock a container-like object
     */
    lock(): void;
    /**
     * Unlock a container-like object
     */
    unlock(): void;
    hydrate(state: GameState, serialized?: Partial<SerializedItem>): boolean | void;
    __hydrated: boolean;
    serialize(): {
        entityReference: EntityReference;
        inventory: ReturnType<Inventory["serialize"]> | null;
        metadata: Record<string, unknown>;
        description: string;
        keywords: string[];
        name: string;
        roomDesc: string;
        closed: boolean;
        locked: boolean;
        behaviors: Record<string, unknown>;
    };
}
import GameEntity = require("./GameEntity");
import { Inventory } from "./Inventory";
import Character = require("./Character");
import Area = require("./Area");
import Room = require("./Room");
import ItemType = require("./ItemType");
import GameState = require("./GameState");
type EntityReference = string;
type ItemTypeValue = typeof ItemType[keyof typeof ItemType];
type ItemDefinition = {
    keywords: string[];
    name: string;
    id: string | number;
    metadata?: Record<string, unknown>;
    behaviors?: Record<string, unknown>;
    items?: EntityReference[];
    description?: string;
    entityReference?: EntityReference;
    maxItems?: number;
    inventory?: ConstructorParameters<typeof Inventory>[0] | null;
    isEquipped?: boolean;
    room?: Room | null;
    roomDesc?: string;
    script?: string | null;
    type?: ItemTypeValue | string;
    uuid?: string;
    closeable?: boolean;
    closed?: boolean;
    locked?: boolean;
    lockedBy?: EntityReference | null;
};
type SerializedItem = ReturnType<Item["serialize"]>;
