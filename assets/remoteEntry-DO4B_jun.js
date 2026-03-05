import { i as init_1, h as host__mf_v__runtimeInit__mf_v__ } from './host__mf_v__runtimeInit__mf_v__-CjaOuR8C.js';
import exposesMap from './virtualExposes-DwA08f_D.js';
import { _ as __vitePreload } from './preload-helper-C7Zd8gLW.js';

const importMap = {
      
        "react": async () => {
          let pkg = await __vitePreload(() => import('./index-DJPdjtaW.js').then(n => n.i),true              ?[]:void 0);
          return pkg
        }
      ,
        "@ev/eva-container-api": async () => {
          let pkg = await __vitePreload(() => import('./index-B2sskZhK.js').then(n => n.a8),true              ?[]:void 0);
          return pkg
        }
      ,
        "react-dom": async () => {
          let pkg = await __vitePreload(() => import('./index-r4krjglJ.js').then(n => n.i),true              ?[]:void 0);
          return pkg
        }
      ,
        "react-router-dom": async () => {
          let pkg = await __vitePreload(() => import('./index-qApnUVMF.js'),true              ?[]:void 0);
          return pkg
        }
      ,
        "react-router": async () => {
          let pkg = await __vitePreload(() => import('./index-DVFLAMa7.js'),true              ?[]:void 0);
          return pkg
        }
      
    };
      const usedShared = {
      
          "react": {
            name: "react",
            version: "19.2.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["react"].loaded = true;
              const {"react": pkgDynamicImport} = importMap; 
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^19.2.0"
            }
          }
        ,
          "@ev/eva-container-api": {
            name: "@ev/eva-container-api",
            version: "5.5.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@ev/eva-container-api"].loaded = true;
              const {"@ev/eva-container-api": pkgDynamicImport} = importMap; 
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^5.5.0"
            }
          }
        ,
          "react-dom": {
            name: "react-dom",
            version: "19.2.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["react-dom"].loaded = true;
              const {"react-dom": pkgDynamicImport} = importMap; 
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^19.2.0"
            }
          }
        ,
          "react-router-dom": {
            name: "react-router-dom",
            version: "6.30.3",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["react-router-dom"].loaded = true;
              const {"react-router-dom": pkgDynamicImport} = importMap; 
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^6.30.3"
            }
          }
        ,
          "react-router": {
            name: "react-router",
            version: "6.30.3",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["react-router"].loaded = true;
              const {"react-router": pkgDynamicImport} = importMap; 
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^6.30.3"
            }
          }
        
    };
      const usedRemotes = [
                {
                  entryGlobalName: "remotePwa",
                  name: "remotePwa",
                  type: "module",
                  entry: "https://daniel-shcherban.github.io/remote-app-v3/remoteEntry.js",
                  shareScope: "default",
                }
          
      ];

const initTokens = {};
  const shareScopeName = "default";
  const mfName = "host";
  async function init(shared = {}, initScope = []) {
    const initRes = init_1({
      name: mfName,
      remotes: usedRemotes,
      shared: usedShared,
      plugins: [],
      shareStrategy: 'version-first'
    });
    // handling circular init calls
    var initToken = initTokens[shareScopeName];
    if (!initToken)
      initToken = initTokens[shareScopeName] = { from: mfName };
    if (initScope.indexOf(initToken) >= 0) return;
    initScope.push(initToken);
    initRes.initShareScopeMap('default', shared);
    try {
      await Promise.all(await initRes.initializeSharing('default', {
        strategy: 'version-first',
        from: "build",
        initScope
      }));
    } catch (e) {
      console.error(e);
    }
    host__mf_v__runtimeInit__mf_v__.initResolve(initRes);
    return initRes
  }

  function getExposes(moduleName) {
    if (!(moduleName in exposesMap)) throw new Error(`Module ${moduleName} does not exist in container.`)
    return (exposesMap[moduleName])().then(res => () => res)
  }

export { getExposes as get, init };
