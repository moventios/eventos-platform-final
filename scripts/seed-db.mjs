/**
 * Seed script for Moventios mock data (with SEO slugs in metadata)
 * Run: node scripts/seed-db.mjs
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
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

async function upsert(table, rows) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const body = JSON.stringify(rows);
  
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + '?on_conflict=id',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
        'Content-Length': Buffer.byteLength(body),
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, status: res.statusCode });
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

const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const ORG_ID_1 = '00000000-0000-0000-0000-0000000000aa';
const ORG_ID_2 = '00000000-0000-0000-0000-0000000000ab';
const FACILITY_ID_1 = '00000000-0000-0000-0000-0000000000b1';
const FACILITY_ID_2 = '00000000-0000-0000-0000-0000000000b2';

const now = new Date();
const ts = (days, extraHours = 0) => new Date(now.getTime() + days * 86400000 + extraHours * 3600000).toISOString();

async function seed() {
  console.log('🌱 Seeding Moventios mock data (with SEO slugs)...\n');

  // 1. Tenants
  console.log('1. Tenants...');
  const r1 = await upsert('tenants', [
    { id: TENANT_ID, name: 'Moventios Publik', slug: 'moventios-publik', is_active: true, metadata: {} },
  ]);
  console.log(`   tenants → ${r1.ok ? '✅' : '⚠️  ' + r1.error}`);

  // 2. Organizations — the public directory listing
  console.log('2. Organizations...');
  const r2 = await upsert('organizations', [
    {
      id: ORG_ID_1, tenant_id: TENANT_ID,
      name: 'Komunitas Seni & Budaya',
      description: 'Wadah kolaborasi seniman lokal Jawa Barat untuk berkarya dan berkolaborasi dalam keberagaman budaya.',
      metadata: { slug: 'komunitas-seni-budaya', city: 'Bandung', category: 'seni' }
    },
    {
      id: ORG_ID_2, tenant_id: TENANT_ID,
      name: 'Ecosystem Developer Network',
      description: 'Jaringan developer dan startup teknologi lokal yang aktif berinovasi di ekosistem digital Indonesia.',
      metadata: { slug: 'ecosystem-developer-network', city: 'Bandung', category: 'teknologi' }
    },
  ]);
  console.log(`   organizations → ${r2.ok ? '✅' : '⚠️  ' + r2.error}`);

  // 3. Facilities / Venues (with SEO slugs in metadata)
  console.log('3. Facilities/Venues...');
  const r3 = await upsert('facilities', [
    {
      id: FACILITY_ID_1, tenant_id: TENANT_ID,
      name: 'Gedung Aula Utama',
      description: 'Gedung pertemuan serbaguna untuk event komunitas, workshop, dan seminar berskala menengah. Dilengkapi sistem audio dan proyektor.',
      address: 'Jl. Diponegoro No. 22, Bandung, Jawa Barat 40115',
      status: 'active',
      metadata: { slug: 'gedung-aula-utama-bandung', city: 'Bandung', category: 'aula', capacity: 200 }
    },
    {
      id: FACILITY_ID_2, tenant_id: TENANT_ID,
      name: 'Creative Hub Bandung',
      description: 'Ruang kolaborasi dan kreativitas untuk startup, pekerja seni, dan komunitas digital. Tersedia studio podcast dan co-working space.',
      address: 'Jl. Ir. H. Juanda No. 100, Dago, Bandung 40116',
      status: 'active',
      metadata: { slug: 'creative-hub-bandung', city: 'Bandung', category: 'coworking', capacity: 60 }
    },
  ]);
  console.log(`   facilities → ${r3.ok ? '✅' : '⚠️  ' + r3.error}`);

  // 4. Rooms
  console.log('4. Rooms...');
  const r4 = await upsert('rooms', [
    { id: '00000000-0000-0000-0000-0000000000c1', tenant_id: TENANT_ID, facility_id: FACILITY_ID_1, name: 'Ruang Aula A', capacity: 150, status: 'available', metadata: {} },
    { id: '00000000-0000-0000-0000-0000000000c2', tenant_id: TENANT_ID, facility_id: FACILITY_ID_2, name: 'Studio Musik & Podcast', capacity: 10, status: 'available', metadata: {} },
    { id: '00000000-0000-0000-0000-0000000000c3', tenant_id: TENANT_ID, facility_id: FACILITY_ID_2, name: 'Co-working Space Lt. 2', capacity: 40, status: 'available', metadata: {} },
    { id: '00000000-0000-0000-0000-0000000000c4', tenant_id: TENANT_ID, facility_id: FACILITY_ID_1, name: 'Ruang Meeting VIP', capacity: 25, status: 'available', metadata: {} },
  ]);
  console.log(`   rooms → ${r4.ok ? '✅' : '⚠️  ' + r4.error}`);

  // 5. Events (with SEO slugs in metadata)
  console.log('5. Events...');
  const r5 = await upsert('events', [
    {
      id: '00000000-0000-0000-0000-0000000000d1',
      tenant_id: TENANT_ID,
      name: 'Pameran Seni Rupa Lokal 2025',
      description: 'Pameran karya seni dari seniman lokal Jawa Barat bertema keberagaman budaya dan kearifan lokal. Terbuka untuk umum, gratis tanpa tiket.',
      status: 'published',
      starts_at: ts(2), ends_at: ts(2, 4),
      timezone: 'Asia/Jakarta',
      metadata: { slug: 'pameran-seni-rupa-lokal-2025', category: 'seni', featured: true, organizer: 'Komunitas Seni & Budaya' }
    },
    {
      id: '00000000-0000-0000-0000-0000000000d2',
      tenant_id: TENANT_ID,
      name: 'Bandung Developer Gathering',
      description: 'Temu kangen dan berbagi ilmu antar developer teknologi di wilayah Bandung. Diskusi open source, AI, dan startup lokal.',
      status: 'published',
      starts_at: ts(5), ends_at: ts(5, 6),
      timezone: 'Asia/Jakarta',
      metadata: { slug: 'bandung-developer-gathering', category: 'teknologi', featured: true, organizer: 'Ecosystem Developer Network' }
    },
    {
      id: '00000000-0000-0000-0000-0000000000d3',
      tenant_id: TENANT_ID,
      name: 'Workshop Desain UI/UX untuk Pemula',
      description: 'Workshop praktis belajar dasar-dasar desain antarmuka pengguna. Cocok untuk mahasiswa, fresh graduate, dan siapa saja yang ingin belajar desain digital.',
      status: 'published',
      starts_at: ts(10), ends_at: ts(10, 3),
      timezone: 'Asia/Jakarta',
      metadata: { slug: 'workshop-desain-ui-ux-pemula', category: 'workshop', organizer: 'Komunitas Seni & Budaya' }
    },
  ]);
  console.log(`   events → ${r5.ok ? '✅' : '⚠️  ' + r5.error}`);

  console.log('\n✅ Seeding complete!');
  console.log('\nPublic tenant ID:', TENANT_ID);
  console.log('SEO slugs stored in metadata.slug for events and facilities.');
}

seed().catch(console.error);
