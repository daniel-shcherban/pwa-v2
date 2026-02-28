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

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = host__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("react-dom", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^19.2.0"
    }}}));
    const exportModule = await res.then(factory => factory());
    var host__loadShare__react_mf_2_dom__loadShare__ = exportModule;

const host__loadShare__react_mf_2_dom__loadShare___default = /*@__PURE__*/getDefaultExportFromCjs(host__loadShare__react_mf_2_dom__loadShare__);

const ReactDOM = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: host__loadShare__react_mf_2_dom__loadShare___default
}, [host__loadShare__react_mf_2_dom__loadShare__]);

export { ReactDOM as R, host__loadShare__react_mf_2_dom__loadShare__ as h };
