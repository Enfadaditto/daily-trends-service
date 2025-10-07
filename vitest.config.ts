import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@src": srcPath,
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      exclude: [
        'src/infrastructure/adapters/api/express/createApp.ts',
        'src/infrastructure/config/env.ts',
        'src/infrastructure/adapters/persistence/mongo/models/**',
        'src/main/**',
        'eslint.config.js',
        'vitest.config.ts'
      ]
    },
  },
});