module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [ 'import', 'simple-import-sort', '@typescript-eslint', 'prettier', 'vitest'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [ '.eslintrc.js' ],
  rules: {
    'object-shorthand': 2,
    'prettier/prettier': [ 2, { singleQuote: true, endOfLine: 'auto' } ],
    quotes: [ 2, 'single',{ avoidEscape: true } ],
    'no-console': 2,
    'prefer-regex-literals': 2,
    'max-len': [ 2, 120, { ignoreUrls: true, ignorePattern: '^import .*' } ],
    'no-trailing-spaces': 2,
    'import/no-default-export': 2,
    '@typescript-eslint/consistent-type-imports': 2,
    'arrow-spacing': 2,
    'no-unused-vars': 0,
    'lines-between-class-members': [ 2, 'never' ],
    'padded-blocks': [ 2, 'never' ],
    'no-multiple-empty-lines': [ 2, { max: 1, maxEOF: 0, maxBOF: 0 } ],
    'padding-line-between-statements': [ 2, { blankLine: 'always', prev: 'import', next: 'export' } ],
    'simple-import-sort/imports': 2,
    'simple-import-sort/exports': 2,
    'import/first': 2,
    'import/newline-after-import': 2,
    'import/no-duplicates': 2,
    'space-infix-ops': 0,
    '@typescript-eslint/space-infix-ops': 2,
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        argsIgnorePattern: '_',
      },
    ],
    '@typescript-eslint/member-delimiter-style': [
      2,
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      },
    ],
    'arrow-body-style': 1,
    'arrow-parens': [ 2, 'always' ],
    'comma-spacing': 2,
    'no-multiple-empty-lines': [
      2,
      {
        max: 1,
        maxEOF: 1,
      },
    ],
    'no-multi-spaces': 2,
    'object-curly-spacing': 0,
    '@typescript-eslint/object-curly-spacing': [ 2, 'always' ],
    'key-spacing': [
      1,
      {
        afterColon: true,
        beforeColon: false,
        mode: 'strict',
      },
    ],
    '@typescript-eslint/keyword-spacing': [
      1,
      {
        after: true,
        before: true,
      },
    ],
    'space-before-blocks': [ 1 ],
    '@typescript-eslint/no-empty-interface': [ 2 ],
    'template-curly-spacing': [ 2, 'never' ],
    '@typescript-eslint/type-annotation-spacing': 2,
  },
  overrides: [
    {
      files: [ '**/__tests__/*' ],
      extends: ['plugin:vitest/recommended'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 0,
        'max-len': 0,
        'vitest/expect-expect': 0,
      },
    },
  ],
};
