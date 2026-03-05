import { h as host__mf_v__runtimeInit__mf_v__, a as index_cjs } from './host__mf_v__runtimeInit__mf_v__-CjaOuR8C.js';
import { h as host__loadShare__react__loadShare__ } from './host__loadShare__react__loadShare__-Cshx09tR.js';
import { h as host__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__ } from './host__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__-BzI4kPcQ.js';
import { j as jsxRuntimeExports } from './jsx-runtime-DtXR568w.js';
import './_commonjsHelpers-BAGoDD49.js';

// dev uses dynamic import to separate chunks
    
    const {loadShare} = index_cjs;
    const {initPromise} = host__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(_ => loadShare("@tanstack/query-persist-client-core", {
    customShareInfo: {shareConfig:{
      singleton: true,
      strictVersion: false,
      requiredVersion: "^5.92.1"
    }}}));
    const exportModule = await res.then(factory => factory());
    var host__loadShare___mf_0_tanstack_mf_1_query_mf_2_persist_mf_2_client_mf_2_core__loadShare__ = exportModule;

var PersistQueryClientProvider = ({
  children,
  persistOptions,
  onSuccess,
  onError,
  ...props
}) => {
  const [isRestoring, setIsRestoring] = host__loadShare__react__loadShare__.useState(true);
  const refs = host__loadShare__react__loadShare__.useRef({ persistOptions, onSuccess, onError });
  const didRestore = host__loadShare__react__loadShare__.useRef(false);
  host__loadShare__react__loadShare__.useEffect(() => {
    refs.current = { persistOptions, onSuccess, onError };
  });
  host__loadShare__react__loadShare__.useEffect(() => {
    const options = {
      ...refs.current.persistOptions,
      queryClient: props.client
    };
    if (!didRestore.current) {
      didRestore.current = true;
      host__loadShare___mf_0_tanstack_mf_1_query_mf_2_persist_mf_2_client_mf_2_core__loadShare__.persistQueryClientRestore(options).then(() => refs.current.onSuccess?.()).catch(() => refs.current.onError?.()).finally(() => {
        setIsRestoring(false);
      });
    }
    return isRestoring ? void 0 : host__loadShare___mf_0_tanstack_mf_1_query_mf_2_persist_mf_2_client_mf_2_core__loadShare__.persistQueryClientSubscribe(options);
  }, [props.client, isRestoring]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(host__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.QueryClientProvider, { ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx(host__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.IsRestoringProvider, { value: isRestoring, children }) });
};

export { PersistQueryClientProvider };
