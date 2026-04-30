import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { createRequire } from "module";

// https://vite.dev/config/
export default defineConfig(async () => {
  // Dynamically import ESM-only modules
  const chokidar = await import("chokidar");
  const { buildContent } = await import("./scripts/build-content.js");

  let rebuildTimer: ReturnType<typeof setTimeout> | null = null;

  const contentPlugin = {
    name: "frontierllm-content",

    async buildStart() {
      await buildContent();
    },

    configureServer(
      server: import("vite").ViteDevServer
    ) {
      // Watch notes/ and projects/ for changes in dev mode (chokidar v5 ESM)
      const watcher = chokidar.watch(
        [
          resolve(__dirname, "../notes"),
          resolve(__dirname, "../projects"),
          resolve(__dirname, "../README.md"),
        ],
        {
          ignoreInitial: true,
          persistent: true,
        }
      );

      watcher.on("change", () => {
        // Debounce ~150ms to avoid multiple rapid rebuilds on multi-file saves
        if (rebuildTimer) clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(async () => {
          try {
            await buildContent();
            // Touch the manifest to trigger HMR
            server.ws.send({ type: "full-reload" });
          } catch (err) {
            process.stderr.write(`[frontierllm-content] rebuild error: ${err}\n`);
          }
        }, 150);
      });

      watcher.on("add", () => {
        if (rebuildTimer) clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(async () => {
          try {
            await buildContent();
            server.ws.send({ type: "full-reload" });
          } catch (err) {
            process.stderr.write(`[frontierllm-content] rebuild error: ${err}\n`);
          }
        }, 150);
      });
    },
  };

  return {
    plugins: [react(), tailwindcss(), contentPlugin],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
  };
});

// Suppress unused import warning for createRequire — used implicitly for CJS interop
void createRequire;
