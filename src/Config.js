'use strict';

let __cache = null;

class ConfigNotLoadedError extends Error {
  constructor() {
    super('Config.get() called before Config.load()');
    this.name = 'ConfigNotLoadedError';
  }
}

/**
 * Access class for the `ranvier.json` config
 */
class Config {
  /**
   * @param {string} key
   * @param {*} fallback fallback value
   */
  static get(key, fallback) {
    if (__cache === null) {
      throw new ConfigNotLoadedError();
    }
    return key in __cache ? __cache[key] : fallback;
  }

  /**
   * Load `ranvier.json` from disk
   */
  static load(data) {
    __cache = data;
  }
}

module.exports = Config;
