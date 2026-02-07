const assert = require('assert');
const ansi = require('../../src/Ansi');
const EventUtil = require('../../src/EventUtil');

describe('EventUtil', () => {
  beforeEach(() => {
    ansi.enable();
  });

  it('genWrite parses color tags', () => {
    const writes = [];
    const socket = {
      write: data => writes.push(data)
    };

    const write = EventUtil.genWrite(socket);
    write('<green>hi</green>');

    assert.equal(writes.length, 1);
    assert.equal(writes[0], ansi.parse('<green>hi</green>'));
  });

  it('genSay appends newline and parses', () => {
    const writes = [];
    const socket = {
      write: data => writes.push(data)
    };

    const say = EventUtil.genSay(socket);
    say('hi');

    assert.equal(writes.length, 1);
    assert.equal(writes[0], ansi.parse('hi\r\n'));
  });
});
