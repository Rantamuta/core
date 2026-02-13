export = Scriptable;
/**
 * @ignore
 * @exports ScriptableFn
 * @param {*} parentClass
 * @return {module:ScriptableFn~Scriptable}
 */
declare function Scriptable<TBase extends Constructor<ScriptableBase>>(parentClass: TBase): TBase & Constructor<ScriptableInstance>;
import BehaviorManager = require("./BehaviorManager");
type Constructor<T = object> = new (...args: unknown[]) => T;
type ScriptableBase = {
    behaviors: Map<string, unknown>;
    __pruned?: boolean;
    emit(name: string, ...args: unknown[]): boolean;
    removeAllListeners(): void;
};
type ScriptableInstance = {
    hasBehavior(name: string): boolean;
    // Behavior config payload is bundle-defined.
    getBehavior(name: string): unknown;
    setupBehaviors(manager: BehaviorManager): void;
};
