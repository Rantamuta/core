export = EffectFactory;
/**
 * @property {Map} effects
 */
declare class EffectFactory {
    effects: Map<string, EffectFactoryEntry>;
    /**
     * @param {string} id
     * @param {EffectConfig} config
     * @param {GameState} state
     */
    add(id: string, config: EffectConfig, state: GameState): void;
    has(id: string): boolean;
    /**
     * Get a effect definition. Use `create` if you want an instance of a effect
     * @param {string} id
     * @return {object}
     */
    get(id: string): object;
    /**
     * @param {string}  id      effect id
     * @param {?object} config  Effect.config override
     * @param {?object} state   Effect.state override
     * @return {Effect}
     */
    create(id: string, config?: object | null, state?: object | null): Effect;
}
type EffectConfig = {
    config?: Record<string, unknown>;
    listeners?: EffectListenerMap | ((state: GameState) => EffectListenerMap);
    modifiers?: import("./Effect").EffectModifiers;
    state?: Record<string, unknown>;
    flags?: string[];
};
import Effect = require("./Effect");
import EventManager = require("./EventManager");
import GameState = require("./GameState");
// Effect listener payloads depend on the specific emitted game event.
type EffectListenerMap = Record<string, (...args: unknown[]) => void>;
type EffectFactoryEntry = {
    definition: EffectConfig;
    eventManager: EventManager;
};
