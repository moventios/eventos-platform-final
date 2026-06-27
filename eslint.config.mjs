import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/migrations/**'],
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/movent-core/**/*.ts', 'packages/movent-contracts/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['*/infrastructure/*', '*/database/*', 'drizzle-orm', 'postgres'],
              message: 'Domain packages cannot import infrastructure. Use repository interfaces (ports) instead.',
            },
          ],
        },
      ],
    },
  },
);
