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
