import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        browser: true,
        es2020: true,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'unused-imports/no-unused-imports': 'error',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^\\u0000' /* Side effect imports. Ex: "import './App.css'" */],
            [
              // External Packages.
              // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
              '^@?\\w',
            ],
            [
              // Absolute internal imports.
              '@/',
            ],
            [
              // Internal packages.
              '^(src)(/.*|$)',
              '^\\.',
            ],
          ],
        },
      ],
      'react/display-name': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    ignores: ['dist/**'],
  },
);
