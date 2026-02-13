export = AreaFactory;
/**
 * Stores definitions of items to allow for easy creation/cloning of objects
 */
declare class AreaFactory extends EntityFactory {
    /**
     * Create a new instance of an area by name. Resulting area will not have
     * any of its contained entities (items, npcs, rooms) hydrated. You will
     * need to call `area.hydrate(state)`
     *
     * @param {GameState} state
     * @param {string} bundle Name of this bundle this area is defined in
     * @param {string} entityRef Area name
     * @return {Area}
     */
    create(entityRef?: string): Area;
    /**
     * @see AreaFactory#create
     */
    clone(area: Area): Area;
}
import EntityFactory = require("./EntityFactory");
import Area = require("./Area");
