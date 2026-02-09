const assert = require('assert');

const Config = require('../../src/Config');

describe('Config', () => {
  it('throws a ConfigNotLoadedError when accessed before load', () => {
    assert.throws(() => {
      Config.get('anything');
    }, error => {
      assert.strictEqual(error instanceof Error, true);
      assert.strictEqual(error.name, 'ConfigNotLoadedError');
      assert.strictEqual(error.message, 'Config.get() called before Config.load()');
      return true;
    });
  });

  it('returns values and fallbacks after load', () => {
    const data = { example: 'value' };
    Config.load(data);

    assert.strictEqual(Config.get('example'), 'value');
    assert.strictEqual(Config.get('missing', 'fallback'), 'fallback');
  });
});
