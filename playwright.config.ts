import { defineConfig, devices } from "@playwright/test";

// E2E — funnel, landing, 404. Il browser lo risolve Playwright dall'installazione
// locale (`npx playwright install chromium`): nessun path hardcoded, gira ovunque.
// I test mockano /api/* → zero scritture e notifiche reali.
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3123",
    trace: "off",
  },
  projects: [{ name: "mobile", use: { ...devices["Pixel 5"] } }],
  webServer: {
    command: "npx next start -p 3123",
    url: "http://localhost:3123",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
