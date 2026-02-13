export = Party;
/**
 * Representation of an adventuring party
 */
declare class Party extends Set<Character> {
    constructor(leader: Character);
    invited: Set<Character>;
    leader: Character;
    disband(): void;
    invite(target: Character): void;
    isInvited(target: Character): boolean;
    removeInvite(target: Character): void;
    getBroadcastTargets(): Character[];
}
import Character = require("./Character");
