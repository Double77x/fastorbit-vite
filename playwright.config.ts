import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8099",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Dedicated e2e port — NEVER reuse the dev default (8080). Reusing 8080
    // silently ran this suite against an unrelated project occupying the port
    // (green 404 test, bogus axe violations for another site's markup).
    // `reuseExistingServer: false` keeps runs deterministic: a lingering
    // server fails loudly here instead of testing stale code.
    command: "pnpm dev --port 8099",
    url: "http://localhost:8099",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
