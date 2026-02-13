export = Player;
/**
 * @property {Account} account
 * @property {number}  experience current experience this level
 * @property {string}  password
 * @property {string}  prompt     default prompt string
 * @property {net.Socket} socket
 * @property {QuestTracker} questTracker
 * @property {Map<string,function ()>} extraPrompts Extra prompts to render after the default prompt
 * @property {{completed: Array, active: Array}} questData
 * @extends Character
 */
declare class Player extends Character {
    constructor(data: PlayerData);
    account: Account | string | null;
    experience: number;
    extraPrompts: Map<string, PlayerExtraPrompt>;
    password: string;
    prompt: string;
    socket: import("./Broadcastable").SocketLike | null;
    questTracker: QuestTracker;
    commandQueue: CommandQueue;
    role: PlayerRole;
    /**
     * @see CommandQueue::enqueue
     */
    queueCommand(executable: PlayerCommandExecutable, lag: number): void;
    /**
     * Convert prompt tokens into actual data
     * @param {string} promptStr
     * @param {object} extraData Any extra data to give the prompt access to
     */
    interpolatePrompt(promptStr: string, extraData?: Record<string, unknown>): string;
    /**
     * Add a line of text to be displayed immediately after the prompt when the prompt is displayed
     * @param {string}      id       Unique prompt id
     * @param {function ()} renderer Function to call to render the prompt string
     * @param {?boolean}    removeOnRender When true prompt will remove itself once rendered
     *    otherwise prompt will continue to be rendered until removed.
     */
    addPrompt(id: string, renderer: () => string, removeOnRender?: boolean | null): void;
    /**
     * @param {string} id
     */
    removePrompt(id: string): void;
    /**
     * @param {string} id
     * @return {boolean}
     */
    hasPrompt(id: string): boolean;
    /**
     * Move the player to the given room, emitting events appropriately
     * @param {Room} nextRoom
     * @param {function} onMoved Function to run after the player is moved to the next room but before enter events are fired
     * @fires Room#playerLeave
     * @fires Room#playerEnter
     * @fires Player#enterRoom
     */
    moveTo(nextRoom: Room, onMoved?: () => void): void;
    save(callback?: () => void): void;
    hydrate(state: GameState): void;
}
import Account = require("./Account");
import Character = require("./Character");
import QuestTracker = require("./QuestTracker");
import CommandQueue = require("./CommandQueue");
import Room = require("./Room");
import PlayerRoles = require("./PlayerRoles");
import GameState = require("./GameState");
type PlayerRole = typeof PlayerRoles[keyof typeof PlayerRoles];
type PlayerExtraPrompt = {
    removeOnRender: boolean;
    renderer: () => string;
};
type PlayerCommandExecutable = {
    execute: () => void;
    label: string;
    lag?: number;
};
type PlayerData = ConstructorParameters<typeof Character>[0] & {
    account?: Account | string | null;
    experience?: number;
    password: string;
    prompt?: string;
    socket?: import("./Broadcastable").SocketLike | null;
    quests?: {
        completed?: string[];
        active?: string[];
    };
    role?: PlayerRole;
};
