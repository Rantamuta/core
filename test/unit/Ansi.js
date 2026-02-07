const assert = require('assert');
const ansi = require('../../src/Ansi');

const RESET = '\x1B[0m';
const RED = '\x1B[31m';
const BOLD = '\x1B[1m';

describe('Ansi parser', () => {
  beforeEach(() => {
    ansi.enable();
  });

  it('appends reset for plain text', () => {
    assert.equal(ansi.parse('hello'), 'hello' + RESET);
  });

  it('parses simple color tags', () => {
    assert.equal(
      ansi.parse('<red>hi</red>'),
      RESET + RED + 'hi' + RESET + RESET
    );
  });

  it('parses nested tags', () => {
    assert.equal(
      ansi.parse('<red>hi <bold>there</bold></red>'),
      RESET + RED + 'hi ' + RESET + RED + BOLD + 'there' + RESET + RED + RESET + RESET
    );
  });

  it('supports alias tags', () => {
    assert.equal(
      ansi.parse('<b>hi</b>'),
      RESET + BOLD + 'hi' + RESET + RESET
    );
  });

  it('supports numeric tags', () => {
    assert.equal(
      ansi.parse('<A31>hi</A31>'),
      RESET + RED + 'hi' + RESET + RESET
    );
  });

  it('leaves unknown tags intact', () => {
    const originalWarn = console.warn;
    const warnings = [];
    console.warn = message => warnings.push(message);

    try {
      assert.equal(
        ansi.parse('<nope>hi</nope>'),
        '<nope>hi</nope>' + RESET
      );

      assert.equal(warnings.length, 2);
      assert.equal(warnings[0], 'Unknown ANSI tag: <nope>');
      assert.equal(warnings[1], 'Unknown ANSI tag: </nope>');
    } finally {
      console.warn = originalWarn;
    }
  });

  it('handles unclosed tags', () => {
    assert.equal(
      ansi.parse('<red>hi'),
      RESET + RED + 'hi' + RESET
    );
  });

  it('can re-enable after disable', () => {
    ansi.disable();
    ansi.enable();
    assert.equal(ansi.parse('x'), 'x' + RESET);
  });

  it('does not warn for known tags', () => {
    const originalWarn = console.warn;
    let warned = false;
    console.warn = () => { warned = true; };

    try {
      ansi.parse('<red>hi</red>');
      assert.equal(warned, false);
    } finally {
      console.warn = originalWarn;
    }
  });
});
