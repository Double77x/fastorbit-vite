# Fast Orbit — Agent Guide

This file is the single source for AI coding agents working in this repo. Read it before any task. Human docs: `README.md`, `docs/`.

## Project

Fast Orbit is a TanStack Start (SSG) starter on Cloudflare Pages — `fastorbit.danread.gq`. Type-safe Router + Query + Table + Virtual + Charts + Hotkeys, Base UI + shadcn, Tailwind v4, self-hosted Poppins. All routes prerender to `dist/client` and are served as static HTML.

## Stack Decisions (from GEMINI.md — now merged)

- `[2026-09-01]`: TanStack Start CSS & Font Loading Architecture -> Use `import fontsCss from "@/styles/fonts.css?url";` and `import indexCss from "@/styles/index.css?url";` in `src/routes/__root.tsx` and pass them into `Route.head({ links: [{ rel: "stylesheet", href: fontsCss }, { rel: "stylesheet", href: indexCss }] })`. Side-effect CSS imports (`import "@/styles/index.css"`) are treated by Vite/TanStack Start as async client bundle chunks rather than render-blocking `<head>` resources, causing severe FOUC where elements start smaller in fallback fonts and pop to full size upon hydration.
- `[2026-09-01]`: Font Metric Matching & Preload Strategy -> Self-host Poppins font weights (`300`, `400`, `500`, `600`, `700`) in `public/fonts/` with `font-display: swap` and a metric-adjusted fallback (`Poppins Fallback` on `local("Arial")` with `size-adjust: 98.5%`, `ascent-override: 105%`, `descent-override: 35%`, `line-gap-override: 0%`). Preload all critical weights in `Route.head` to eliminate font-swap layout shift.
- `[2026-09-01]`: CSS Keyframe Animation Stability -> Staggered CSS animations (e.g. `--animate-fade-in` with `animationDelay: 0.3s`) must use `animation-fill-mode: both` rather than `forwards`. This ensures the element applies the `0%` keyframe state during the initial delay rather than popping abruptly from `translateY(0)` to `translateY(20px)` when the animation begins.
- `[2026-09-01]`: TanStack Start Root Layout Pattern -> Use `shellComponent: RootDocument` in `createRootRoute` rendering `<html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>`, with `component: RootComponent` rendering providers (`ThemeProvider`, `TooltipProvider`, `Outlet`, `Sonner`). Avoid injecting un-reset inline `<style>` tags in `<head>` that conflict with Tailwind's Preflight resets.
- `[2026-09-01]`: TanStack Hotkeys & Quick Find Architecture -> Integrated `@tanstack/react-hotkeys` with `HotkeysProvider` wrapping the root component tree. Global shortcuts (`Mod+K`, `/`, `Escape`) trigger the accessible Base UI Dialog `CommandPalette` with Fuse.js client-side fuzzy search across sections, legal routes, and theme actions.
- `[2026-09-01]`: Deterministic CSS Asset Naming -> In `vite.config.ts`, configure `assetFileNames` to emit `.css` files as `assets/[name][extname]` (`assets/index.css`, `assets/fonts.css`). This eliminates hash divergence between Client and SSR prerendering environments, preventing 404 MIME type errors in production.
- `[2026-09-01]`: Inline Adaptive SVG Logo Architecture -> Implemented `Logo.tsx` as an inline adaptive SVG component with CSS-switched gradients instead of dual `<img>` tags. This prevents React 19 SSR from generating image preloads for hidden light/dark variants, eliminating browser "preloaded using link preload but not used" console warnings.
- `[2026-09-02]`: Fallow Migration (knip -> fallow) -> Migrated `knip.ts` (`project`, `ignore`, `ignoreDependencies: tailwindcss-animate`) to `fallow.toml` (TOML, `ignorePatterns`, `ignoreDependencies`, `ignoreExportsUsedInFile`, `production=false`, `[rules]`, `[duplicates]`, `[health]`, `[audit] gate=new-only`, `[boundaries] bulletproof`, `[regression.baseline]`). Removed `axe-core`/`jest-axe` (0 imports, `fallow dead-code --trace-dependency`), kept `@tanstack/react-query` (future use) and `tailwindcss`/`react-doctor` (build/lint false positives) via `ignoreDependencies`. Added `tests/*.test.ts` mirroring `src` unit tests and consolidated `test.include` to `src+tests`. Agentic gate: `npx fallow audit --format json --quiet 2>/dev/null` with `0/1=success, 2=error envelope`.
- `[2026-09-02]`: Fallow Agentic Tidy Process -> Use `fallow audit` after each feature, `fallow dead-code --trace <file>:<export>` before deleting flagged exports, `fallow health --hotspots` for refactoring prioritization, and `fallow guard <files>` before editing. CI uses embedded `regression.baseline` with `--fail-on-regression`. See `fallow.toml:1` and `docs/CODING_STANDARDS.md:17`.
- `[2026-09-02]`: TanStack Start Prerender Hang -> `vite build` hung at `Prerendering pages...` for minutes. Root causes: (1) `tanstackStart({ prerender: { crawlLinks: true } })` crawled hash links (`/#features`, `/#quick-start` etc) as separate pages and retried; fix `filter: ({ path: routePath }) => !routePath.includes("#")`. (2) `WeatherSection` used `useSearch`/`useWeather`/`useVirtualizer` during SSR — `fetchWeather` hit `open-meteo` on server and `Base UI` virtualizer measured DOM, causing hang; fix `useWeather` `enabled: isClient && ...` + `keepPreviousData` and `WeatherSection` client gate (`isClient` + skeleton) so prerender emits static skeletons only. (3) `vite.config.ts` `manualChunks` still referenced deleted deps (`d3-scale`, `papaparse`, `xlsx`, `html-to-image`) — removed `vendor-parse`/`vendor-export`, kept `d3-shape` for Charts. After fix `pnpm build` prerenders 7 pages in ~0.7s.

## UI Primitives

We intentionally stripped `src/components/ui/*` to keep the starter minimal. The remaining primitives are `button`, `badge`, `card`, `dialog`, `combobox`, `tooltip`, `input`. When you need another primitive, re-add the Base UI + shadcn version, not Radix:

```bash
pnpm dlx shadcn@latest add <primitive> --yes
# e.g. pnpm dlx shadcn@latest add alert label scroll-area select separator slider switch tabs textarea --yes
```

Then rewire the generated file from `@radix-ui/*` to `@base-ui/react/*` (see `src/components/ui/dialog.tsx` as reference) and run `pnpm lint` + `npx fallow dead-code --trace src/components/ui/<primitive>.tsx:Export` to confirm no dead code. Fallow is silenced for primitives via `fallow.toml:ignorePatterns` — remove the entry when the file is re-added.

## Working Agreements

- Prefer `edit`/`read`/`grep`/`glob` over shell; use `skill` when a task matches a skill (Humanizer, Cloudflare, etc.).
- Use TanStack Query (`useQuery` + `keepPreviousData`) — no `useEffect` fetch. Use Router search for URL state.
- Run `pnpm lint`, `pnpm format`, `pnpm build` before finishing; check `fallow audit` for dead code.
