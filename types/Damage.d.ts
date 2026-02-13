export = Damage;
/**
 * @property {string} attribute Attribute the damage is going to apply to
 * @property {number} amount Initial amount of damage to be done
 * @property {?Character} attacker Character causing the damage
 * @property {*} source Where the damage came from: skill, item, room, etc.
 * @property {Object} metadata Extra info about the damage: type, hidden, critical, etc.
 */
declare class Damage {
    /**
     * @param {string} attribute Attribute the damage is going to apply to
     * @param {number} amount
     * @param {Character} [attacker=null] Character causing the damage
     * @param {*} [source=null] Where the damage came from: skill, item, room, etc.
     * @property {Object} metadata Extra info about the damage: type, hidden, critical, etc.
     */
    // `source` is intentionally open-ended (skill, item, room, environmental trigger, etc.).
    constructor(attribute: string, amount: number, attacker?: Character | null, source?: unknown, metadata?: Record<string, unknown>);
    attacker: Character | null;
    attribute: string;
    amount: number;
    // Source can be any gameplay object (skill, item, room, etc.).
    source: unknown;
    metadata: Record<string, unknown>;
    /**
     * Evaluate actual damage taking attacker/target's effects into account
     * @param {Character} target
     * @return {number} Final damage amount
     */
    evaluate(target: Character): number;
    /**
     * Actually lower the attribute
     * @param {Character} target
     * @fires Character#hit
     * @fires Character#damaged
     */
    commit(target: Character): void;
}
import Character = require("./Character");
