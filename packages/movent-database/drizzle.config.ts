import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'drizzle-kit';

const monorepoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const rootEnvPath = resolve(monorepoRoot, '.env');

if (existsSync(rootEnvPath)) {
  for (const line of readFileSync(rootEnvPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './dist/schema/index.js',
  out: './migrations',
  dbCredentials: {
    url: process.env['POSTGRES_URL'] ?? process.env['DATABASE_URL'] ?? '',
  },
  // Expand/Contract pattern (L-08): never rename columns, always expand then contract
  migrations: {
    table: '_drizzle_migrations',
    schema: 'public',
  },
  verbose: true,
  strict: true,
});
