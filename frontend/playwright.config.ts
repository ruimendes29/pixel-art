import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

// E2E tests run against the production build (npm run build) served as a static
// site, so they need neither the Express API nor MySQL.
export default defineConfig({
  testDir: "./e2e",
  // *.e2e.ts so Vitest's default *.test/*.spec pattern doesn't pick these up
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx serve -s build -l ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
