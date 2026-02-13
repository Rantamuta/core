export = EntityFactory;
/**
 * Stores definitions of entities to allow for easy creation/cloning
 */
declare class EntityFactory {
    entities: Map<string, EntityDefinition>;
    scripts: BehaviorManager;
    /**
     * Create the key used by the entities and scripts maps
     * @param {string} areaName
     * @param {number} id
     * @return {string}
     */
    createEntityRef(area: string, id: number): string;
    /**
     * @param {string} entityRef
     * @return {Object}
     */
    getDefinition(entityRef: string): EntityDefinition | undefined;
    /**
     * @param {string} entityRef
     * @param {Object} def
     */
    setDefinition(entityRef: string, def: EntityDefinition): void;
    /**
     * Add an event listener from a script to a specific item
     * @see BehaviorManager::addListener
     * @param {string}   entityRef
     * @param {string}   event
     * @param {Function} listener
     */
    // Script listener payloads vary by emitted game event.
    addScriptListener(entityRef: string, event: string, listener: (...args: unknown[]) => void): void;
    /**
     * Create a new instance of a given npc definition. Resulting npc will not be held or equipped
     * and will _not_ have its default contents. If you want it to also populate its default contents
     * you must manually call `npc.hydrate(state)`
     *
     * @param {Area}   area
     * @param {string} entityRef
     * @param {Class}  Type      Type of entity to instantiate
     * @return {type}
     */
    createByType<T>(area: Area, entityRef: string, Type: Class<T>): T;
    create(): void;
    /**
     * Clone an existing entity.
     * @param {Item|Npc|Room|Area} entity
     * @return {Item|Npc|Room|Area}
     */
    clone(entity: Item | Npc | Room | Area): Item | Npc | Room | Area;
}
import BehaviorManager = require("./BehaviorManager");
import Area = require("./Area");
import Item = require("./Item");
import Npc = require("./Npc");
import Room = require("./Room");
type Class<T> = new (area: Area, def: EntityDefinition) => T;
type EntityDefinition = {
    entityReference?: string;
    area?: Area;
    id?: string | number;
    // Entity definitions include type-specific keys (items, npcs, rooms, etc.).
    [key: string]: unknown;
};
