const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BundleManager = require('../../src/BundleManager');
const Logger = require('../../src/Logger');

describe('BundleManager', () => {
  describe('loadQuests', () => {
    it('swallows loader errors without logging and returns an empty list', async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bundle-manager-'));
      const loader = {
        setBundle: () => {},
        setArea: () => {},
        fetchAll: async () => {
          throw new Error('boom');
        }
      };
      const state = {
        EntityLoaderRegistry: {
          get: () => loader
        },
        QuestFactory: {
          add: () => {
            throw new Error('QuestFactory.add should not be called');
          },
          makeQuestKey: () => 'unused'
        }
      };

      await withStubbedLoggerError(async errorCalls => {
        const manager = new BundleManager(tempDir, state);
        const result = await manager.loadQuests('example-bundle', 'example-area');

        assert.deepStrictEqual(result, []);
        assert.strictEqual(errorCalls.length, 0);
      });

      fs.rmSync(tempDir, { recursive: true, force: true });
    });
  });
});

async function withStubbedLoggerError(run) {
  const errorCalls = [];
  const originalError = Logger.error;
  Logger.error = (...args) => errorCalls.push(args);

  try {
    await run(errorCalls);
  } finally {
    Logger.error = originalError;
  }
}
