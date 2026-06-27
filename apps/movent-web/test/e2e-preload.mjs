/**
 * Binds PGlite to the shipped createServiceDb() before Next.js boots.
 * Used only with MOVENT_E2E_CAPTURE=1 for honest HTTP evidence capture.
 */
import { createIamTestDb } from '../../../packages/infrastructure/dist/postgres/test/create-test-db.js';
import { bindTestServiceDb } from '@movent/infrastructure/postgres';

const { db } = await createIamTestDb();
bindTestServiceDb(db);
console.error('[movent-e2e-preload] PGlite bound to createServiceDb()');