import { h as host__mf_v__runtimeInit__mf_v__, a as index_cjs } from './host__mf_v__runtimeInit__mf_v__-CjaOuR8C.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = host__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("@tanstack/react-query", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^5.90.21"
    }}}));
    const exportModule = await res.then(factory => factory());
    var host__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__ = exportModule;

export { host__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__ as h };
