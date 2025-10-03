import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

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
  eslintConfigPrettier,
]);