const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  { ignores: ['node_modules', 'coverage', 'eslint.config.js'] },
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      // Ley 1581 de 2012: nada de credenciales ni tokens en consola.
      'no-console': 'error',
      // El paquete es TypeScript puro: sin React ni APIs de plataforma.
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['react', 'react-*', 'expo', 'expo-*'], message: 'Sin React.' }] },
      ],
    },
  },
);
