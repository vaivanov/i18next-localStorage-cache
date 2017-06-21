import * as utils from './utils';
import storage from 'local-storage-fallback';

function getDefaults() {
  return {
    enabled: false,
    prefix: 'i18next_res_',
    expirationTime: 7 * 24 * 60 * 60 * 1000,
    versions: {}
  };
}

class Cache {
  constructor(services, options = {}) {
    this.init(services, options);

    this.type = 'cache';
    this.debouncedStore = utils.debounce(this.store, 10000);
  }

  init(services, options = {}) {
    this.services = services;
    this.options = utils.defaults(options, this.options || {}, getDefaults());
  }

  load(lngs, callback) {
    const store = {};
    const nowMS = new Date().getTime();
    try {
      if (!storage || !lngs.length) {
        return callback(null, null);
      }
    } catch(e) {
      return callback(null, null);
    }

    let todo = lngs.length;

    lngs.forEach((lng) => {
      let local = storage.getItem(this.options.prefix + lng);

      if (local) {
        local = JSON.parse(local);
        if (
          // expiration field is mandatory, and should not be expired
          local.i18nStamp && local.i18nStamp + this.options.expirationTime > nowMS &&

          // there should be no language version set, or if it is, it should match the one in translation
          this.options.versions[lng] === local.i18nVersion
        ) {
          delete local.i18nVersion;
          store[lng] = local;
        }
      }

      todo -= 1;
      if (todo === 0) {
        callback(null, store);
      }
    });
    return undefined;
  }

  store(storeParam) {
    const store = storeParam;
    if (storage) {
      for (const m in store) { // eslint-disable-line
        // timestamp
        store[m].i18nStamp = new Date().getTime();

        // language version (if set)
        if (this.options.versions[m]) {
          store[m].i18nVersion = this.options.versions[m];
        }

        // save
        storage.setItem(this.options.prefix + m, JSON.stringify(store[m]));
      }
    }
  }

  save(store) {
    this.debouncedStore(store);
  }
}

Cache.type = 'cache';

export default Cache;
