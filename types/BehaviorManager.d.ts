export = BehaviorManager;
/**
 * BehaviorManager keeps a map of BehaviorName:EventManager which is used
 * during Item and NPC hydrate() methods to attach events
 */
declare class BehaviorManager {
    behaviors: Map<string, EventManager>;
    /**
     * Get EventManager for a given behavior
     * @param {string} name
     * @return {EventManager}
     */
    get(name: string): EventManager | undefined;
    /**
     * Check to see if a behavior exists
     * @param {string} name
     * @return {boolean}
     */
    has(name: string): boolean;
    /**
     * @param {string}   behaviorName
     * @param {Function} listener
     */
    // Listener argument payloads vary by emitted game event.
    addListener(behaviorName: string, event: string, listener: (...args: unknown[]) => void): void;
}
import EventManager = require("./EventManager");
