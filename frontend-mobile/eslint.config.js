const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

module.exports = defineConfig([
  expoConfig,
  prettier,
  { ignores: ['dist/*', '.expo/*', 'node_modules/*'] },
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // Ley 1581 de 2012: nada de credenciales ni tokens en consola.
      'no-console': 'error',
      // Cada feature se importa solo por su index.ts (barrel).
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/features/*/*'], message: 'Importa la feature desde su index.ts.' },
            {
              // global.css vive en la raíz de la app (lo exige NativeWind), fuera del alias @/.
              group: ['../../*', '!../../global.css'],
              message: 'Usa el alias @/ en lugar de rutas relativas largas.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
    },
  },
]);
