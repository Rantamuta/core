export = Metadatable;
/**
 * @ignore
 * @exports MetadatableFn
 * @param {*} parentClass
 * @return {module:MetadatableFn~Metadatable}
 */
declare function Metadatable<TBase extends Constructor<HasMetadata>>(parentClass: TBase): TBase & Constructor<MetadatableInstance>;
type Constructor<T = object> = new (...args: unknown[]) => T;
type HasMetadata = {
    metadata: Record<string, unknown>;
    emit(eventName: string, ...args: unknown[]): unknown;
};
type MetadatableInstance = {
    setMeta(key: string, value: unknown): void;
    getMeta(key: string): unknown;
};
