export = Character;
/**
 * The Character class acts as the base for both NPCs and Players.
 *
 * @property {string}     name       Name shown on look/who/login
 * @property {Inventory}  inventory
 * @property {Set}        combatants Enemies this character is currently in combat with
 * @property {number}     level
 * @property {Attributes} attributes
 * @property {EffectList} effects    List of current effects applied to the character
 * @property {Room}       room       Room the character is currently in
 *
 * @extends EventEmitter
 * @mixes Metadatable
 */
declare class Character extends EventEmitter {
    constructor(data: CharacterData);
    name: string;
    inventory: Inventory | null;
    equipment: Map<string, Item>;
    combatants: Set<Character>;
    combatData: {
        lag?: number | null;
        roundStarted?: number;
    };
    level: number;
    room: Room | null;
    attributes: Attributes | CharacterAttributesConfig;
    followers: Set<Character>;
    following: Character | null;
    party: Party | null;
    effects: EffectList;
    metadata: Record<string, unknown>;
    /**
     * @param {string} attr Attribute name
     * @return {boolean}
     */
    hasAttribute(attr: string): boolean;
    /**
     * Get current maximum value of attribute (as modified by effects.)
     * @param {string} attr
     * @return {number}
     */
    getMaxAttribute(attr: string): number;
    /**
     * @see {@link Attributes#add}
     */
    addAttribute(attribute: Attribute): void;
    /**
     * Get the current value of an attribute (base modified by delta)
     * @param {string} attr
     * @return {number}
    */
    getAttribute(attr: string): number;
    /**
     * Get the base value for a given attribute
     * @param {string} attr Attribute name
     * @return {number}
     */
    getBaseAttribute(attr: string): number;
    /**
     * Fired when a Character's attribute is set, raised, or lowered
     * @event Character#attributeUpdate
     * @param {string} attributeName
     * @param {Attribute} attribute
     */
    /**
     * Clears unknown changes to the attribute, setting it to its base value.
     * @param {string} attr
     * @fires Character#attributeUpdate
    */
    setAttributeToMax(attr: string): void;
    /**
     * Raise an attribute by name
     * @param {string} attr
     * @param {number} amount
     * @see {@link Attributes#raise}
     * @fires Character#attributeUpdate
    */
    raiseAttribute(attr: string, amount: number): void;
    /**
     * Lower an attribute by name
     * @param {string} attr
     * @param {number} amount
     * @see {@link Attributes#lower}
     * @fires Character#attributeUpdate
    */
    lowerAttribute(attr: string, amount: number): void;
    /**
     * Update an attribute's base value.
     *
     * NOTE: You _probably_ don't want to use this the way you think you do. You should not use this
     * for unknown temporary modifications to an attribute, instead you should use an Effect modifier.
     *
     * This will _permanently_ update the base value for an attribute to be used for things like a
     * player purchasing a permanent upgrade or increasing a stat on level up
     *
     * @param {string} attr Attribute name
     * @param {number} newBase New base value
     * @fires Character#attributeUpdate
     */
    setAttributeBase(attr: string, newBase: number): void;
    /**
     * @param {string} type
     * @return {boolean}
     * @see {@link Effect}
     */
    hasEffectType(type: string): boolean;
    /**
     * @param {Effect} effect
     * @return {boolean}
     */
    addEffect(effect: Effect): boolean;
    /**
     * @param {Effect} effect
     * @see {@link Effect#remove}
     */
    removeEffect(effect: Effect): void;
    /**
     * Start combat with a given target.
     * @param {Character} target
     * @param {?number}   lag    Optional milliseconds of lag to apply before the first attack
     * @fires Character#combatStart
     */
    initiateCombat(target: Character, lag?: number | null): void;
    /**
     * Check to see if this character is currently in combat or if they are
     * currently in combat with a specific character
     * @param {?Character} target
     * @return boolean
     */
    isInCombat(target: Character | null): boolean;
    /**
     * @param {Character} target
     * @fires Character#combatantAdded
     */
    addCombatant(target: Character): void;
    /**
     * @param {Character} target
     * @fires Character#combatantRemoved
     * @fires Character#combatEnd
     */
    removeCombatant(target: Character): void;
    /**
     * Fully remove this character from combat
     */
    removeFromCombat(): void;
    /**
     * @see EffectList.evaluateIncomingDamage
     * @param {Damage} damage
     * @return {number}
     */
    evaluateIncomingDamage(damage: Damage, currentAmount: number): number;
    /**
     * @see EffectList.evaluateOutgoingDamage
     * @param {Damage} damage
     * @param {number} currentAmount
     * @return {number}
     */
    evaluateOutgoingDamage(damage: Damage, currentAmount: number): number;
    /**
     * @param {Item} item
     * @param {string} slot Slot to equip the item in
     *
     * @throws EquipSlotTakenError
     * @throws EquipAlreadyEquippedError
     * @fires Character#equip
     * @fires Item#equip
     */
    equip(item: Item, slot: string): void;
    /**
     * Remove equipment in a given slot and move it to the character's inventory
     * @param {string} slot
     *
     * @throws InventoryFullError
     * @fires Item#unequip
     * @fires Character#unequip
     */
    unequip(slot: string): void;
    /**
     * Move an item to the character's inventory
     * @param {Item} item
     */
    addItem(item: Item): void;
    /**
     * Remove an item from the character's inventory. Warning: This does not automatically place the
     * item in unknown particular place. You will need to manually add it to the room or another
     * character's inventory
     * @param {Item} item
     */
    removeItem(item: Item): void;
    /**
     * Check to see if this character has a particular item by EntityReference
     * @param {EntityReference} itemReference
     * @return {Item|boolean}
     */
    hasItem(itemReference: EntityReference): Item | boolean;
    /**
     * @return {boolean}
     */
    isInventoryFull(): boolean;
    /**
     * @private
     */
    private _setupInventory;
    /**
     * Begin following another character. If the character follows itself they stop following.
     * @param {Character} target
     */
    follow(target: Character): void;
    /**
     * Stop following whoever the character was following
     * @fires Character#unfollowed
     */
    unfollow(): void;
    /**
     * @param {Character} follower
     * @fires Character#gainedFollower
     */
    addFollower(follower: Character): void;
    /**
     * @param {Character} follower
     * @fires Character#lostFollower
     */
    removeFollower(follower: Character): void;
    /**
     * @param {Character} target
     * @return {boolean}
     */
    isFollowing(target: Character): boolean;
    /**
     * @param {Character} target
     * @return {boolean}
     */
    hasFollower(target: Character): boolean;
    /**
     * Initialize the character from storage
     * @param {GameState} state
     */
    hydrate(state: GameState): boolean | void;
    __hydrated: boolean;
    /**
     * Gather data to be persisted
     * @return {Object}
     */
    serialize(): CharacterSerialized;
    /**
     * @see {@link Broadcast}
     */
    getBroadcastTargets(): this[];
    /**
     * @return {boolean}
     */
    get isNpc(): boolean;
}
import EventEmitter = require("node:events");
import { Inventory } from "./Inventory";
import Attributes = require("./Attributes");
import { Attribute } from "./Attribute";
import EffectList = require("./EffectList");
import Damage = require("./Damage");
import Effect = require("./Effect");
import Item = require("./Item");
import Room = require("./Room");
import Party = require("./Party");
type EntityReference = string;
import GameState = require("./GameState");
type CharacterAttributeState = {
    base: number;
    delta?: number;
};
type CharacterAttributesConfig = Record<string, number | CharacterAttributeState>;
type CharacterData = {
    name: string;
    inventory?: object;
    equipment?: Map<string, Item>;
    level?: number;
    room?: Room | null;
    attributes?: Attributes | CharacterAttributesConfig;
    effects?: ConstructorParameters<typeof EffectList>[1];
    metadata?: Record<string, unknown>;
};
type CharacterSerialized = {
    attributes: ReturnType<Attributes["serialize"]>;
    level: number;
    name: string;
    room: EntityReference;
    effects: ReturnType<EffectList["serialize"]>;
};
