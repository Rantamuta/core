const assert = require('assert');
const ansi = require('../../src/Ansi');
const Broadcast = require('../../src/Broadcast');

describe('Broadcast', () => {
  beforeEach(() => {
    ansi.enable();
  });

  it('parses color tags before writing to the socket', () => {
    const writes = [];
    const target = {
      socket: {
        writable: true,
        write: data => writes.push(data)
      }
    };
    const source = {
      getBroadcastTargets: () => [target]
    };

    Broadcast.at(source, '<red>hi</red>');

    assert.equal(writes.length, 1);
    assert.equal(writes[0], ansi.parse('<red>hi</red>'));
  });

  it('renders prompt when called with only player argument', () => {
    const writes = [];
    const player = {
      prompt: '> ',
      extraPrompts: new Map(),
      interpolatePrompt: prompt => prompt,
      getBroadcastTargets() {
        return [this];
      },
      socket: {
        _prompted: false,
        writable: true,
        write: data => writes.push(data),
        command: () => {}
      }
    };

    assert.doesNotThrow(() => Broadcast.prompt(player));
    assert.equal(writes.length > 0, true);
  });
});
