import { _ as __vitePreload } from './preload-helper-C7Zd8gLW.js';

const remoteEntryPromise = __vitePreload(() => import('./remoteEntry-pLTUk6ej.js'),true              ?[]:void 0);
    // __tla only serves as a hack for vite-plugin-top-level-await. 
    Promise.resolve(remoteEntryPromise)
      .then(remoteEntry => {
        return Promise.resolve(remoteEntry.__tla)
          .then(remoteEntry.init).catch(remoteEntry.init)
      });
