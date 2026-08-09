import { defineConfig, devices } from "@playwright/test";

const authSecret = process.env.AUTH_SECRET ?? "playwright-auth-secret-must-be-32-chars!";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm --filter @mysimcha/web dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      AUTH_SECRET: authSecret,
      AUTH_URL: "http://127.0.0.1:3000",
      AUTH_RATE_LIMIT_MAX: "100",
    },
  },
});
