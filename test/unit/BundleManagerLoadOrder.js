'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BundleManager = require('../../src/BundleManager');
const Logger = require('../../src/Logger');

function makeTempBundles(bundles) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bundle-order-'));
  for (const bundle of bundles) {
    fs.mkdirSync(path.join(tempDir, bundle));
  }
  return tempDir;
}

function withStubbedLoggerWarn(run) {
  const warnCalls = [];
  const originalWarn = Logger.warn;
  Logger.warn = (...args) => warnCalls.push(args.join(' '));

  const finish = () => {
    Logger.warn = originalWarn;
    return warnCalls;
  };

  try {
    const result = run(warnCalls);
    if (result && typeof result.then === 'function') {
      return result.then(() => finish(), err => {
        finish();
        throw err;
      });
    }

    return finish();
  } catch (err) {
    finish();
    throw err;
  }
}

describe('BundleManager loadBundles ordering', () => {
  it('loads bundles in config order', async () => {
    const tempDir = makeTempBundles(['bundle-a', 'bundle-b']);
    const state = {
      Config: {
        get: (key, fallback) => (key === 'bundles' ? ['bundle-a', 'bundle-b'] : fallback),
      },
      AttributeFactory: { validateAttributes: () => {} },
      EntityLoaderRegistry: {}
    };
    const manager = new BundleManager(tempDir + path.sep, state);

    const loadOrder = [];
    manager.loadBundle = async bundle => {
      loadOrder.push(bundle);
    };

    const originalReaddirSync = fs.readdirSync;
    fs.readdirSync = () => ['bundle-b', 'bundle-a'];

    try {
      await manager.loadBundles(false);
    } finally {
      fs.readdirSync = originalReaddirSync;
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    assert.deepStrictEqual(loadOrder, ['bundle-a', 'bundle-b']);
  });

  it('warns when a configured bundle is missing', async () => {
    const tempDir = makeTempBundles(['present-bundle']);
    const state = {
      Config: {
        get: (key, fallback) => (key === 'bundles' ? ['present-bundle', 'missing-bundle'] : fallback),
      },
      AttributeFactory: { validateAttributes: () => {} },
      EntityLoaderRegistry: {}
    };

    const manager = new BundleManager(tempDir + path.sep, state);
    manager.loadBundle = async () => {};

    const warnCalls = await withStubbedLoggerWarn(() => manager.loadBundles(false));

    try {
      assert.strictEqual(warnCalls.length, 1, 'expected a missing bundle warning');
      assert.ok(
        warnCalls[0].includes('missing-bundle'),
        'expected missing bundle name in warning'
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
