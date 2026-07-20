import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

// Vitest solo sugli unit test in lib/. Gli e2e (e2e/*.spec.ts) girano con Playwright.
// Alias "@" → root, coerente con i path di tsconfig (es. @/data/catalogo.json).
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": root,
    },
  },
});
