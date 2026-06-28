/**
 * Migration + seed script: add slug columns and populate slugs
 * Run: node scripts/migrate-add-slugs.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function sql(query) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  // Supabase doesn't expose raw SQL via REST. Use pg-proxy approach via Supabase management API
  return null;
}

async function patch(table, id, data) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`;
  const body = JSON.stringify(data);

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'return=representation',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, status: res.statusCode, body: data });
        } else {
          resolve({ ok: false, status: res.statusCode, error: data });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function addSlugColumn(table) {
  // Use Supabase Management API to run DDL
  const projectId = process.env.SUPABASE_PROJECT_ID;
  if (!projectId) {
    console.warn(`  ⚠️  SUPABASE_PROJECT_ID not set. Skipping DDL for ${table}.`);
    return;
  }
  
  const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
  if (!SUPABASE_ACCESS_TOKEN) {
    console.warn(`  ⚠️  SUPABASE_ACCESS_TOKEN not set. Skipping DDL for ${table}. Add manually.`);
    return;
  }
  
  const query = `ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS slug VARCHAR(300);`;
  const body = JSON.stringify({ query });
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true });
        } else {
          resolve({ ok: false, status: res.statusCode, error: data });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function migrate() {
  console.log('🔧 Adding slug columns + populating SEO slugs...\n');

  // Step 1: Add columns (requires Supabase Access Token)
  console.log('1. Adding slug column to events...');
  const r1 = await addSlugColumn('events');
  if (r1) console.log(`   events.slug DDL → ${r1.ok ? '✅' : '⚠️ manual needed: ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug VARCHAR(300)'}`);
  else console.log('   ⚠️  Manual SQL needed: ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug VARCHAR(300);');

  console.log('2. Adding slug column to facilities...');
  const r2 = await addSlugColumn('facilities');
  if (r2) console.log(`   facilities.slug DDL → ${r2.ok ? '✅' : '⚠️ manual needed'}`);
  else console.log('   ⚠️  Manual SQL needed: ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS slug VARCHAR(300);');

  // Step 2: Update event slugs
  console.log('\n3. Updating event slugs...');
  const eventSlugs = [
    { id: '00000000-0000-0000-0000-0000000000d1', slug: 'pameran-seni-rupa-lokal-2025' },
    { id: '00000000-0000-0000-0000-0000000000d2', slug: 'bandung-developer-gathering' },
    { id: '00000000-0000-0000-0000-0000000000d3', slug: 'workshop-desain-ui-ux-pemula' },
  ];

  for (const { id, slug } of eventSlugs) {
    const r = await patch('events', id, { slug });
    console.log(`   ${slug} → ${r.ok ? '✅' : '⚠️ ' + r.error} (status: ${r.status})`);
  }

  // Step 3: Update facility slugs
  console.log('\n4. Updating facility slugs...');
  const facilitySlugs = [
    { id: '00000000-0000-0000-0000-0000000000b1', slug: 'gedung-aula-utama-bandung' },
    { id: '00000000-0000-0000-0000-0000000000b2', slug: 'creative-hub-bandung' },
  ];

  for (const { id, slug } of facilitySlugs) {
    const r = await patch('facilities', id, { slug });
    console.log(`   ${slug} → ${r.ok ? '✅' : '⚠️ ' + r.error} (status: ${r.status})`);
  }

  console.log('\n✅ Done!');
  console.log('\nIf DDL steps showed warnings, run these SQLs manually in Supabase SQL Editor:');
  console.log('  ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug VARCHAR(300);');
  console.log('  ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS slug VARCHAR(300);');
  console.log('\nThen re-run this script to update slugs.');
}

migrate().catch(console.error);
