/**
 * Binds PGlite to the shipped createServiceDb() before Next.js boots.
 * Used only with EVENTOS_E2E_CAPTURE=1 for honest HTTP evidence capture.
 */
import { createIamTestDb } from '../../../packages/infrastructure/dist/postgres/test/create-test-db.js';
import { bindTestServiceDb } from '@eventos/infrastructure/postgres';

const { db } = await createIamTestDb();
bindTestServiceDb(db);
console.error('[eventos-e2e-preload] PGlite bound to createServiceDb()');