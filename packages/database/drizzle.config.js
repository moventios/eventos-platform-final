import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    dialect: 'postgresql',
    schema: './src/schema/index.ts',
    out: './migrations',
    dbCredentials: {
        url: process.env['DATABASE_URL'] ?? '',
    },
    // Expand/Contract pattern (L-08): never rename columns, always expand then contract
    migrations: {
        table: '_drizzle_migrations',
        schema: 'public',
    },
    verbose: true,
    strict: true,
});
//# sourceMappingURL=drizzle.config.js.map