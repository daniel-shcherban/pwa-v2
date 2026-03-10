import { g as getDefaultExportFromCjs } from './_commonjsHelpers-BAGoDD49.js';
import { h as host__mf_v__runtimeInit__mf_v__, a as index_cjs } from './host__mf_v__runtimeInit__mf_v__-CjaOuR8C.js';

function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== 'string' && !Array.isArray(e)) { for (const k in e) {
      if (k !== 'default' && !(k in n)) {
        const d = Object.getOwnPropertyDescriptor(e, k);
        if (d) {
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    } }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: 'Module' }));
}

const {loadRemote} = index_cjs;
    const {initPromise} = host__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadRemote("remotePwa/ApolloTests"));
    const exportModule = await initPromise.then(_ => res);
    var host__loadRemote__remotePwa_mf_1_ApolloTests__loadRemote__ = exportModule;

const host__loadRemote__remotePwa_mf_1_ApolloTests__loadRemote___default = /*@__PURE__*/getDefaultExportFromCjs(host__loadRemote__remotePwa_mf_1_ApolloTests__loadRemote__);

const host__loadRemote__remotePwa_mf_1_ApolloTests__loadRemote__$1 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: host__loadRemote__remotePwa_mf_1_ApolloTests__loadRemote___default
}, [host__loadRemote__remotePwa_mf_1_ApolloTests__loadRemote__]);

export { host__loadRemote__remotePwa_mf_1_ApolloTests__loadRemote__$1 as h };
