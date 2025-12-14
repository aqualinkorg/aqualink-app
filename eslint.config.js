const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const fp = require('eslint-plugin-fp');
const prettier = require('eslint-plugin-prettier');
const importPlugin = require('eslint-plugin-import');
// const reactHooks = require('eslint-plugin-react-hooks'); // Temporarily disabled due to ESLint 9 compatibility
const react = require('eslint-plugin-react');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  // Base JavaScript recommended rules
  js.configs.recommended,

  // Ignore patterns
  {
    ignores: [
      '**/src/serviceWorker.ts',
      '**/db_data/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'eslint.config.js',
      '**/.jest-cache/**',
    ],
  },

  // Base configuration for all files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      fp,
      prettier,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          moduleDirectory: ['node_modules', './src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    rules: {
      // Disable default rule for TS rule
      'no-use-before-define': 'off',
      'no-unused-vars': 'off',
      'no-shadow': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-use-before-define': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^props$',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-redeclare': 'error',
      // Allow named exports only files
      'import/prefer-default-export': 0,
      'object-curly-spacing': [
        'error',
        'always',
        {
          arraysInObjects: true,
          objectsInObjects: true,
        },
      ],
      // More verbose prettier suggestions
      'prettier/prettier': ['warn'],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      // Warnings to enforce functional programming styles - e.g. no unintended mutations
      'fp/no-delete': 'warn',
      'fp/no-mutating-assign': 'warn',
      'fp/no-mutating-methods': 'warn',
      'fp/no-mutation': [
        'warn',
        {
          commonjs: true,
          allowThis: true,
          exceptions: [
            {
              property: 'propTypes',
            },
            {
              property: 'components',
            },
            {
              property: 'current',
            },
          ],
        },
      ],
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      'lines-between-class-members': 'off',
      'max-classes-per-file': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
        },
      ],
      // Prettier config (disables conflicting rules)
      ...prettierConfig.rules,
      // no-undef rule is useless in ts
      'no-undef': 'off',
    },
  },

  // React-specific configuration (website package)
  {
    files: ['**/*.{jsx,tsx}', 'packages/website/**/*.{js,ts,jsx,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
      // 'react-hooks': reactHooks, // Temporarily disabled due to ESLint 9 compatibility issue with v4.6.2
      react,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Allow JSX within .js files
      'react/jsx-filename-extension': [
        1,
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
      // Allow props spreading in React
      'react/jsx-props-no-spreading': 0,
      'react/prop-types': 0,
      'react/require-default-props': 0,
      // Temporarily disabled due to ESLint 9 compatibility issue
      // 'react-hooks/rules-of-hooks': 'error',
      // 'react-hooks/exhaustive-deps': 'warn',
      // JSX A11y recommended rules
      ...jsxA11y.configs.recommended.rules,
    },
  },

  // API-specific rules
  {
    files: ['packages/api/**/*.{js,ts}'],
    rules: {
      'no-useless-constructor': 'off',
      'no-empty-function': ['error', { allow: ['constructors'] }],
      'class-methods-use-this': 'off',
    },
  },

  // API test files
  {
    files: ['packages/api/test/**/*'],
    rules: {
      'fp/no-mutation': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
    },
  },

  // API scripts
  {
    files: ['packages/api/scripts/**/*'],
    rules: {
      'no-console': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
    },
  },

  // API cloud functions
  {
    files: ['packages/api/cloud-functions/**/*'],
    rules: {
      'no-console': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
    },
  },

  // API seeds
  {
    files: ['packages/api/src/seeds/**/*'],
    rules: {
      'no-param-reassign': 'off',
      'fp/no-mutation': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
    },
  },

  // API entity files
  {
    files: ['packages/api/src/**/*.entity.{ts,js}'],
    rules: {
      'import/no-cycle': 'off',
    },
  },

  // Override for spec/test files (all packages)
  {
    files: ['**/*.{spec,test}.{ts,tsx}'],
    rules: {
      'fp/no-mutation': 'off',
    },
  },

  // Override for TypeScript files
  {
    files: ['*.{ts,tsx}'],
    rules: {
      // no-undef rule is useless in ts: https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/FAQ.md
      'no-undef': 'off',
    },
  },
];
