-- Minimal commerce/spatial/workflow tables for ecosystem integration tests.

CREATE TYPE booking_state AS ENUM (
  'pending', 'under_review', 'approved', 'active', 'completed', 'rejected', 'canceled'
);
CREATE TYPE event_state AS ENUM ('draft', 'published', 'live', 'concluded', 'canceled');
CREATE TYPE facility_state AS ENUM ('draft', 'active', 'maintenance', 'decommissioned');
CREATE TYPE room_state AS ENUM ('available', 'occupied', 'maintenance');
CREATE TYPE approval_state AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE workflow_state AS ENUM ('running', 'pending_approval', 'completed', 'suspended', 'aborted');
CREATE TYPE actor_type AS ENUM ('USER', 'AI_AGENT', 'SYSTEM');

CREATE TABLE events (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  name varchar(255) NOT NULL,
  description text,
  status event_state NOT NULL DEFAULT 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  timezone varchar(100) NOT NULL DEFAULT 'UTC',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE TABLE facilities (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  name varchar(255) NOT NULL,
  description text,
  address text,
  geo_lat numeric(10, 7),
  geo_lng numeric(10, 7),
  status facility_state NOT NULL DEFAULT 'draft',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE TABLE rooms (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  name varchar(255) NOT NULL,
  capacity integer NOT NULL,
  status room_state NOT NULL DEFAULT 'available',
  point_cost integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  requested_by uuid NOT NULL,
  status booking_state NOT NULL DEFAULT 'pending',
  time_range text NOT NULL,
  idempotency_key varchar(255) NOT NULL,
  title varchar(255),
  notes text,
  actor_type actor_type NOT NULL DEFAULT 'USER',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE workflow_instances (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  workflow_type varchar(100) NOT NULL,
  status workflow_state NOT NULL DEFAULT 'running',
  correlation_id uuid,
  correlation_entity varchar(100),
  context jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE TABLE approvals (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  workflow_instance_id uuid REFERENCES workflow_instances(id),
  assigned_to uuid NOT NULL REFERENCES profiles(id),
  request_context jsonb NOT NULL,
  status approval_state NOT NULL DEFAULT 'pending',
  resolved_at timestamptz,
  resolved_by uuid,
  resolution varchar(50),
  resolution_note text,
  actor_type actor_type NOT NULL DEFAULT 'AI_AGENT',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz,
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
);