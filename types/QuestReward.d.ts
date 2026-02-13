export = QuestReward;
/**
 * Representation of a quest reward
 * The {@link http://ranviermud.com/extending/areas/quests/|Quest guide} has instructions on to
 * create new reward type for quests
 */
declare class QuestReward {
    /**
     * Assign the reward to the player
     * @param {GameState} GameState
     * @param {Quest} quest   quest this reward is being given from
    * @param {object} config
     * @param {Player} player
     */
    static reward(GameState: GameState, quest: Quest, config: Record<string, unknown>, player: Player): void;
    /**
     * Render the reward
     * @return string
     */
    static display(GameState: GameState, quest: Quest, config: Record<string, unknown>, player: Player): string;
}
import GameState = require("./GameState");
import Player = require("./Player");
import Quest = require("./Quest");
