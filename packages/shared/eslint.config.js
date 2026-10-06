const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const tseslint = require('typescript-eslint');

const base = require('../../eslint.base.cjs');

module.exports = tseslint.config(
  { ignores: ['node_modules', 'coverage', 'eslint.config.js'] },
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier, base.common],
    rules: {
      ...base.typescriptRules,
      // El paquete es TypeScript puro: lo que dependa de React va en @ribas/shared-react.
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['react', 'react-*', 'expo', 'expo-*'], message: 'Sin React.' }] },
      ],
    },
  },
);
