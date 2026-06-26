-- Run `supabase start` before seeding.
-- Create a user via the Supabase dashboard (Authentication > Users) first,
-- then replace the UUID below with that user's ID before inserting the profile.

INSERT INTO public.tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Test Org', 'test-org')
ON CONFLICT (id) DO NOTHING;

-- Replace '<auth-user-uuid>' with the UUID of the user created in the dashboard.
INSERT INTO public.profiles (id, tenant_id, full_name)
VALUES ('<auth-user-uuid>', '00000000-0000-0000-0000-000000000001', 'Test User')
ON CONFLICT (id) DO NOTHING;
