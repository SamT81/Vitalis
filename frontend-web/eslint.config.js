import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Ley 1581 de 2012: nada de credenciales ni tokens en consola.
      'no-console': 'error',
    },
  },
  {
    // Componentes shadcn/ui y el contexto exportan variantes/hooks junto al componente.
    files: ['src/components/ui/**', 'src/features/auth/AuthContext.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
);
