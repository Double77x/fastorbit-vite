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
          filter: ({ path: routePath }) => !routePath.includes("#") && !routePath.includes("?"),
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
      // Bundle analysis — opt-in via `ANALYZE=1` (runs the visualizer for the
      // client environment only). Previously this ran on every build (~2 s,
      // 22% of build time) and, because the legacy `apply` filter does not
      // understand Vite 8 environments, it actually analyzed the SSR bundle
      // while writing a file named `bundle-analysis-client.html`.
      ...(process.env.ANALYZE
        ? [
            {
              ...visualizer({
                filename: "bundle-analysis-client.html",
                template: "treemap",
                open: false,
                gzipSize: true,
                brotliSize: true,
              }),
              applyToEnvironment: (environment: { name: string }) => environment.name === "client",
            },
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
        clsx: "cn",
        "tailwind-merge": "cn",
      },
    },

    build: {
      target: "esnext",
      minify: "oxc",
      cssCodeSplit: true,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 600,

      // NOTE: no `modulePreload.resolveDependencies` override. TanStack Start
      // emits its own `<link rel="modulepreload">` set during SSG, and a
      // custom allowlist only strips the dynamic-import preload map
      // (`__vite__mapDeps`), causing waterfalls on client navigation.
      // Vite's default (preload all static deps) is correct here.

      rolldownOptions: {
        output: {
          // NOTE: no explicit `codeSplitting` key — it defaults to `true`
          // (automatic splitting). Setting it explicitly is redundant, and
          // combining it with the deprecated `manualChunks` makes Rolldown
          // ignore `manualChunks` entirely (see output docs), so neither
          // is used; vendor grouping below uses the native groups API.
          //
          // Vendor grouping uses the native `codeSplitting.groups` API
          // (`manualChunks` is deprecated). Groups are intentionally few:
          // only long-lived, cross-route runtimes get a stable chunk for
          // immutable caching. Everything else uses automatic splitting so
          // async-only libs travel with their lazy chunk.
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

          // Native replacement for the deprecated `manualChunks` (Rollup
          // compat shim). `test` regexes are anchored on package boundaries
          // (`[\\/]` separators, pnpm-safe) so `react` never swallows
          // `@base-ui/react` or `@floating-ui/*` via substring matching.
          //
          // Deliberately NOT claimed (automatic splitting handles them):
          // - `@tanstack/*` — router/query/store are entry-static and stay
          //   in the entry; charts/table/virtual are async-only and travel
          //   with their lazy chunk. Claiming them in one group hoists the
          //   async-only libs into the entry (measured: +~350 kB rendered).
          // - `fuse.js`, `d3-shape` — async-only; auto-merge into their
          //   consumer chunk (fewer requests than a standalone vendor file).
          // - `cn`, `next-themes` — tiny and entry-static; a group would
          //   only add a round trip.
          // SSR/prerender bundle stays a single file — chunking it only
          // slows the build and complicates the server manifest.
          // NOTE: `isSsrBuild` is the legacy top-level flag. TanStack Start
          // builds client and server separately so this closure still
          // distinguishes them (verified: server output stays unchunked).
          // If Start ever moves fully to per-environment builds, switch to
          // `applyToEnvironment`-style gating instead.
          ...(isSsrBuild
            ? {}
            : {
                codeSplitting: {
                  groups: [
                    {
                      name: "vendor-react",
                      test: /node_modules[\\/](?:react|react-dom|scheduler)(?:[\\/]|$)/,
                    },
                    {
                      name: "vendor-ui",
                      test: /node_modules[\\/](?:@base-ui|@floating-ui)[\\/]|node_modules[\\/](?:class-variance-authority|lucide-react)(?:[\\/]|$)/,
                    },
                    {
                      name: "vendor-sonner",
                      test: /node_modules[\\/]sonner(?:[\\/]|$)/,
                    },
                  ],
                },
              }),
        },
      },
    },
  };
});
