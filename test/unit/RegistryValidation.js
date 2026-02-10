const assert = require('assert');

const DataSourceRegistry = require('../../src/DataSourceRegistry');
const EntityLoaderRegistry = require('../../src/EntityLoaderRegistry');
const EntityLoader = require('../../src/EntityLoader');

describe('Registry validation rules', () => {
  describe('DataSourceRegistry.load', () => {
    it("throws when a datasource is missing 'require'", () => {
      const registry = new DataSourceRegistry();

      assert.throws(() => registry.load(() => ({}), process.cwd(), {
        players: {}
      }), /DataSource \[players\] does not specify a 'require'/);
    });

    it("throws when a datasource has a non-string 'require'", () => {
      const registry = new DataSourceRegistry();

      assert.throws(() => registry.load(() => ({}), process.cwd(), {
        players: { require: 42 }
      }), /DataSource \[players\] has an invalid 'require'/);
    });

    it("throws when datasource instance does not implement hasData", () => {
      const registry = new DataSourceRegistry();
      const requireFn = () => ({
        InMemoryDataSource: class {}
      });

      assert.throws(() => registry.load(requireFn, process.cwd(), {
        players: { require: 'data-source-module.InMemoryDataSource' }
      }), /Data Source players requires at minimum a 'hasData\(config\): boolean' method/);
    });
  });

  describe('EntityLoaderRegistry.load', () => {
    it("throws when an entity loader is missing 'source'", () => {
      const sourceRegistry = new Map();
      const registry = new EntityLoaderRegistry();

      assert.throws(() => registry.load(sourceRegistry, {
        areas: {}
      }), /EntityLoader \[areas\] does not specify a 'source'/);
    });

    it("throws when an entity loader has a non-string 'source'", () => {
      const sourceRegistry = new Map();
      const registry = new EntityLoaderRegistry();

      assert.throws(() => registry.load(sourceRegistry, {
        areas: { source: 99 }
      }), /EntityLoader \[areas\] has an invalid 'source'/);
    });

    it('throws when an entity loader references an unknown data source', () => {
      const sourceRegistry = new Map();
      const registry = new EntityLoaderRegistry();

      assert.throws(() => registry.load(sourceRegistry, {
        areas: { source: 'missingSource' }
      }), /Invalid source \[missingSource\] for entity \[areas\]/);
    });

    it('creates EntityLoader instances for valid config', () => {
      const source = { hasData: () => true };
      const sourceRegistry = new Map([['json', source]]);
      const registry = new EntityLoaderRegistry();

      registry.load(sourceRegistry, {
        areas: {
          source: 'json',
          config: { path: '/tmp/areas' }
        }
      });

      const loader = registry.get('areas');
      assert.ok(loader instanceof EntityLoader);
      assert.strictEqual(loader.dataSource, source);
      assert.deepStrictEqual(loader.config, { path: '/tmp/areas' });
    });
  });
});
