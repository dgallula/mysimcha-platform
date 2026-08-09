import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextAppRootDirs = [
  join(__dirname, "apps/web"),
  join(__dirname, "apps/admin"),
  join(__dirname, "apps/landing"),
  join(__dirname, "apps/docs"),
];

/**
 * Root ESLint flat config for the MySimcha monorepo.
 *
 * Registers the official `@next/eslint-plugin-next` globally so `next build`
 * can detect it (it probes the config file path). Next rules are enabled
 * only for App Router apps under `apps/`.
 */
export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/coverage/**",
      "docker/data/**",
      "pnpm-lock.yaml",
      "**/next-env.d.ts",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Global registration — required for Next.js build-time plugin detection
    plugins: {
      "@next/next": nextPlugin,
    },
    settings: {
      next: {
        rootDir: nextAppRootDirs,
      },
    },
  },
  {
    files: ["apps/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    files: ["packages/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  eslintConfigPrettier,
);
