import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const SCRIPT = path.join(REPO_ROOT, "scripts", "append-html-headers.js");

const runScript = (outputDir: string) =>
  execFileSync("node", [SCRIPT], {
    cwd: REPO_ROOT,
    env: { ...process.env, PAGES_OUTPUT_DIR: outputDir },
    encoding: "utf8",
  });

const makeFixture = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-headers-"));
  fs.writeFileSync(path.join(dir, "index.html"), "<h1>home</h1>");
  fs.writeFileSync(path.join(dir, "404.html"), "<h1>missing</h1>");
  fs.mkdirSync(path.join(dir, "legal"), { recursive: true });
  fs.writeFileSync(path.join(dir, "legal", "terms.html"), "<h1>terms</h1>");
  fs.writeFileSync(path.join(dir, "_headers"), "/*\n  Cache-Control: public, max-age=0, must-revalidate\n");
  return dir;
};

describe("append-html-headers postbuild script", () => {
  it("maps prerendered html files to clean routes with no-cache headers", () => {
    const dir = makeFixture();
    runScript(dir);
    const headers = fs.readFileSync(path.join(dir, "_headers"), "utf8");
    for (const route of ["/", "/404", "/legal/terms"]) {
      expect(headers).toContain(`${route}\n  Cache-Control: public, max-age=0, must-revalidate`);
    }
    // Base headers survive the append.
    expect(headers).toContain("/*\n  Cache-Control: public, max-age=0, must-revalidate");
  });

  it("is idempotent across re-runs", () => {
    const dir = makeFixture();
    runScript(dir);
    runScript(dir);
    const headers = fs.readFileSync(path.join(dir, "_headers"), "utf8");
    const occurrences = headers.split("GENERATED HTML no-cache").length - 1;
    expect(occurrences).toBe(2); // start + end marker, exactly one block
    expect(headers.match(/^\/legal\/terms$/gmu)?.length).toBe(1);
  });
});
