import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

const eslintConfig = [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      globals: {
        node: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
    },
  },
  {
    ignores: ['node_modules', 'lib'],
  },

  eslintConfigPrettier,
];

export default eslintConfig;
