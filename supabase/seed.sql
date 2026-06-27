-- Seed data for Moventios Event OS (Indonesian context)
-- Moventios Public tenant ID: 00000000-0000-0000-0000-000000000001
-- Public discovery actor: 00000000-0000-0000-0000-0000000000aa

-- 1. Tenants (Organisasi)
INSERT INTO public.tenants (id, name, slug, is_active, metadata)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Moventios Publik', 'moventios-publik', true, '{}')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- 2. Organizations (Grup Afiliasi)
INSERT INTO public.organizations (id, tenant_id, name, description, metadata)
VALUES
  ('00000000-0000-0000-0000-0000000000aa', '00000000-0000-0000-0000-000000000001', 'Komunitas Seni & Budaya', 'Wadah kolaborasi seniman lokal Jawa Barat untuk berkarya dan berkolaborasi.', '{}'),
  ('00000000-0000-0000-0000-0000000000ab', '00000000-0000-0000-0000-000000000001', 'Ecosystem Developer Network', 'Jaringan developer dan startup teknologi lokal yang aktif berinovasi.', '{}')
ON CONFLICT (id) DO NOTHING;

-- 3. Facilities / Venues (Tempat Pertemuan)
INSERT INTO public.facilities (id, tenant_id, name, description, address, status, metadata)
VALUES
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-000000000001', 
   'Gedung Aula Utama', 
   'Gedung pertemuan serbaguna untuk event komunitas, workshop, dan seminar berskala menengah.',
   'Jl. Diponegoro No. 22, Bandung, Jawa Barat 40115', 'active',
   '{"city": "Bandung", "category": "aula"}'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000001', 
   'Creative Hub Bandung', 
   'Ruang kolaborasi dan kreativitas untuk startup, pekerja seni, dan komunitas digital.',
   'Jl. Ir. H. Juanda No. 100, Dago, Bandung 40116', 'active',
   '{"city": "Bandung", "category": "coworking"}')
ON CONFLICT (id) DO NOTHING;

-- 4. Rooms / Spaces (Ruangan)
INSERT INTO public.rooms (id, tenant_id, facility_id, name, capacity, status, metadata)
VALUES
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b1', 'Ruang Aula A', 150, 'available', '{}'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b2', 'Studio Musik & Podcast', 10, 'available', '{}'),
  ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b2', 'Co-working Space Lt. 2', 40, 'available', '{}'),
  ('00000000-0000-0000-0000-0000000000c4', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b1', 'Ruang Meeting VIP', 25, 'available', '{}')
ON CONFLICT (id) DO NOTHING;

-- 5. Events (Acara)
INSERT INTO public.events (id, tenant_id, name, description, status, starts_at, ends_at, timezone, metadata)
VALUES
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000001', 
   'Pameran Seni Rupa Lokal 2025', 
   'Pameran karya seni dari seniman lokal Jawa Barat bertema keberagaman budaya dan kearifan lokal. Terbuka untuk umum, gratis tanpa tiket.',
   'published', now() + interval '2 days', now() + interval '2 days 4 hours', 'Asia/Jakarta',
   '{"category": "seni", "featured": true}'),
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-000000000001',
   'Bandung Developer Gathering',
   'Temu kangen dan berbagi ilmu antar developer teknologi di wilayah Bandung. Diskusi open source, AI, dan startup lokal.',
   'published', now() + interval '5 days', now() + interval '5 days 6 hours', 'Asia/Jakarta',
   '{"category": "teknologi", "featured": true}'),
  ('00000000-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-000000000001',
   'Workshop Desain UI/UX untuk Pemula',
   'Workshop praktis belajar dasar-dasar desain antarmuka pengguna. Cocok untuk mahasiswa, fresh graduate, dan siapa saja yang ingin belajar desain digital.',
   'published', now() + interval '10 days', now() + interval '10 days 3 hours', 'Asia/Jakarta',
   '{"category": "workshop"}')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  description = EXCLUDED.description,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at;

-- 6. Pass Tiers (Jenis Tiket)
INSERT INTO public.pass_tiers (id, tenant_id, event_id, name, price, currency, capacity, metadata)
VALUES
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000d1', 
   'Tiket Gratis', '0.0000', 'IDR', 100, '{"type": "free"}'),
  ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000d2', 
   'Tiket Umum', '50000.0000', 'IDR', 50, '{"type": "paid"}'),
  ('00000000-0000-0000-0000-0000000000e3', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000d3', 
   'Tiket Workshop', '150000.0000', 'IDR', 30, '{"type": "paid"}')
ON CONFLICT (id) DO NOTHING;
