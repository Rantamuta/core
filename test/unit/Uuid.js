const assert = require('assert');
const Item = require('../../src/Item');
const Npc = require('../../src/Npc');
const { Inventory } = require('../../src/Inventory');
const MobManager = require('../../src/MobManager');

const makeArea = () => ({ name: 'TestArea' });

const makeItemData = overrides => Object.assign({
  keywords: ['rock'],
  name: 'Rock',
  id: 1
}, overrides);

const makeNpcData = (area, overrides) => Object.assign({
  keywords: ['npc'],
  name: 'Goblin',
  id: 1,
  area
}, overrides);

describe('UUID behavior', () => {
  describe('Item', () => {
    it('preserves provided item uuid', () => {
      const area = makeArea();
      const item = new Item(area, makeItemData({ uuid: 'item-uuid' }));
      assert.equal(item.uuid, 'item-uuid');
    });

    it('generates item uuid when missing', () => {
      const area = makeArea();
      const item = new Item(area, makeItemData());
      assert.equal(typeof item.uuid, 'string');
      assert.ok(item.uuid.length > 0);
    });
  });

  describe('Npc', () => {
    it('preserves provided npc uuid', () => {
      const area = makeArea();
      const npc = new Npc(area, makeNpcData(area, { uuid: 'npc-uuid' }));
      assert.equal(npc.uuid, 'npc-uuid');
    });

    it('generates npc uuid when missing', () => {
      const area = makeArea();
      const npc = new Npc(area, makeNpcData(area));
      assert.equal(typeof npc.uuid, 'string');
      assert.ok(npc.uuid.length > 0);
    });
  });

  describe('Inventory', () => {
    it('indexes items by uuid', () => {
      const area = makeArea();
      const item = new Item(area, makeItemData({ uuid: 'item-uuid' }));
      const inventory = new Inventory({ items: [] });
      inventory.addItem(item);
      assert.ok(inventory.has('item-uuid'));
      inventory.removeItem(item);
      assert.ok(!inventory.has('item-uuid'));
    });

    it('serializes items using uuid keys', () => {
      const area = makeArea();
      const item = new Item(area, makeItemData({ uuid: 'item-uuid' }));
      const inventory = new Inventory({ items: [] });
      inventory.addItem(item);
      const serialized = inventory.serialize();
      assert.equal(serialized.items.length, 1);
      assert.equal(serialized.items[0][0], 'item-uuid');
    });
  });

  describe('MobManager', () => {
    it('stores mobs by uuid and removes them by uuid', () => {
      const manager = new MobManager();
      let cleared = false;
      let listenersRemoved = false;
      const mob = {
        uuid: 'mob-uuid',
        effects: { clear: () => { cleared = true; } },
        room: null,
        removeAllListeners: () => { listenersRemoved = true; }
      };

      manager.addMob(mob);
      assert.equal(manager.mobs.get('mob-uuid'), mob);
      manager.removeMob(mob);
      assert.ok(!manager.mobs.has('mob-uuid'));
      assert.ok(mob.__pruned);
      assert.ok(cleared);
      assert.ok(listenersRemoved);
    });
  });
});
