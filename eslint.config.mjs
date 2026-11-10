import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
export default defineConfig([
  js.configs.recommended, ...tseslint.configs.recommended,
  { files: ['**/*.{ts,tsx}'], rules: { 'no-undef': 'off' } },
  { files: ['apps/web/src/**/*.{ts,tsx}'], plugins: { '@next/next': nextPlugin, 'react-hooks': reactHooks }, settings: { next: { rootDir: 'apps/web' } }, rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'error', ...nextPlugin.configs.recommended.rules, ...nextPlugin.configs['core-web-vitals'].rules } },
  globalIgnores(['**/.next/**', '**/dist/**', 'prototypes/**', 'fixtures/**', 'design/**', '.cache/**', 'playwright-report/**', 'test-results/**']),
]);
