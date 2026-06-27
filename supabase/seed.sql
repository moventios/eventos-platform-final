-- Seed data for Moventios Event OS (Indonesian context)

-- 1. Tenants (Organisasi)
INSERT INTO public.tenants (id, name, slug, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Organisasi Utama', 'organisasi-utama', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Organizations (Grup Afiliasi)
INSERT INTO public.organizations (id, tenant_id, name, description)
VALUES
  ('00000000-0000-0000-0000-0000000000aa', '00000000-0000-0000-0000-000000000001', 'Komunitas Seni & Budaya', 'Wadah kolaborasi seniman lokal Jawa Barat.'),
  ('00000000-0000-0000-0000-0000000000ab', '00000000-0000-0000-0000-000000000001', 'Ecosystem Developer Network', 'Jaringan developer dan startup teknologi lokal.')
ON CONFLICT (id) DO NOTHING;

-- 3. Profiles (Pengguna)
INSERT INTO public.profiles (id, tenant_id, email, display_name)
VALUES
  ('00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000001', 'admin@moventios.co', 'Admin Utama'),
  ('00000000-0000-0000-0000-000000000088', '00000000-0000-0000-0000-000000000001', 'budi@moventios.co', 'Budi Santoso')
ON CONFLICT (id) DO NOTHING;

-- 4. Memberships (Keanggotaan)
INSERT INTO public.memberships (id, tenant_id, profile_id, organization_id, role, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-0000000000aa', 'admin', true),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000088', '00000000-0000-0000-0000-0000000000aa', 'member', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Facilities / Venues (Tempat Pertemuan)
INSERT INTO public.facilities (id, tenant_id, name, description, address, status)
VALUES
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-000000000001', 'Gedung Aula Utama', 'Gedung pertemuan serbaguna untuk event komunitas, workshop, dan seminar.', 'Jl. Diponegoro No. 22, Bandung', 'active'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000001', 'Creative Hub Bandung', 'Ruang kolaborasi dan kreativitas untuk startup, pekerja seni, dan komunitas digital.', 'Jl. Ir. H. Juanda No. 100, Bandung', 'active')
ON CONFLICT (id) DO NOTHING;

-- 6. Rooms / Spaces (Ruangan)
INSERT INTO public.rooms (id, tenant_id, facility_id, name, capacity, status)
VALUES
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b1', 'Ruang Aula A', 150, 'available'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b2', 'Studio Musik & Podcast', 10, 'available'),
  ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b2', 'Co-working Space Lt. 2', 40, 'available')
ON CONFLICT (id) DO NOTHING;

-- 7. Events (Acara)
INSERT INTO public.events (id, tenant_id, name, description, status, starts_at, ends_at, timezone)
VALUES
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-000000000001', 'Pameran Seni Rupa Lokal', 'Pameran karya seni dari seniman lokal Jawa Barat bertema keberagaman budaya.', 'published', now() + interval '2 days', now() + interval '2 days 4 hours', 'Asia/Jakarta'),
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-000000000001', 'Bandung Developer Gathering', 'Temu kangen dan berbagi ilmu antardefender teknologi di wilayah Bandung.', 'published', now() + interval '5 days', now() + interval '5 days 6 hours', 'Asia/Jakarta')
ON CONFLICT (id) DO NOTHING;
