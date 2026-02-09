const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const Data = require('../../src/Data');

describe('Data', () => {
  describe('parseFile', () => {
    it('includes action and full path when file is missing', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'data-missing-'));
      const missingPath = path.join(tempDir, 'data-missing-file.json');
      assert.throws(() => {
        Data.parseFile(missingPath);
      }, error => {
        assert.strictEqual(error instanceof Error, true);
        assert.match(error.message, /parse/i);
        assert.ok(error.message.includes(missingPath));
        return true;
      });
    });

    it('includes action and full path when parser is unsupported', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'data-parse-'));
      const invalidPath = path.join(tempDir, 'invalid.txt');
      fs.writeFileSync(invalidPath, 'content', 'utf8');

      assert.throws(() => {
        Data.parseFile(invalidPath);
      }, error => {
        assert.strictEqual(error instanceof Error, true);
        assert.match(error.message, /parse/i);
        assert.ok(error.message.includes(invalidPath));
        return true;
      });
    });
  });

  describe('saveFile', () => {
    it('includes action and full path when file is missing', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'data-missing-save-'));
      const missingPath = path.join(tempDir, 'data-missing-save.json');
      assert.throws(() => {
        Data.saveFile(missingPath, { example: true });
      }, error => {
        assert.strictEqual(error instanceof Error, true);
        assert.match(error.message, /save/i);
        assert.ok(error.message.includes(missingPath));
        return true;
      });
    });

    it('includes action and full path when serializer is unsupported', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'data-save-'));
      const invalidPath = path.join(tempDir, 'invalid.txt');
      fs.writeFileSync(invalidPath, 'content', 'utf8');

      assert.throws(() => {
        Data.saveFile(invalidPath, { example: true });
      }, error => {
        assert.strictEqual(error instanceof Error, true);
        assert.match(error.message, /save/i);
        assert.ok(error.message.includes(invalidPath));
        return true;
      });
    });
  });
});
