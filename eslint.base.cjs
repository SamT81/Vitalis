/**
 * Reglas de ESLint comunes a frontend-web, frontend-mobile y packages/*.
 * Cada parte agrega encima lo propio de su entorno (React, Expo, navegador).
 */
const simpleImportSort = require('eslint-plugin-simple-import-sort');

const importPatterns = {
  /** Cada feature se importa solo por su index.ts (barrel). */
  featureBarrel: {
    group: ['@/features/*/*'],
    message: 'Importa la feature desde su index.ts.',
  },
  /** Dentro de una app se usa el alias @/ en lugar de subir dos o más carpetas. */
  longRelative: {
    group: ['../../*'],
    message: 'Usa el alias @/ en lugar de rutas relativas largas.',
  },
};

module.exports = {
  importPatterns,

  /** Bloque de configuración plana válido para cualquier archivo JS/TS. */
  common: {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // Ley 1581 de 2012: nada de credenciales ni tokens en consola.
      'no-console': 'error',
    },
  },

  /** Reglas que necesitan el plugin @typescript-eslint (solo archivos .ts/.tsx). */
  typescriptRules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/ban-ts-comment': 'error',
  },
};
