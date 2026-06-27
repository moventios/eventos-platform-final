-- RLS Policies for Commerce Bounded Context

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE events FORCE ROW LEVEL SECURITY;
CREATE POLICY events_isolation ON events USING (tenant_id = auth.tenant_id());

ALTER TABLE pass_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pass_tiers FORCE ROW LEVEL SECURITY;
CREATE POLICY pass_tiers_isolation ON pass_tiers USING (tenant_id = auth.tenant_id());

ALTER TABLE access_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_passes FORCE ROW LEVEL SECURITY;
CREATE POLICY access_passes_isolation ON access_passes USING (tenant_id = auth.tenant_id());

-- RLS Policies for Workflow Bounded Context

ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances FORCE ROW LEVEL SECURITY;
CREATE POLICY workflow_instances_isolation ON workflow_instances
  USING (tenant_id = auth.tenant_id());

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals FORCE ROW LEVEL SECURITY;
CREATE POLICY approvals_isolation ON approvals USING (tenant_id = auth.tenant_id());

-- RLS for domain_events outbox

ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_events FORCE ROW LEVEL SECURITY;
CREATE POLICY domain_events_isolation ON domain_events USING (tenant_id = auth.tenant_id());
-- RLS Policies for IAM Bounded Context
-- L-05: Every entity must have a tenant owner. RLS enforced on ALL tables.
-- Run after Drizzle migrations.

-- Helper function: extract tenant_id from JWT
CREATE OR REPLACE FUNCTION auth.tenant_id() RETURNS uuid AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'tenant_id')::uuid,
    NULL
  );
$$ LANGUAGE sql STABLE;

-- ============================================================
-- tenants
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;

-- Tenant can only see itself
CREATE POLICY tenants_isolation ON tenants
  USING (id = auth.tenant_id());

-- ============================================================
-- organizations
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;

CREATE POLICY organizations_isolation ON organizations
  USING (tenant_id = auth.tenant_id());

-- ============================================================
-- workspaces
-- ============================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces FORCE ROW LEVEL SECURITY;

CREATE POLICY workspaces_isolation ON workspaces
  USING (tenant_id = auth.tenant_id());

-- ============================================================
-- profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY profiles_isolation ON profiles
  USING (tenant_id = auth.tenant_id());

-- ============================================================
-- memberships
-- ============================================================
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;

CREATE POLICY memberships_isolation ON memberships
  USING (tenant_id = auth.tenant_id());
-- RLS Policies for Spatial Bounded Context

-- ============================================================
-- facilities
-- ============================================================
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities FORCE ROW LEVEL SECURITY;

CREATE POLICY facilities_isolation ON facilities
  USING (tenant_id = auth.tenant_id());

-- ============================================================
-- rooms
-- ============================================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms FORCE ROW LEVEL SECURITY;

CREATE POLICY rooms_isolation ON rooms
  USING (tenant_id = auth.tenant_id());

-- ============================================================
-- bookings
-- ============================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings FORCE ROW LEVEL SECURITY;

CREATE POLICY bookings_isolation ON bookings
  USING (tenant_id = auth.tenant_id());

-- ============================================================
-- booking_histories (audit trail — append only, no delete)
-- ============================================================
ALTER TABLE booking_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_histories FORCE ROW LEVEL SECURITY;

CREATE POLICY booking_histories_isolation ON booking_histories
  USING (tenant_id = auth.tenant_id());

-- ============================================================
-- GiST EXCLUSION constraint for zero-conflict bookings (L-01 spatial invariant)
-- Applied AFTER table creation via Drizzle migrations.
-- time_range column type: tstzrange
-- ============================================================
ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (room_id WITH =, time_range WITH &&)
  WHERE (deleted_at IS NULL AND status NOT IN ('rejected', 'canceled'));
