// Postbuild: append per-route HTML `Cache-Control` entries to the Pages `_headers` file.
//
// Why this exists:
// - Cloudflare Pages `_headers` rules match the *request path*, not the file
//   on disk. A prerendered `legal/terms.html` is served at the clean URL
//   `/legal/terms`, so a `/*.html` rule would never match what browsers
//   actually request. Each prerendered route needs its own explicit entry.
// - Without it, browsers hold stale HTML after a deploy and users miss new
//   content until a hard refresh. HTML entries use
//   `public, max-age=0, must-revalidate` so every navigation revalidates
//   (cheap 304 when unchanged) and new deploys show instantly.
// - This stays fast: prerendered HTML is tiny (~35-92KB) while the large
//   hashed JS/CSS in `/assets/*` keeps `immutable` 1-year caching.
//
// How it works:
// - Scans `<outputDir>/**/*.html` (default `dist/client`, override with
//   `PAGES_OUTPUT_DIR`), maps each file to its clean route
//   (`index.html` -> `/`, `legal/terms.html` -> `/legal/terms`,
//   `404.html` -> `/404`), and appends a marked block to
//   `<outputDir>/_headers` (copied from `public/_headers` by Vite).
// - Idempotent: any previous generated block between the markers is replaced,
//   so re-running never duplicates entries. Never hand-edit the generated
//   block — edit `public/_headers` or this script instead.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const HTML_CACHE_CONTROL = "public, max-age=0, must-revalidate";
export const START_MARKER = "# >>> GENERATED HTML no-cache (scripts/append-html-headers.js) — do not edit manually";
export const END_MARKER = "# <<< GENERATED HTML no-cache";

export const resolveOutputDir = () => path.resolve(process.env.PAGES_OUTPUT_DIR ?? path.join("dist", "client"));

/**
 * Map a `.html` file path (relative to the Pages output dir) to its clean
 * route. Handles `index.html` shorthands and Windows separators.
 */
export const htmlFileToRoute = (relativePath) => {
  const normalized = relativePath.replaceAll("\\", "/");
  if (normalized === "index.html") return "/";
  if (normalized.endsWith("/index.html")) {
    return `/${normalized.slice(0, -"/index.html".length)}`;
  }
  return `/${normalized.slice(0, -".html".length)}`;
};

const collectHtmlFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
};

/** List clean routes for every prerendered `.html` file, `/` first. */
export const collectHtmlRoutes = (outputDir) =>
  collectHtmlFiles(outputDir)
    .map((file) => htmlFileToRoute(path.relative(outputDir, file)))
    .toSorted((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));

/** Build the generated `_headers` block for the given routes. */
export const buildHtmlHeadersBlock = (routes) => {
  const lines = [START_MARKER];
  for (const route of routes) {
    lines.push(route, `  Cache-Control: ${HTML_CACHE_CONTROL}`);
  }
  lines.push(END_MARKER);
  return lines.join("\n");
};

/** Remove a previously generated block so re-runs stay idempotent. */
export const stripGeneratedBlock = (content) =>
  content
    .replace(new RegExp(`${escapeRegExp(START_MARKER)}[\\s\\S]*?${escapeRegExp(END_MARKER)}\\n?`, "u"), "")
    .trimEnd();

const escapeRegExp = (value) => value.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);

export const appendHtmlHeaders = (outputDir = resolveOutputDir()) => {
  if (!fs.existsSync(outputDir) || !fs.statSync(outputDir).isDirectory()) {
    console.error(`❌ Pages output dir not found: ${outputDir}`);
    process.exitCode = 1;
    return { outputDir, routes: [], wrote: false };
  }

  const routes = collectHtmlRoutes(outputDir);
  if (routes.length === 0) {
    console.warn(`⚠️ No .html files found in ${outputDir} — skipping header append.`);
    return { outputDir, routes, wrote: false };
  }

  const headersPath = path.join(outputDir, "_headers");
  const existing = fs.existsSync(headersPath) ? fs.readFileSync(headersPath, "utf8") : "";
  if (!fs.existsSync(headersPath)) {
    console.warn(`⚠️ No _headers found in ${outputDir} — creating one with HTML entries only.`);
  }
  const next = `${stripGeneratedBlock(existing)}\n\n${buildHtmlHeadersBlock(routes)}\n`;
  fs.writeFileSync(headersPath, next);
  console.log(`✅ Appended ${routes.length} HTML no-cache header(s) to ${headersPath}`);
  for (const route of routes) console.log(`   ${route}`);
  return { outputDir, routes, wrote: true };
};

const invokedDirectly = (() => {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
})();

if (invokedDirectly) appendHtmlHeaders();
