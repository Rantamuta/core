'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('CI audit reporting', () => {
  it('captures non-blocking npm audit output as an artifact', () => {
    const workflowPath = path.resolve(__dirname, '..', '..', '.github', 'workflows', 'node-ci.yml');
    const workflow = fs.readFileSync(workflowPath, 'utf8');

    assert.ok(
      /npm\s+audit/.test(workflow),
      'expected CI to run npm audit'
    );
    assert.ok(
      /continue-on-error:\s*true/.test(workflow),
      'expected npm audit to be non-blocking'
    );
    assert.ok(
      /upload-artifact@v4/.test(workflow),
      'expected CI to upload the audit report as an artifact'
    );
    assert.ok(
      /npm-audit\.json/.test(workflow),
      'expected CI to persist npm audit output as npm-audit.json'
    );
  });
});
