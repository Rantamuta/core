export = EntityLoaderRegistry;
/**
 * Holds instances of configured EntityLoaders
 * @type {Map<string, EntityLoader>}
 */
declare class EntityLoaderRegistry extends Map<string, EntityLoader> {
    constructor();
    constructor(entries?: readonly (readonly [string, EntityLoader])[]);
    constructor(iterable?: Iterable<readonly [string, EntityLoader]>);
    load(sourceRegistry: {
        get(name: string): EntityDataSourceLike | undefined;
    }, config?: Record<string, EntityLoaderDefinition>): void;
}
import EntityLoader = require("./EntityLoader");
type EntityLoaderDefinition = {
    source: string;
    config?: Record<string, unknown>;
};
type EntityDataSourceLike = {
    hasData(config: Record<string, unknown>): boolean | Promise<boolean>;
    // Data source APIs include provider-specific methods.
    [key: string]: unknown;
};
