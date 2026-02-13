export = ChannelManager;
/**
 * Contains registered channels
 *
 * TODO: should probably refactor this to just extend `Map`
 */
declare class ChannelManager {
    channels: Map<string, Channel>;
    /**
     * @param {string} name Channel name
     * @return {Channel}
     */
    get(name: string): Channel | undefined;
    /**
     * @param {Channel} channel
     */
    add(channel: Channel): void;
    /**
     * @param {Channel} channel
     */
    remove(channel: Channel): void;
    /**
     * @param {string} search
     * @return {Channel}
     */
    find(search: string): Channel | undefined;
}
import { Channel } from "./Channel";
