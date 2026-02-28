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
    const res = initPromise.then(_ => loadShare("react", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^19.2.0"
    }}}));
    const exportModule = await res.then(factory => factory());
    var host__loadShare__react__loadShare__ = exportModule;

const React = /*@__PURE__*/getDefaultExportFromCjs(host__loadShare__react__loadShare__);

const React$1 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  default: React
}, [host__loadShare__react__loadShare__]);

export { React as R, React$1 as a, host__loadShare__react__loadShare__ as h };
