'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const AttributeFactory = require('../../src/AttributeFactory');
const BundleManager = require('../../src/BundleManager');
const ChannelManager = require('../../src/ChannelManager');
const CommandManager = require('../../src/CommandManager');
const EffectFactory = require('../../src/EffectFactory');
const HelpManager = require('../../src/HelpManager');
const QuestFactory = require('../../src/QuestFactory');
const QuestGoalManager = require('../../src/QuestGoalManager');
const QuestRewardManager = require('../../src/QuestRewardManager');
const SkillManager = require('../../src/SkillManager');

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

describe('BundleManager strict mode', () => {
  it('defaults strict mode to false from config fallback', async () => {
    const tempDir = makeTempDir('strict-default-');
    fs.mkdirSync(path.join(tempDir, 'bundle-a'));

    const state = {
      Config: {
        get: (key, fallback) => key === 'bundles' ? ['bundle-a'] : fallback
      },
      AttributeFactory: { validateAttributes: () => {} },
      EntityLoaderRegistry: {}
    };

    const manager = new BundleManager(tempDir + path.sep, state);
    manager.loadBundle = async () => {};

    try {
      await manager.loadBundles(false);
      assert.strictEqual(manager.strictMode, false);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('throws on duplicate command key across bundles when strict mode is enabled', () => {
    const tempDir = makeTempDir('strict-commands-');
    const state = {
      EntityLoaderRegistry: {},
      CommandManager: new CommandManager()
    };

    writeFile(path.join(tempDir, 'a', 'commands', 'look.js'), "module.exports = { command: () => () => {} };\n");
    writeFile(path.join(tempDir, 'b', 'commands', 'look.js'), "module.exports = { command: () => () => {} };\n");

    const manager = new BundleManager(tempDir + path.sep, state);
    manager.strictMode = true;

    try {
      manager.loadCommands('a', path.join(tempDir, 'a', 'commands') + path.sep);
      assert.throws(
        () => manager.loadCommands('b', path.join(tempDir, 'b', 'commands') + path.sep),
        error => {
          assert.ok(error.message.includes('CommandManager.commands'));
          assert.ok(error.message.includes('look'));
          assert.ok(error.message.includes('bundle [a]'));
          assert.ok(error.message.includes('bundle [b]'));
          return true;
        }
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('preserves non-strict command override behavior', () => {
    const tempDir = makeTempDir('nonstrict-commands-');
    const state = {
      EntityLoaderRegistry: {},
      CommandManager: new CommandManager()
    };

    writeFile(path.join(tempDir, 'a', 'commands', 'look.js'), "module.exports = { command: () => () => 'a' };\n");
    writeFile(path.join(tempDir, 'b', 'commands', 'look.js'), "module.exports = { command: () => () => 'b' };\n");

    const manager = new BundleManager(tempDir + path.sep, state);
    manager.strictMode = false;

    try {
      manager.loadCommands('a', path.join(tempDir, 'a', 'commands') + path.sep);
      manager.loadCommands('b', path.join(tempDir, 'b', 'commands') + path.sep);

      assert.strictEqual(state.CommandManager.get('look').bundle, 'b');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('throws on duplicate channel alias across bundles when strict mode is enabled', () => {
    const tempDir = makeTempDir('strict-channels-');
    const state = {
      EntityLoaderRegistry: {},
      ChannelManager: new ChannelManager()
    };

    writeFile(
      path.join(tempDir, 'a', 'channels.js'),
      "module.exports = [{ name: 'auction', aliases: ['a'], audience: {} }];\n"
    );
    writeFile(
      path.join(tempDir, 'b', 'channels.js'),
      "module.exports = [{ name: 'announce', aliases: ['a'], audience: {} }];\n"
    );

    const manager = new BundleManager(tempDir + path.sep, state);
    manager.strictMode = true;

    try {
      manager.loadChannels('a', path.join(tempDir, 'a', 'channels.js'));
      assert.throws(
        () => manager.loadChannels('b', path.join(tempDir, 'b', 'channels.js')),
        /ChannelManager\.channels.*\[a\]/
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('throws on duplicate keys across map registries in strict mode and keeps effect duplicate-ignore in non-strict mode', async () => {
    const tempDir = makeTempDir('strict-registries-');
    writeFile(path.join(tempDir, 'a', 'quest-goals', 'kill.js'), 'module.exports = () => class Goal {};\n');
    writeFile(path.join(tempDir, 'b', 'quest-goals', 'kill.js'), 'module.exports = () => class Goal {};\n');
    writeFile(path.join(tempDir, 'a', 'quest-rewards', 'xp.js'), 'module.exports = () => class Reward {};\n');
    writeFile(path.join(tempDir, 'b', 'quest-rewards', 'xp.js'), 'module.exports = () => class Reward {};\n');
    writeFile(path.join(tempDir, 'a', 'attributes.js'), "module.exports = [{ name: 'health', base: 100 }];\n");
    writeFile(path.join(tempDir, 'b', 'attributes.js'), "module.exports = [{ name: 'health', base: 200 }];\n");
    writeFile(path.join(tempDir, 'a', 'effects', 'burn.js'), "module.exports = { config: {}, listeners: {} };\n");
    writeFile(path.join(tempDir, 'b', 'effects', 'burn.js'), "module.exports = { config: { changed: true }, listeners: {} };\n");
    writeFile(path.join(tempDir, 'a', 'skills', 'slash.js'), "module.exports = { run: () => () => {} };\n");
    writeFile(path.join(tempDir, 'b', 'skills', 'slash.js'), "module.exports = { run: () => () => {} };\n");

    const helpRecords = { basics: { body: 'A' } };
    const questRecords = [{ id: 1, goals: [] }];

    const makeManager = strictMode => {
      const helpLoader = { setBundle: () => {}, hasData: async () => true, fetchAll: async () => helpRecords };
      const questsLoader = { setBundle: () => {}, setArea: () => {}, fetchAll: async () => questRecords };
      const emptyAreaLoader = { setBundle: () => {}, setArea: () => {}, hasData: async () => false, fetchAll: async () => [] };

      const state = {
        EntityLoaderRegistry: {
          get: type => {
            if (type === 'help') return helpLoader;
            if (type === 'quests') return questsLoader;
            return emptyAreaLoader;
          }
        },
        Config: { get: (key, fallback) => key === 'strictMode' ? strictMode : fallback },
        QuestGoalManager: new QuestGoalManager(),
        QuestRewardManager: new QuestRewardManager(),
        AttributeFactory: new AttributeFactory(),
        EffectFactory: new EffectFactory(),
        SkillManager: new SkillManager(),
        SpellManager: new SkillManager(),
        HelpManager: new HelpManager(),
        QuestFactory: new QuestFactory(),
        AreaFactory: { setDefinition: () => {} },
        MobFactory: { getDefinition: () => ({}) }
      };
      const manager = new BundleManager(tempDir + path.sep, state);
      manager.strictMode = strictMode;
      return manager;
    };

    try {
      const strict = makeManager(true);

      strict.loadQuestGoals('a', path.join(tempDir, 'a', 'quest-goals') + path.sep);
      assert.throws(() => strict.loadQuestGoals('b', path.join(tempDir, 'b', 'quest-goals') + path.sep), /QuestGoalManager/);

      strict.loadQuestRewards('a', path.join(tempDir, 'a', 'quest-rewards') + path.sep);
      assert.throws(() => strict.loadQuestRewards('b', path.join(tempDir, 'b', 'quest-rewards') + path.sep), /QuestRewardManager/);

      strict.loadAttributes('a', path.join(tempDir, 'a', 'attributes.js'));
      assert.throws(() => strict.loadAttributes('b', path.join(tempDir, 'b', 'attributes.js')), /AttributeFactory\.attributes/);

      strict.loadEffects('a', path.join(tempDir, 'a', 'effects') + path.sep);
      assert.throws(() => strict.loadEffects('b', path.join(tempDir, 'b', 'effects') + path.sep), /EffectFactory\.effects/);

      strict.loadSkills('a', path.join(tempDir, 'a', 'skills') + path.sep);
      assert.throws(() => strict.loadSkills('b', path.join(tempDir, 'b', 'skills') + path.sep), /SkillManager\.skills/);

      await strict.loadHelp('a');
      await assert.rejects(() => strict.loadHelp('b'), /HelpManager\.helps/);

      await strict.loadQuests('a', 'same-area');
      await assert.rejects(() => strict.loadQuests('b', 'same-area'), /QuestFactory\.quests/);

      await strict.loadArea('a', 'midgaard', {});
      await assert.rejects(() => strict.loadArea('b', 'midgaard', {}), /AreaFactory\.entities/);

      const loader = {
        setBundle: () => {},
        setArea: () => {},
        hasData: async () => true,
        fetchAll: async () => [{ id: 1 }]
      };
      strict.loaderRegistry = { get: () => loader };
      const entityFactory = {
        constructor: { name: 'ItemFactory' },
        createEntityRef: () => 'midgaard:1',
        setDefinition: () => {}
      };
      await strict.loadEntities('a', 'midgaard', 'items', entityFactory);
      await assert.rejects(
        () => strict.loadEntities('b', 'midgaard', 'items', entityFactory),
        /ItemFactory\.entities/
      );

      const nonStrict = makeManager(false);
      nonStrict.loadEffects('a', path.join(tempDir, 'a', 'effects') + path.sep);
      nonStrict.loadEffects('b', path.join(tempDir, 'b', 'effects') + path.sep);
      assert.strictEqual(nonStrict.state.EffectFactory.effects.get('burn').definition.changed, undefined);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
