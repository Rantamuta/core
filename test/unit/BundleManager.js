const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BundleManager = require('../../src/BundleManager');
const Logger = require('../../src/Logger');

describe('BundleManager', () => {
  describe('loadQuests', () => {
    it('surfaces loader errors from fetchAll', async () => {
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

        await assert.rejects(
          () => manager.loadQuests('example-bundle', 'example-area'),
          error => {
            assert.strictEqual(
              error.message,
              'Error loading quests [example-bundle:example-area]'
            );
            assert.ok(error.cause);
            assert.strictEqual(error.cause.message, 'boom');
            return true;
          }
        );
        assert.strictEqual(errorCalls.length, 1);
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
