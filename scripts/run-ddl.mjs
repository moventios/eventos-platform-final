/**
 * Run DDL migrations using Supabase Management API (pg direct)
 * Run with: node scripts/run-ddl.mjs
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
    const rawValue = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) process.env[key] = rawValue;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function rpcSql(query) {
  // Use Supabase REST API with service role to run pg_execute_sql or similar
  // Supabase exposes a raw SQL endpoint via POST /rest/v1/rpc/exec_sql if the function exists
  // We'll use the Management API directly via the HTTP API
  const projectId = 'hunildojmqiljnwehtdu';
  const url = `https://api.supabase.com/v1/projects/${projectId}/database/query`;
  const body = JSON.stringify({ query });
  
  // We need the personal access token for this, not service role
  const pat = process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_PAT;
  if (!pat || !pat.trim()) {
    return { ok: false, error: 'No personal access token. Run DDL manually.' };
  }
  
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pat}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ ok: res.statusCode < 300, status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
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
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('🔧 Running DDL migrations for slug columns...\n');

  const ddls = [
    'ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug VARCHAR(300);',
    'ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS slug VARCHAR(300);',
    "UPDATE public.events SET slug = 'pameran-seni-rupa-lokal-2025' WHERE id = '00000000-0000-0000-0000-0000000000d1';",
    "UPDATE public.events SET slug = 'bandung-developer-gathering' WHERE id = '00000000-0000-0000-0000-0000000000d2';",
    "UPDATE public.events SET slug = 'workshop-desain-ui-ux-pemula' WHERE id = '00000000-0000-0000-0000-0000000000d3';",
    "UPDATE public.facilities SET slug = 'gedung-aula-utama-bandung' WHERE id = '00000000-0000-0000-0000-0000000000b1';",
    "UPDATE public.facilities SET slug = 'creative-hub-bandung' WHERE id = '00000000-0000-0000-0000-0000000000b2';",
  ];

  for (const ddl of ddls) {
    const label = ddl.slice(0, 80).replace(/\s+/g, ' ');
    const r = await rpcSql(ddl);
    console.log(`  ${r.ok ? '✅' : '❌'} ${label}`);
    if (!r.ok) console.log(`     Error: ${r.error || r.body?.slice(0, 120)}`);
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
