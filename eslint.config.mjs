import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
export default defineConfig([
  js.configs.recommended, ...tseslint.configs.recommended,
  { files: ['**/*.{ts,tsx}'], rules: { 'no-undef': 'off' } },
  { files: ['apps/web/scripts/database.mjs', 'examples/sdk-react/*.mjs', 'scripts/{format,check-sdk-package,verify-sdk-registry,prepare-sdk-consumer,pack-sdk,release-check,build-standard-sites,build-browser-demo}.mjs'], languageOptions: { globals: { console: 'readonly', process: 'readonly', Buffer: 'readonly', URL: 'readonly', fetch: 'readonly', AbortSignal: 'readonly' } } },
  { files: ['apps/web/src/**/*.{ts,tsx}'], plugins: { '@next/next': nextPlugin, 'react-hooks': reactHooks }, settings: { next: { rootDir: 'apps/web' } }, rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'error', ...nextPlugin.configs.recommended.rules, ...nextPlugin.configs['core-web-vitals'].rules } },
  globalIgnores(['**/.next/**', '**/dist/**', 'prototypes/**', 'fixtures/**', 'design/**', '.cache/**', 'playwright-report/**', 'test-results/**']),
]);
