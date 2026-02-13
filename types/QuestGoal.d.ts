export = QuestGoal;
/**
 * Representation of a goal of a quest.
 * The {@link http://ranviermud.com/extending/areas/quests/|Quest guide} has instructions on to
 * create new quest goals for quests
 * @extends EventEmitter
 */
declare class QuestGoal extends EventEmitter {
    /**
     * @param {Quest} quest Quest this goal is for
     * @param {object} config
     * @param {Player} player
     */
    constructor(quest: Quest, config: object, player: Player);
    config: Record<string, unknown>;
    quest: Quest;
    state: Record<string, unknown>;
    player: Player;
    /**
     * @return {{ percent: number, display: string}}
     */
    getProgress(): {
        percent: number;
        display: string;
    };
    /**
     * Put unknown cleanup activities after the quest is finished here
     */
    complete(): void;
    serialize(): {
        state: Record<string, unknown>;
        progress: {
            percent: number;
            display: string;
        };
        config: Record<string, unknown>;
    };
    hydrate(state: Record<string, unknown>): void;
}
import EventEmitter = require("node:events");
import Player = require("./Player");
import Quest = require("./Quest");
