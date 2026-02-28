import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { UIStateProvider } from "./utils/UIStateProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RemoteTodos from "./components/RemoteTodos";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UIStateProvider>
        <RemoteTodos />
      </UIStateProvider>
    </QueryClientProvider>
  </StrictMode>,
);
