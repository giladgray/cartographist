/* eslint-env node */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    jquery: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  // do not lint compiled files
  ignorePatterns: ['**/build/'],
  parser: '@typescript-eslint/parser',
  plugins: ['ban', 'import', 'jsdoc', 'simple-import-sort', 'react-hooks'],
  settings: {
    // https://github.com/benmosher/eslint-plugin-import/pull/1526
    'import/external-module-folders': ['node_modules', 'node_modules/@types'],
    // use eslint-import-resolver-typescript
    'import/resolver': { typescript: {} },
    react: {
      version: 'detect',
      linkComponents: [
        // Components used as alternatives to <a> for linking, eg. <Link to={ url } />
        { name: 'Link', linkAttribute: 'to' },
      ],
    },
  },
  rules: {
    eqeqeq: ['error', 'always', { null: 'never' }],
    'arrow-body-style': ['error', 'as-needed'],
    'object-shorthand': ['error', 'always'],
    'no-lonely-if': 'error',
    'nonblock-statement-body-position': 'error',
    'ban/ban': [
      'error',
      { name: ['it', 'only'], message: 'Do not commit this!!' },
      { name: ['describe', 'only'], message: 'Do not commit this!!' },
      { name: ['console', 'log'], message: 'Do not commit this!!' },
      { name: ['console', 'tron'], message: 'Do not commit this!!' },
    ],
    'import/order': 'off',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-named-default': 'error',
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
    'react/jsx-curly-brace-presence': 'error',
    'react/jsx-fragments': 'error',
    'react/prop-types': 'off',
    'react/self-closing-comp': 'error',
    'react/no-deprecated': 'error',
    'react/no-unescaped-entities': 'off',
    'react/no-render-return-value': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'simple-import-sort/imports': ['error'],
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/ban-types': 'off', // TODO
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': ['error', { overrides: { constructors: 'off' } }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/naming-convention': [
      'off',
      {
        selector: 'default',
        format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-use-before-declare': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/triple-slash-reference': ['error', { types: 'prefer-import' }],
    '@typescript-eslint/padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: ['function', 'interface'], next: '*' },
      { blankLine: 'always', prev: '*', next: ['function', 'interface'] },
      { blankLine: 'always', prev: ['block-like'], next: 'export' },
      { blankLine: 'always', prev: 'export', next: ['block-like'] },
    ],
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/type-annotation-spacing': 'off',
    '@typescript-eslint/unified-signatures': 'error',
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-param-names': ['error', { checkDestructured: false }],
    'jsdoc/check-property-names': 'error',
    'jsdoc/check-tag-names': ['error', { definedTags: ['internal'] }],
    'jsdoc/empty-tags': 'error',
    'jsdoc/multiline-blocks': 'error',
    'jsdoc/no-types': 'error', // no types in typescript (*.js override below)
    'jsdoc/require-asterisk-prefix': 'error',
    // require descriptions unless you use certain tags
    'jsdoc/require-description': ['error', { exemptedBy: ['deprecated', 'internal', 'inheritdoc', 'param', 'type'] }],
    // ensure name & desc when you do use @param, @property, @returns:
    // (but do not require those tags all the time)
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-param-name': 'error',
    'jsdoc/require-property-name': 'error',
    'jsdoc/require-property-type': 'error',
    'jsdoc/require-returns-description': 'error',
    'jsdoc/tag-lines': 'error',
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'jsdoc/no-types': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
