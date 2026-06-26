import { drizzle } from 'drizzle-orm/postgres-js';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import postgres from 'postgres';
import * as schema from '@eventos/database/schema';

type PostgresDb = ReturnType<typeof drizzle<typeof schema>>;
type ServiceDb = PostgresDb | PgliteDatabase<typeof schema>;

const GLOBAL_TEST_DB_KEY = '__EVENTOS_TEST_SERVICE_DB__';

type GlobalWithTestDb = typeof globalThis & {
  [GLOBAL_TEST_DB_KEY]?: ServiceDb;
};

function getBoundTestServiceDb(): ServiceDb | null {
  const fromGlobal = (globalThis as GlobalWithTestDb)[GLOBAL_TEST_DB_KEY];
  return fromGlobal ?? null;
}

/**
 * Bind an in-memory PGlite drizzle instance for integration tests and E2E capture.
 * The shipped createServiceDb() returns this handle when set (non-production only).
 */
export function bindTestServiceDb(db: ServiceDb): void {
  if (process.env['NODE_ENV'] === 'production' && process.env['EVENTOS_E2E_CAPTURE'] !== '1') {
    throw new Error('bindTestServiceDb is not available in production');
  }
  (globalThis as GlobalWithTestDb)[GLOBAL_TEST_DB_KEY] = db;
}

export function unbindTestServiceDb(): void {
  delete (globalThis as GlobalWithTestDb)[GLOBAL_TEST_DB_KEY];
}

let client: ReturnType<typeof postgres> | null = null;

function getPostgresClient() {
  if (!client) {
    const url = process.env['DATABASE_URL'];
    if (!url) throw new Error('DATABASE_URL is required');
    client = postgres(url, { max: 10 });
  }
  return client;
}

/**
 * Create a Drizzle DB instance with tenant context set for RLS.
 * Sets app.tenant_id on the connection so RLS policies apply automatically.
 */
export function createDbWithTenant(tenantId: string) {
  const bound = getBoundTestServiceDb();
  if (bound) {
    const db = bound as PostgresDb;
    return {
      db,
      async withTenant<T>(fn: (db: PostgresDb) => Promise<T>): Promise<T> {
        return fn(db);
      },
    };
  }

  const sql = getPostgresClient();
  const db = drizzle(sql, { schema });

  return {
    db,
    async withTenant<T>(fn: (db: ReturnType<typeof drizzle>) => Promise<T>): Promise<T> {
      return db.transaction(async (tx) => {
        await tx.execute(
          `SET LOCAL app.tenant_id = '${tenantId.replace(/'/g, "''")}'`,
        );
        return fn(tx as unknown as ReturnType<typeof drizzle>);
      });
    },
  };
}

/** Service-role DB client for admin operations (bypasses RLS). Use with caution. */
export function createServiceDb(): PostgresDb {
  const bound = getBoundTestServiceDb();
  if (bound) return bound as PostgresDb;

  const url = process.env['DATABASE_URL_SERVICE_ROLE'] ?? process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { max: 5 });
  return drizzle(sql, { schema });
}
