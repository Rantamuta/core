export = Metadatable;
/**
 * @ignore
 * @exports MetadatableFn
 * @param {*} parentClass
 * @return {module:MetadatableFn~Metadatable}
 */
declare function Metadatable<TBase extends Constructor<HasMetadata>>(parentClass: TBase): TBase & Constructor<MetadatableInstance>;
// Mixin-compatible constructor signature with unconstrained ctor args.
type Constructor<T = object> = new (...args: unknown[]) => T;
type HasMetadata = {
    metadata: Record<string, unknown>;
    emit(eventName: string, ...args: unknown[]): boolean;
};
type MetadatableInstance = {
    // Metadata values are intentionally unconstrained extension data.
    setMeta(key: string, value: unknown): void;
    getMeta(key: string): unknown;
};
