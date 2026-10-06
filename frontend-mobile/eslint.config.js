const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

const base = require('../eslint.base.cjs');

module.exports = defineConfig([
  expoConfig,
  prettier,
  { ignores: ['dist/*', '.expo/*', 'node_modules/*'] },
  base.common,
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            base.importPatterns.featureBarrel,
            {
              ...base.importPatterns.longRelative,
              // global.css vive en la raíz de la app (lo exige NativeWind), fuera del alias @/.
              group: [...base.importPatterns.longRelative.group, '!../../global.css'],
            },
          ],
        },
      ],
    },
  },
  { files: ['**/*.{ts,tsx}'], rules: base.typescriptRules },
]);
