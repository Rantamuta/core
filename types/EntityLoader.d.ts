export = EntityLoader;
/**
 * Used to CRUD an entity from a configured DataSource
 */
declare class EntityLoader {
    /**
     * @param {DataSource}
     * @param {object} config
     */
    constructor(dataSource: EntityDataSource, config?: EntityLoaderConfig);
    dataSource: EntityDataSource;
    config: EntityLoaderConfig;
    setArea(name: string): void;
    setBundle(name: string): void;
    hasData(): boolean | Promise<boolean>;
    // Concrete payload shape depends on the backing data source.
    fetchAll(): unknown;
    fetch(id: string | number): unknown;
    // Data source write payloads are backend-specific.
    replace(data: unknown): unknown;
    update(id: string | number, data: unknown): unknown;
}
type EntityLoaderConfig = {
    area?: string;
    bundle?: string;
    [key: string]: unknown;
};
type EntityDataSource = {
    name?: string;
    hasData(config: EntityLoaderConfig): boolean | Promise<boolean>;
    fetchAll?(config: EntityLoaderConfig): unknown;
    fetch?(config: EntityLoaderConfig, id: string | number): unknown;
    replace?(config: EntityLoaderConfig, data: unknown): unknown;
    update?(config: EntityLoaderConfig, id: string | number, data: unknown): unknown;
};
