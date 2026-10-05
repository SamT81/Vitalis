const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettier,
  { ignores: ['dist/*', '.expo/*', 'node_modules/*'] },
  {
    rules: {
      // Ley 1581 de 2012: nada de credenciales ni tokens en consola.
      'no-console': 'error',
      // axios.create / axios.isAxiosError son el uso documentado de axios.
      'import/no-named-as-default-member': 'off',
    },
  },
]);
