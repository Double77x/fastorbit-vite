# Fast Orbit Tech Stack

This project is a high-performance, privacy-first data visualization web app built with **TanStack Start (Build-Time SSG)** on **Cloudflare Pages**, optimized for instantaneous initial paint, zero FOUC, type safety, and 100% browser-local client processing.

## Core Frameworks

- **React 19:** Modern UI Library with concurrent rendering.
- **TypeScript:** Strict type system.
- **TanStack Start:** Framework providing build-time Static Site Generation (SSG) with automatic route crawling.
- **TanStack Router:** Fully type-safe routing with file-based route tree (`src/routeTree.gen.ts`).
- **TanStack Query (React Query):** Client & server state management.
- **Vite (v8):** Build tool and dev server.
- **Cloudflare Pages:** Global CDN static asset and HTML hosting.

## Styling, Fonts & UI

- **Tailwind CSS 4 (`@tailwindcss/vite`):** Utility-first styling with `@theme` token system.
- **Base UI (`@base-ui/react`):** Headless, accessible component primitives.
- **Lucide React:** Iconography.
- **Tailwind CSS Animate:** Keyframe-based animations with `animation-fill-mode: both`.
- **Self-Hosted Poppins:** WOFF2 fonts served from `/fonts/` with metric-matched `Poppins Fallback` and preloaded via `Route.head`.
- **Next Themes:** Dark/Light theme switching with pre-hydration inline script.

## Data Processing & Utilities

- **@tanstack/react-table:** Headless data table architecture powering the editable DataGrid with smart sorting, global filtering, and stable in-place cell editing.
- **@tanstack/react-virtual:** 60 FPS windowed row virtualization for large datasets.
- **@tanstack/react-hotkeys:** Cross-platform keyboard shortcuts and global hotkey manager.
- **Fuse.js:** In-memory fuzzy search for Quick Find command palette.
- **PapaParse:** In-browser CSV parsing.
- **XLSX (SheetJS):** In-browser Excel workbook processing.
- **HTML-to-Image:** Client-side vector and raster export.
- **Clsx & Tailwind Merge:** Class name utilities.
- **Oxlint & Biome:** High-speed linting and formatting.
- **Fallow:** Dead-code, duplication, complexity, and architecture linting (`fallow.toml`, `fallow audit --format json --quiet`, `fallow dead-code --trace`, `fallow health --hotspots`). Replaces knip; embedded `regression.baseline` for CI `--fail-on-regression`; agentic tidy gate (`exit 0`/`1` success, `2` error envelope).
- **Playwright:** End-to-end and accessibility (`@axe-core/playwright`) automated testing suite (axe-core via `@axe-core/playwright`; direct `axe-core`/`jest-axe` removed as unused — see `fallow dead-code --trace-dependency`).

## Project Standards

- **Theme Tokens:** Semantic tokens defined in `src/styles/index.css` (e.g. `bg-primary`, `text-muted-foreground`, `border-hairline`).
- **No `any`:** Strict TypeScript across all component interfaces and data loaders.
- **Zero FOUC:** Render-blocking stylesheets injected via `?url` in `Route.head`.
