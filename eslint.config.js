import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import vitest from "@vitest/eslint-plugin";

export default defineConfig([
  { ignores: ["dist", "node_modules", "coverage"] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true
      }
    },
    rules: {
      'no-console': [ 'warn', { allow: ['warn', 'error'] }],
    }
  },
  {
    files: ["tests/**/*.test.ts"],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
  
  eslintConfigPrettier,
]);