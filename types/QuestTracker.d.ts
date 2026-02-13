export = QuestTracker;
/**
 * Keeps track of player quest progress
 *
 * @property {Player} player
 * @property {Map}    completedQuests
 * @property {Map}    activeQuests
 */
declare class QuestTracker {
    /**
     * @param {Player} player
     * @param {Array}  active
     * @param {Array}  completed
     */
    constructor(player: Player, active: Array<[EntityReference, ActiveQuestRecord]>, completed: Array<[EntityReference, CompletedQuestRecord]>);
    player: Player;
    activeQuests: Map<EntityReference, Quest | ActiveQuestRecord>;
    completedQuests: Map<EntityReference, CompletedQuestRecord>;
    /**
     * Proxy events to all active quests
     * @param {string} event
     * @param {...*}   args
     */
    // Event payloads vary by event name.
    emit(event: string, ...args: unknown[]): void;
    /**
     * @param {EntityReference} qid
     * @return {boolean}
     */
    isActive(qid: EntityReference): boolean;
    /**
     * @param {EntityReference} qid
     * @return {boolean}
     */
    isComplete(qid: EntityReference): boolean;
    get(qid: EntityReference): Quest | ActiveQuestRecord | undefined;
    /**
     * @param {EntityReference} qid
     */
    complete(qid: EntityReference): void;
    /**
     * @param {Quest} quest
     */
    start(quest: Quest): void;
    /**
     * @param {GameState} state
     * @param {object}    questData Data pulled from the pfile
     */
    hydrate(state: GameState): void;
    /**
     * @return {object}
     */
    serialize(): object;
}
import Player = require("./Player");
import Quest = require("./Quest");
type EntityReference = string;
import GameState = require("./GameState");
type ActiveQuestRecord = {
    state: Array<Record<string, unknown>>;
    started?: string;
    // Active quest records may include quest-specific extension fields.
    [key: string]: unknown;
};
type CompletedQuestRecord = {
    started?: string;
    completedAt: string;
};
