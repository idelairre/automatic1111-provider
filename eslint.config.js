import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
   js.configs.recommended,
   {
      files: ['src/**/*.ts'],
      languageOptions: {
         parser: tsparser,
         parserOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            project: './tsconfig.json',
         },
         globals: {
            console: 'readonly',
            process: 'readonly',
            Buffer: 'readonly',
            fetch: 'readonly',
            AbortController: 'readonly',
            URL: 'readonly',
            URLSearchParams: 'readonly',
            setTimeout: 'readonly',
            clearTimeout: 'readonly',
         },
      },
      plugins: {
         '@typescript-eslint': tseslint,
         prettier: prettier,
      },
      rules: {
         // TypeScript specific rules
         ...tseslint.configs.recommended.rules,
         '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
         '@typescript-eslint/explicit-function-return-type': 'off',
         '@typescript-eslint/explicit-module-boundary-types': 'off',
         '@typescript-eslint/no-explicit-any': 'warn',

         // Prettier integration
         'prettier/prettier': 'error',

         // General rules
         'no-console': 'warn',
         'prefer-const': 'error',
         'no-var': 'error',
      },
   },
   {
      ignores: ['dist/', 'node_modules/', '*.js', '*.config.js'],
   },
];
