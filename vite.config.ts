import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  return {
    base: mode === "production" ? "/pwa-v2/" : "/",
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        minify: false,
        devOptions: {
          enabled: true,
          type: "module",
        },
      }),
      federation({
        name: "host",
        remotes: {
          remotePwa: {
            // link to repo: https://github.com/daniel-shcherban/remote-app-v3
            entry:
              "https://daniel-shcherban.github.io/remote-app-v3/remoteEntry.js",
            type: "module",
            name: "remotePwa",
            entryGlobalName: "remotePwa",
            shareScope: "default",
          },
        },
        shared: {
          react: {
            singleton: true,
          },
          "react-dom": {
            singleton: true,
          },
          "react-router": {
            singleton: true,
          },
          "react-router-dom": {
            singleton: true,
          },
          "@ev/eva-container-api": {
            singleton: true,
          },
          "@tanstack/react-query": {
            singleton: true,
          },
        },
      }),
    ],
    build: {
      modulePreload: false,
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
  };
});
