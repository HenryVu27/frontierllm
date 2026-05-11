import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { createRequire } from "module";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { remarkHeadingId } from "remark-custom-heading-id";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

// https://vite.dev/config/
export default defineConfig(async () => {
  // Dynamically import ESM-only modules
  const chokidar = await import("chokidar");
  const { buildContent } = await import("./scripts/build-content.js");
  const { buildTextbook } = await import("./scripts/build-textbook.js");

  let rebuildTimer: ReturnType<typeof setTimeout> | null = null;

  const contentPlugin = {
    name: "frontierllm-content",

    async buildStart() {
      await buildContent();
      await buildTextbook();
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
          resolve(__dirname, "./content/textbook"),
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
            await buildTextbook();
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
            await buildTextbook();
            server.ws.send({ type: "full-reload" });
          } catch (err) {
            process.stderr.write(`[frontierllm-content] rebuild error: ${err}\n`);
          }
        }, 150);
      });
    },
  };

  return {
    plugins: [
      mdx({
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: "frontmatter" }],
          remarkGfm,
          remarkMath,
          remarkHeadingId,
        ],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          [rehypeKatex, { strict: false }],
          [
            rehypePrettyCode,
            {
              theme: { light: "github-light", dark: "github-dark-dimmed" },
              keepBackground: false,
            },
          ],
        ],
        providerImportSource: "@mdx-js/react",
      }),
      react(),
      tailwindcss(),
      contentPlugin,
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // Split heavy vendor libraries into separate cacheable chunks
            if (id.includes("node_modules/framer-motion")) return "vendor-motion";
            if (id.includes("node_modules/minisearch")) return "vendor-search";
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/react-router")
            ) return "vendor-react";
            if (
              id.includes("node_modules/radix-ui") ||
              id.includes("node_modules/cmdk") ||
              id.includes("node_modules/class-variance-authority") ||
              id.includes("node_modules/clsx") ||
              id.includes("node_modules/tailwind-merge")
            ) return "vendor-ui";
          },
        },
      },
    },
  } satisfies UserConfig;
});

// Suppress unused import warning for createRequire — used implicitly for CJS interop
void createRequire;
