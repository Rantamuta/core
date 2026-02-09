'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BundleManager = require('../../src/BundleManager');

function makeTempBundleDir() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bundle-input-events-'));
  const bundleDir = path.join(tempDir, 'example-bundle');
  const inputEventsDir = path.join(bundleDir, 'input-events');

  fs.mkdirSync(bundleDir);
  fs.mkdirSync(inputEventsDir);

  return { tempDir, bundleDir, inputEventsDir };
}

describe('BundleManager input events', () => {
  it('includes bundle and event name in invalid export errors', () => {
    const { tempDir, inputEventsDir } = makeTempBundleDir();
    const eventPath = path.join(inputEventsDir, 'bad-event.js');

    fs.writeFileSync(
      eventPath,
      "module.exports = { event: 'not-a-function' };\n"
    );

    const state = {
      InputEventManager: { add: () => {} }
    };

    try {
      const manager = new BundleManager(tempDir, state);
      assert.throws(
        () => manager.loadInputEvents('example-bundle', inputEventsDir + path.sep),
        error => {
          assert.ok(
            error.message.includes('example-bundle'),
            'expected bundle name in error'
          );
          assert.ok(
            error.message.includes('bad-event'),
            'expected event name in error'
          );
          assert.ok(
            error.message.toLowerCase().includes('string'),
            'expected invalid event type in error'
          );
          return true;
        }
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
