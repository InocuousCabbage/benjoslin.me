import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    // jsdom environment covers both the render-layer tests (which need
    // a DOM to mount into) and the source-grep / data-import pins
    // (which don't touch the DOM but don't mind having it available).
    // Simpler than per-file environment matching for a small suite.
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "lib/**/*.test.ts",
      "lib/**/*.test.tsx",
      "components/**/*.test.tsx",
      "components/**/*.render.test.tsx",
      "app/**/*.test.ts",
      "app/**/*.test.tsx",
    ],
  },
});
