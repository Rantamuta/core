export = PartyManager;
/**
 * Keeps track of active in game parties and is used to create new parties
 * @extends Set
 */
declare class PartyManager extends Set<Party> {
    constructor(values?: readonly Party[]);
    constructor(iterable?: Iterable<Party>);
    /**
     * Create a new party from with a given leader
     * @param {Player} leader
     */
    create(leader: Player): void;
    /**
     * @param {Party} party
     */
    disband(party: Party): void;
}
import Party = require("./Party");
import Player = require("./Player");
