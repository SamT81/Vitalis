const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const reactHooks = require('eslint-plugin-react-hooks');
const tseslint = require('typescript-eslint');

const base = require('../../eslint.base.cjs');

module.exports = tseslint.config(
  { ignores: ['node_modules', 'coverage', 'eslint.config.js'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier, base.common],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...base.typescriptRules,
      // Solo React: nada de DOM, React Native, Expo ni navegación.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react-dom',
                'react-dom/*',
                'react-native',
                'react-router*',
                'expo',
                'expo-*',
              ],
              message: 'Este paquete debe funcionar igual en web y en móvil.',
            },
          ],
        },
      ],
    },
  },
);
