# Bundling & Code Splitting — Agent Guide

How this repo keeps the critical entry lean on Cloudflare Pages (TanStack Start SSG + Vite 8 / Rolldown).
Read with `vite.config.ts` and `docs/CODING_STANDARDS.md` §7.

## Measured baseline (2026-09-17, `pnpm build`, client, minified)

| Chunk | Size (min / gzip) | Loaded |
|---|---|---|
| `index-*` entry | ~248 KB / ~77 KB | every page (render-blocking) |
| `vendor-react` | ~190 KB / ~60 KB | every page (stable, immutable-cached) |
| `vendor-ui` | ~207 KB / ~73 KB | every page (Base UI + floating-ui + lucide shared) |
| `vendor-sonner` | ~34 KB / ~9 KB | every page (global Toaster) |
| `WeatherSection-*` | ~192 KB / ~61 KB | home only, after hydration (below fold) |
| `CommandPaletteDialog-*` | ~34 KB / ~12 KB | on first palette open |
| `routes-*`, `Footer-*`, `Grid-*`, `Prose-*`, `*.lazy-*` | 1–36 KB | automatic per-route splits |

History: entry was **~459 KB min** before the 2026-09-17 pass (charts/table/virtual/fuse
statically reachable from the root). Legal pages preloaded ~885 KB; now ~669 KB.

## Rules

### 1. No barrels in `src`

- No `index.ts` re-export files, no `export *`. Import components directly
  (`@/components/weather/WeatherSection`, never `@/components/weather`).
- Prefer deep, named imports for deps too (`@base-ui/react/dialog`, not `@base-ui/react`;
  named lucide icons, never whole-library imports).
- Why: Rolldown can only drop what it can prove unused. Barrel chains defeat that,
  and one barrel import in the root shell pulls the whole barrel into the entry.

### 2. Lazy boundaries for heavy / on-demand UI

- Routes: `.lazy.tsx` for everything except `/` (see CODING_STANDARDS §4).
- Below-fold heavy sections (`WeatherSection`: charts + table + virtual) and
  on-demand UI (`CommandPaletteDialog`: Fuse + dialog + item registry) use
  `React.lazy` + `<Suspense>`:
  - Each lazy component gets its **own** boundary with a static fallback
    (skeleton / `null`). Never let a lazy chunk suspend the root — that blocks hydration.
  - Keep the `isClient` gate (`useState` + `useEffect`) inside prerender-sensitive
    components. Lazy alone does not guarantee the server skips them (Start may
    resolve Suspense during prerender); the gate is what prevents SSR DOM/API hangs.
  - Fallback/skeleton markup lives in a **light module** (no heavy imports) so both
    the Suspense fallback and the `!isClient` branch can share it without pulling
    the heavy libs back into the entry (`WeatherSectionSkeleton.tsx` pattern).
  - Hotkeys/event listeners that must work pre-load stay in a tiny eager trigger
    (`CommandPalette.tsx`); only the dialog body is lazy.

### 3. `vite.config.ts` — vendor groups

- `manualChunks` is **deprecated** (Rollup compat shim). Use `codeSplitting.groups`.
- Never set `codeSplitting: true` (or an object) alongside `manualChunks` — Rolldown
  ignores `manualChunks` when `codeSplitting` is specified.
- Keep groups **few and stable**: only long-lived, cross-route runtimes
  (`vendor-react`, `vendor-ui`, `vendor-sonner`) get immutable-cached chunks.
- **Never group by usage** (e.g. one `vendor-tanstack` for all `@tanstack/*`).
  Measured effect: async-only libs (charts/table/virtual) get hoisted into the
  entry (+~350 KB rendered). Leave them unclaimed — router/query/store stay in the
  entry naturally (entry-static), charts/table/virtual travel with their lazy chunk.
- `test` regexes must be package-boundary anchored and pnpm-safe:
  `/node_modules[\\/](?:react|react-dom|scheduler)(?:[\\/]|$)/`.
  Never substring-match (`includes("/react/")` swallows `@base-ui/react` and
  `@floating-ui/*`). Use `[\\/]`, never bare `/` (Windows). oxlint enforces
  non-capturing groups (`(?:…)`).
- SSR guard: groups apply to the client build only (`isSsrBuild` closure — Start
  builds the environments separately, so this still distinguishes them; verified by
  the unchunked `dist/server` output). If Start moves to per-environment builds,
  switch to `applyToEnvironment`.
- No `modulePreload.resolveDependencies` override. Start emits its own SSG preload
  set; an allowlist only strips the dynamic-import preload map and causes
  navigation waterfalls. Vite's default (preload static deps) is correct.

### 4. Asset naming (do not "fix")

- CSS emits **unhashed** (`assets/[name][extname]`): deterministic across the client
  and SSR prerender environments, avoiding hash-divergence 404s. Safe because
  `public/_headers` sets `Cache-Control: must-revalidate` (not `immutable`) for
  `/assets/*.css`. JS keeps `[hash]` + 1-year `immutable`.
- `clsx` / `tailwind-merge` are aliased to `cn` (single class-merge implementation;
  the `cn` package re-exports `clsx`/`twMerge`). Do not remove the alias.

### 5. Visualizer

- Opt-in only: `ANALYZE=1 npx vite build` (it costs ~2–4 s; never run it by default).
- Client environment only via `applyToEnvironment: (env) => env.name === "client"`.
  The legacy `apply: (_, { isSsrBuild })` filter does not understand Vite 8
  environments and silently analyzed the **SSR** bundle into a file named
  `bundle-analysis-client.html`.

## Verifying a change

1. `pnpm build` — compare the `index-*` entry line and the `legal/terms.html`
   preload total (sum the `<link rel="modulepreload">` targets in
   `dist/client/legal/terms.html`; it must not reference home-only chunks).
2. `ANALYZE=1 npx vite build` + inspect `bundle-analysis-client.html` — confirm new
   heavy deps land in the lazy chunk, not the entry.
3. `pnpm lint && pnpm test:unit` (+ `pnpm test:e2e`, which starts its own dev
   server on a dedicated port — see `playwright.config.ts`).
4. `npx fallow audit --format json --quiet` — no new dead code/duplication.

## Known follow-ups (measured, not yet acted on)

- `vendor-ui` (~207 KB min) rides on every page including legal. It is dominated by
  the `@base-ui/react` CJS umbrella (~382 KB rendered). If it grows, investigate
  per-primitive treeshaking before adding more Base UI primitives.
- `zod` (~153 KB rendered, root import) bundles ~70 locales via its internal
  `v4/locales` barrel. Tolerable while the entry stays <300 KB min; if the entry
  grows, validate the index route search schema without the zod root import.
- `@tanstack/table-core` bundles every table feature (pinning, grouping, faceting…)
  for a sort-only table — a library-side barrel. Revisit if table usage stays trivial.
