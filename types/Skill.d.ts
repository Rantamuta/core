export = Skill;
/**
 * @property {function (Effect)} configureEffect modify the skill's effect before adding to player
 * @property {null|number}      cooldownLength When a number > 0 apply a cooldown effect to disallow usage
 *                                       until the cooldown has ended
 * @property {string}           effect Id of the passive effect for this skill
 * @property {Array<SkillFlag>} flags
 * @property {function ()}      info Function to run to display extra info about this skill
 * @property {function ()}      run  Function to run when skill is executed/activated
 * @property {GameState}        state
 * @property {SkillType}        type
 */
declare class Skill {
    /**
     * @param {string} id
     * @param {object} config
     * @param {GameState} state
     */
    constructor(id: string, config: object, state: GameState);
    configureEffect: (effect: Effect) => Effect;
    cooldownGroup: string | null;
    cooldownLength: number | null;
    effect: string | null;
    flags: SkillFlagValue[];
    id: string;
    info: (...args: unknown[]) => string;
    initiatesCombat: boolean;
    name: string;
    options: Record<string, unknown>;
    requiresTarget: boolean;
    resource: SkillResourceCost | SkillResourceCost[] | null;
    run: (...args: unknown[]) => unknown;
    state: GameState;
    targetSelf: boolean;
    type: SkillTypeValue;
    /**
     * perform an active skill
     * @param {string} args
     * @param {Player} player
     * @param {Character} target
     */
    execute(args: string, player: Player, target: Character): boolean;
    /**
     * @param {Player} player
     * @return {boolean} If the player has paid the resource cost(s).
     */
    payResourceCosts(player: Player): boolean;
    payResourceCost(player: Player, resource: SkillResourceCost): void;
    activate(player: Player): void;
    /**
     * @param {Character} character
     * @return {boolean|Effect} If on cooldown returns the cooldown effect
     */
    onCooldown(character: Character): boolean | Effect;
    /**
     * Put this skill on cooldown
     * @param {number} duration Cooldown duration
     * @param {Character} character
     */
    cooldown(character: Character): void;
    getCooldownId(): string;
    /**
     * Create an instance of the cooldown effect for use by cooldown()
     *
     * @private
     * @return {Effect}
     */
    private createCooldownEffect;
    getDefaultCooldownConfig(): {
        config: {
            name: string;
            description: string;
            unique: boolean;
            type: string;
        };
        state: {
            cooldownId: string | null;
        };
        listeners: {
            effectDeactivated: () => void;
        };
    };
    /**
     * @param {Character} character
     * @return {boolean}
     */
    hasEnoughResources(character: Character): boolean;
    /**
     * @param {Character} character
     * @param {{ attribute: string, cost: number}} resource
     * @return {boolean}
     */
    hasEnoughResource(character: Character, resource: {
        attribute: string;
        cost: number;
    }): boolean;
}
import Character = require("./Character");
import Effect = require("./Effect");
import Player = require("./Player");
import GameState = require("./GameState");
import SkillFlag = require("./SkillFlag");
import SkillType = require("./SkillType");
type SkillFlagValue = typeof SkillFlag[keyof typeof SkillFlag];
type SkillTypeValue = typeof SkillType[keyof typeof SkillType];
type SkillResourceCost = {
    attribute: string;
    cost: number;
};
