/**
 * Representation of a `Character` or container `Item` inventory
 * @extends Map
 */
export class Inventory extends Map<string, Item | SerializedInventoryItem> {
    /**
     * @param {object} init
     * @param {Array<Item>} init.items
     * @param {number} init.max Max number of items this inventory can hold
     */
    constructor(init: {
        items?: Array<readonly [string, Item | SerializedInventoryItem]>;
        max?: number;
    });
    maxSize: number;
    /**
     * @param {number} size
     */
    setMax(size: number): void;
    /**
     * @return {number}
     */
    getMax(): number;
    /**
     * @return {boolean}
     */
    get isFull(): boolean;
    /**
     * @param {Item} item
     */
    addItem(item: Item): void;
    /**
     * @param {Item} item
     */
    removeItem(item: Item): void;
    serialize(): {
        items: Array<[string, ReturnType<Item["serialize"]>]>;
        max: number;
    };
    /**
     * @param {GameState} state
     * @param {Character|Item} carriedBy
     */
    hydrate(state: GameState, carriedBy: Character | import("./Item")): void;
}
/**
 * @extends Error
 */
export class InventoryFullError extends Error {
}
import Character = require("./Character");
import Item = require("./Item");
import GameState = require("./GameState");
type SerializedInventoryItem = {
    entityReference?: string;
    inventory?: {
        items: Array<[string, unknown]>;
        max: number;
    };
    // Serialized item payload may include arbitrary item-specific fields.
    [key: string]: unknown;
};
