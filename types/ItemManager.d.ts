export = ItemManager;
/**
 * Keep track of all items in game
 */
declare class ItemManager {
    items: Set<Item>;
    add(item: Item): void;
    remove(item: Item): void;
    /**
     * @fires Item#updateTick
     */
    tickAll(): void;
}
import Item = require("./Item");
