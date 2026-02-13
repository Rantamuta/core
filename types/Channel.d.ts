/**
 * @property {ChannelAudience} audience People who receive messages from this channel
 * @property {string} name  Actual name of the channel the user will type
 * @property {string} color Default color. This is purely a helper if you're using default format methods
 * @property {number} minRequiredRole If set only players with the given role or greater can use the channel
 * @property {string} description
 * @property {{sender: function, target: function}} [formatter]
 */
export class Channel {
    /**
     * @param {object}  config
     * @param {string} config.name Name of the channel
     * @param {ChannelAudience} config.audience
     * @param {string} [config.description]
     * @param {number} [config.minRequiredRole]
     * @param {string} [config.color]
     * @param {{sender: function, target: function}} [config.formatter]
     */
    constructor(config: {
        name: string;
        audience: ChannelAudience;
        description?: string;
        minRequiredRole?: ChannelRole;
        color?: string | string[];
        bundle?: string;
        aliases?: string[];
        formatter?: {
            sender: ChannelSenderFormatter;
            target: ChannelTargetFormatter;
        };
    });
    name: string;
    minRequiredRole: ChannelRole | null;
    description?: string;
    bundle: string | null;
    audience: ChannelAudience;
    color: string | string[] | null;
    aliases?: string[];
    formatter: {
        sender: ChannelSenderFormatter;
        target: ChannelTargetFormatter;
    };
    /**
     * @param {GameState} state
     * @param {Player}    sender
     * @param {string}    message
     * @fires GameEntity#channelReceive
     */
    send(state: GameState, sender: Player, message: string): void;
    describeSelf(sender: Player): void;
    getUsage(): string;
    /**
     * How to render the message the player just sent to the channel
     * E.g., you may want "chat" to say "You chat, 'message here'"
     * @param {Player} sender
     * @param {string} message
     * @param {Function} colorify
     * @return {string}
     */
    formatToSender(sender: Player, target: Player | null, message: string, colorify: ChannelColorify): string;
    /**
     * How to render the message to everyone else
     * E.g., you may want "chat" to say "Playername chats, 'message here'"
     * @param {Player} sender
     * @param {Player} target
     * @param {string} message
     * @param {Function} colorify
     * @return {string}
     */
    formatToReceipient(sender: Player, target: Player, message: string, colorify: ChannelColorify): string;
    colorify(message: string): string;
}
export class NoPartyError extends Error {
}
export class NoRecipientError extends Error {
}
export class NoMessageError extends Error {
}
import ChannelAudience = require("./ChannelAudience");
import Player = require("./Player");
import PlayerRoles = require("./PlayerRoles");
import GameState = require("./GameState");
type ChannelRole = typeof PlayerRoles[keyof typeof PlayerRoles];
type ChannelColorify = (message: string) => string;
type ChannelSenderFormatter = (sender: Player, target: Player | null, message: string, colorify: ChannelColorify) => string;
type ChannelTargetFormatter = (sender: Player, target: Player, message: string, colorify: ChannelColorify) => string;
