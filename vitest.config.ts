import { defineConfig } from "vitest/config";

// Vitest solo sugli unit test in lib/. Gli e2e (e2e/*.spec.ts) girano con Playwright.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
  },
});
