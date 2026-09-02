/// <reference types="vitest" />
import { defineConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig(({ mode, isSsrBuild }) => {
  const isProduction = mode === "production";

  return {
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test-setup.ts",
      css: true,
      include: ["tests/**/*.test.{ts,tsx}"],
    },
    server: {
      host: "::",
      port: 8080,
      open: true,
    },
    plugins: [
      // TanStack Start (bundles its own router + code-splitting plugins).
      // Do NOT also add TanStackRouterVite() here — the duplicate triggers
      // "TSRSplitComponent is not defined" during SSR dev.
      tanstackStart({
        srcDirectory: "src",
        prerender: {
          enabled: true,
          crawlLinks: true,
          failOnError: true,
          autoSubfolderIndex: false,
          filter: ({ path: routePath }) => !routePath.includes("#"),
        },
        pages: [{ path: "/404" }],
        // Inline critical CSS to eliminate FOUC on hard refresh:
        // without this, the stylesheet is a separate blocking request and
        // TanStack'"'"'s streaming can paint before it arrives.
        server: {
          build: {
            inlineCss: { enabled: true, transformAssets: true },
          },
        },
      }),
      react(),
      tailwindcss(),
      {
        ...visualizer({
          filename: "bundle-analysis-client.html",
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
        apply: (_config, { isSsrBuild: isCurrentSsr }) => !isCurrentSsr,
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },

    build: {
      target: "esnext",
      minify: "oxc",
      cssCodeSplit: true,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 600,

      modulePreload: {
        resolveDependencies: (_filename, deps) => {
          const coreChunks = ["vendor-react", "vendor-tanstack", "vendor-utils"];
          return deps.filter((dep) => coreChunks.some((core) => dep.includes(core)));
        },
      },

      rolldownOptions: {
        output: {
          codeSplitting: true,
          minify: {
            compress: {
              dropConsole: isProduction,
              dropDebugger: isProduction,
            },
          },

          comments: {
            legal: !isProduction,
          },

          entryFileNames: (assetInfo) => {
            if (assetInfo.name === "server") {
              return "[name].js";
            }
            return "assets/[name]-[hash].js";
          },
          chunkFileNames: "assets/chunk-[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith(".css")) {
              return "assets/[name][extname]";
            }
            return "assets/[name]-[hash][extname]";
          },

          manualChunks(id) {
            if (isSsrBuild) return;

            const normalizedId = id.replaceAll("\\", "/");

            if (normalizedId.includes("node_modules")) {
              if (normalizedId.includes("@tanstack") || normalizedId.includes("tanstack")) {
                return "vendor-tanstack";
              }

              if (
                normalizedId.includes("/react/") ||
                normalizedId.includes("/react-dom/") ||
                normalizedId.includes("/scheduler/") ||
                normalizedId.includes("/react-is/")
              ) {
                return "vendor-react";
              }

              if (
                normalizedId.includes("@base-ui") ||
                normalizedId.includes("class-variance-authority") ||
                normalizedId.includes("lucide-react")
              ) {
                return "vendor-ui-core";
              }

              if (normalizedId.includes("sonner") || normalizedId.includes("@floating-ui")) {
                return "vendor-sonner";
              }

              if (normalizedId.includes("fuse.js")) {
                return "vendor-fuse";
              }

              if (normalizedId.includes("tailwind-merge") || normalizedId.includes("clsx")) {
                return "vendor-utils";
              }

              if (normalizedId.includes("d3-shape")) {
                return "vendor-charts";
              }
              if (normalizedId.includes("next-themes")) {
                return "vendor-themes";
              }
            }
          },
        },
      },
    },
  };
});
