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