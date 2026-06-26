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
