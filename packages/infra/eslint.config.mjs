import { fixupConfigRules } from '@eslint/compat';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import stylisticJs from '@stylistic/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['**/dist', '**/eslint.config.mjs', '**/bin'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ),
  ),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      '@stylistic/js': stylisticJs,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: tsParser,
    },

    rules: {
      '@stylistic/js/max-len': [
        'error',
        {
          code: 120,
          ignoreUrls: true,
          tabWidth: 2,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': 0,
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [['^\\u0000'], ['^@?\\w'], ['@/'], ['^(src)(/.*|$)', '^\\.']],
        },
      ],
      '@typescript-eslint/unbound-method': 'off',
    },
  },
];
