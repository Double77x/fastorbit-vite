# Graphite Architecture Overview

## 1. System Design

Graphite is a high-performance data visualization toolkit powered by **TanStack Start (Build-Time SSG)** on **Cloudflare Pages**. It combines instantaneous first-paint and SEO via pre-rendered static HTML with strict privacy and security by processing all user data (CSV/Excel parsing, image-to-SVG processing) 100% client-side in the browser.

### Key Modules

1. **Core (Landing & Marketing):**
   - Routes: `/` (`HomePage`), `/legal/*` (`Terms`, `Privacy`, `Cookies`, `Security`, `Changelog`).
   - Prerendered to static HTML at build time with embedded SEO meta, JSON-LD schemas, and OpenGraph headers.
2. **Graph Builder (`/graph`):**
   - **Controls:** Left sidebar for file drop (CSV/Excel), column mapping, axes configuration, styling palettes, and annotations.
   - **Canvas:** Main visualization engine (TSChart / SVG) supporting multi-tab workspaces and data grid editing.
   - **State:** Managed locally in state/reducers; no data is ever transmitted to a server.
3. **SVG Generator (`/make-svg`):**
   - **Input:** Image upload handling (PNG, JPG, SVG).
   - **Processing:** Canvas-based pixel scanning algorithms in [`src/components/svg-generator/logic.ts`](file:///C:/Users/Dan/Desktop/Master/13%20-%20Projects/graphite-vite/src/components/svg-generator/logic.ts).
   - **Output:** Vectorized geometric SVG output with real-time threshold, grid resolution, and invert controls.
4. **Quick Find Command Palette (`CommandPalette`):**
   - **Shortcuts:** Powered by `@tanstack/react-hotkeys` (`⌘K` / `Ctrl+K`, `/`, `Esc`).
   - **Dialog Shell:** Base UI Dialog (`@base-ui/react/dialog`) with smooth animations and accessibility.
   - **Search:** Client-side fuzzy search via Fuse.js across tools, sections, legal pages, chart types, and theme actions.

## 2. Routing & SSG Lifecycle (TanStack Start)

- **Entry Factory (`src/router.tsx`):** Exports the shared `createRouter(routeTree)` factory for both SSG build-time crawling and client hydration.
- **Root Document (`src/routes/__root.tsx`):** 
  - Emits `<HeadContent />` with preloaded fonts and render-blocking `?url` stylesheets.
  - Houses the pre-hydration dark mode initialization script.
  - Mounts global providers (`ThemeProvider`, `TooltipProvider`, `Sonner`).
- **File-Based Routes (`src/routes/`):**
  - Tool routes (`/graph`, `/make-svg`) and legal pages are code-split via `.lazy.tsx` chunks.
  - SSG prerender crawls and produces static `.html` files for all 11 routes during `pnpm build`.
- **Catch-All 404 (`src/routes/$.tsx`):**
  - Handles unmatched client routes cleanly.
- **HTML cache control (`scripts/append-html-headers.js`):**
  - Pages `_headers` rules match the request path, not the file on disk, so a prerendered `legal/terms.html` served at clean URL `/legal/terms` needs its own explicit entry (`/*.html` would never match).
  - `postbuild` scans `dist/client/**/*.html` and appends per-route `Cache-Control: public, max-age=0, must-revalidate` to the built `_headers`. HTML is tiny (~35–92KB) so revalidation is cheap; large hashed JS/CSS in `/assets/*` keeps 1-year `immutable`. Never hand-edit the generated block.

## 3. Data Flow & Security

- **Local User Data:** Data entered by the user (files, text paste, image blobs) is held exclusively in browser memory. No backend server or database exists.
- **Theme State:** Managed via `next-themes` and synchronized with `localStorage` and `matchMedia("(prefers-color-scheme: dark)")`.

## 4. Design System & Component Infrastructure

- **UI Primitives:** Base UI primitives (`@base-ui/react`) styled with Tailwind CSS v4 in `src/components/ui/` (`alert-variants.ts`/`label-variants.ts` mirror `button/badge-variants` for consistent `cva` API).
- **Layouts & Shells (DRY Centralization):**
  - `ToolLayout` (`src/components/layout/ToolLayout.tsx:30`): Shared header + sidebar layout for `/graph` and `/make-svg` with `docsReturnMode` prop (replaces brittle `title === "Graphite"` branch).
  - `ToolPanel`/`ToolPanelSection` (`src/components/layout/ToolPanel.tsx:1`): `aside`+`ScrollArea` shell (`lg:w-80`/`100`) and `text-xs tracking-wider uppercase` section headings — used by `GraphControls`/`SvgControls`.
  - `DocsLayout` (`src/components/layout/DocsLayout.tsx:1`): `BookOpen`+`Back` header and `max-w-4xl space-y-12 p-6 pb-24 lg:p-10` scroll container — used by `GraphDocs`/`SvgDocs` (fixes `supports-backdrop-filter` drift).
  - `LegalLayout` (`src/components/layout/LegalLayout.tsx:1`): Clean reading layout with breadcrumbs and Vercel-style hairline grid borders, now driven by `LegalLayout` + `Prose`/`ProseH2` (`src/components/layout/Prose.tsx:1`).
  - `Grid`/`layout-variants` (`src/components/layout/Grid.tsx:1`, `layout-variants.ts:1`): `variantClasses`/`paddingClasses` single-sourced; `Zone` deprecated/removed in favor of `Grid`.
  - `EmptyState`/`CanvasBackground` (`src/components/shared/EmptyState.tsx:1`) and `StateShell`/`CenteredState` (`src/components/shared/StateShell.tsx:1`): Unified `MousePointer2` empty and full-page error/404 shells (used by `GraphCanvas`, `SvgCanvas`, `GlobalErrorComponent`, `NotFoundComponent`).
  - `SectionHeading` (`src/components/shared/SectionHeading.tsx:1`) and `FileDropZone` (`src/components/shared/FileDropZone.tsx:1`): DRY headings for landing sections and file drop zones.
- **Navigation Single Source:** `src/data/navigation.ts:1` (`NAV_LINKS`, `FOOTER_*`, `COMMAND_STATIC_ITEMS` + `LEGAL_META` from `src/data/legal.ts:1`) drives `Navbar`, `Footer`, and `CommandPalette` (fuzzy search via Fuse.js) — eliminates drift between palette, footer, and route SEO.
- **Site Config:** `src/lib/site.ts:1` centralizes `url`, `email`, `links` (github/linkedin) for `Seo`/`Footer`/`ContactSection`.
- **Typography:** Self-hosted Poppins font family with pre-computed CSS metric fallbacks to prevent layout shift.
- **Logic Centralization:**
  - `src/lib/data-ingest.ts:1` (`cleanRowKeys`/`parseCsvText`/`ingestFromFile`/`ingestFromText`/`detectColumns`) — pure, testable parsers extracted from `Graph.tsx` (now using `cleanRows`/`detectColumns`).
  - `src/lib/download.ts:1` (`downloadBlob`/`Csv`/`SvgElement`/`DataUrl`/`withLightMode`/`safeDownload`) — removes 4× `createElement("a")` duplication.
  - `src/lib/virtualization.ts:1` (`VIRTUAL_GRID`/`VIRTUAL_PICKER`) — single-sources `ROW_HEIGHT`/`THRESHOLD`/`COL_MIN`/`OVERSCAN` for `DataGrid`/`ColumnPicker` virtualizers.
  - Hooks: `use-element-size` (from `GraphCanvas`), `use-navbar-scroll` (declarative `IntersectionObserver` sentinels replacing `document.createElement`), `use-file-drop`/`use-object-url` (available for future use).
- **Quality Gates:** `fallow.toml:1` (migrated from `knip.ts`) runs `dead-code`/`dupes`/`health`/`audit` with `ignorePatterns`/`ignoreDependencies` and embedded `regression.baseline` for CI `--fail-on-regression`.

