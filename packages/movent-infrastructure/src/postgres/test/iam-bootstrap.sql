CREATE TYPE membership_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer');

CREATE TABLE tenants (
  id uuid PRIMARY KEY,
  name varchar(255) NOT NULL,
  slug varchar(100) NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  email varchar(255) NOT NULL,
  display_name varchar(255),
  avatar_url text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE TABLE memberships (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  organization_id uuid,
  role membership_role NOT NULL DEFAULT 'member',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE TABLE domain_events (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  event_type varchar(100) NOT NULL,
  event_version varchar(10) NOT NULL DEFAULT 'v1',
  aggregate_id uuid NOT NULL,
  aggregate_type varchar(100) NOT NULL,
  payload jsonb NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  processed_at timestamptz,
  trace_id varchar(64),
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE points_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  profile_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE RESTRICT,
  balance integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE TYPE points_transaction_type AS ENUM ('grant', 'spend', 'adjust', 'refund');

CREATE TABLE points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount integer NOT NULL,
  type points_transaction_type NOT NULL,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger function for auto-provisioning default welcome points in test environment
CREATE OR REPLACE FUNCTION handle_new_profile_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO points_accounts (id, tenant_id, profile_id, balance, created_at)
  VALUES (gen_random_uuid(), NEW.tenant_id, NEW.id, 1000, now())
  ON CONFLICT (profile_id) DO NOTHING;
  
  INSERT INTO points_transactions (id, tenant_id, profile_id, amount, type, description, created_at)
  VALUES (gen_random_uuid(), NEW.tenant_id, NEW.id, 1000, 'grant', 'Saldo awal selamat datang (1.000 Poin)', now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_profile_created_points
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile_points();