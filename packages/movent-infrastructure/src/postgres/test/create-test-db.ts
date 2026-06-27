import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '@movent/database/schema';

const testSqlDir = dirname(fileURLToPath(import.meta.url));

const iamBootstrapSql = readFileSync(join(testSqlDir, 'iam-bootstrap.sql'), 'utf8');
const dashboardBootstrapSql = readFileSync(join(testSqlDir, 'dashboard-bootstrap.sql'), 'utf8');

export async function createIamTestDb() {
  const client = new PGlite();
  await client.exec(iamBootstrapSql);
  await client.exec(dashboardBootstrapSql);
  const db = drizzle(client, { schema });
  return { client, db };
}