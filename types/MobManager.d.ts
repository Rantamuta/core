export = MobManager;
/**
 * Keeps track of all the individual mobs in the game
 */
declare class MobManager {
    mobs: Map<string, Npc>;
    /**
     * @param {Mob} mob
     */
    addMob(mob: Mob): void;
    /**
     * Completely obliterate a mob from the game, nuclear option
     * @param {Mob} mob
     */
    removeMob(mob: Mob): void;
}
import Npc = require("./Npc");
type Mob = Npc;
