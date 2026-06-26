import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/migrations/**'],
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['*/infrastructure/*', '*/database/*', 'drizzle-orm', 'postgres'],
              message:
                'Domain packages cannot import infrastructure. Use repository interfaces (ports) instead.',
            },
          ],
        },
      ],
    },
  },
]);
