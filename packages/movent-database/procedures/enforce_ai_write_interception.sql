-- L-06: AI Write Interception Stored Procedure
-- Called by BFF middleware when actor_type = 'AI_AGENT' performs a WRITE command.
-- Creates an Approval row and emits AIWriteInterceptionTriggered domain event.
-- Returns approval_id — BFF responds HTTP 202 Accepted to caller.

CREATE OR REPLACE PROCEDURE public.enforce_ai_write_interception(
  p_command_type    VARCHAR,
  p_actor_id        UUID,
  p_actor_type      VARCHAR,
  p_aggregate_id    UUID,
  p_aggregate_type  VARCHAR,
  p_tenant_id       UUID,
  p_trace_id        VARCHAR DEFAULT NULL,
  OUT p_approval_id UUID,
  OUT p_status      VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_approval_id UUID;
BEGIN
  -- Validate caller is AI_AGENT
  IF p_actor_type != 'AI_AGENT' THEN
    RAISE EXCEPTION 'enforce_ai_write_interception: actor_type must be AI_AGENT; got %',
      p_actor_type
      USING ERRCODE = 'P0001';
  END IF;

  -- Find a tenant admin to assign approval to
  SELECT profile_id INTO v_admin_id
  FROM memberships
  WHERE tenant_id = p_tenant_id
    AND role = 'admin'
    AND is_active = TRUE
    AND deleted_at IS NULL
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    -- Fall back to owner
    SELECT profile_id INTO v_admin_id
    FROM memberships
    WHERE tenant_id = p_tenant_id
      AND role = 'owner'
      AND is_active = TRUE
      AND deleted_at IS NULL
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'enforce_ai_write_interception: no admin or owner found for tenant %',
      p_tenant_id
      USING ERRCODE = 'P0002';
  END IF;

  -- Create Approval record
  v_approval_id := gen_random_uuid();

  INSERT INTO approvals (
    id, tenant_id, assigned_to, request_context,
    status, actor_type, expires_at, created_at
  ) VALUES (
    v_approval_id,
    p_tenant_id,
    v_admin_id,
    jsonb_build_object(
      'command_type',   p_command_type,
      'actor_id',       p_actor_id,
      'aggregate_id',   p_aggregate_id,
      'aggregate_type', p_aggregate_type
    ),
    'pending',
    'AI_AGENT',
    NOW() + INTERVAL '24 hours',
    NOW()
  );

  -- Emit AIWriteInterceptionTriggered into domain_events outbox
  INSERT INTO domain_events (
    id, tenant_id, event_type, event_version,
    aggregate_id, aggregate_type, payload,
    status, trace_id, actor_id, created_at
  ) VALUES (
    gen_random_uuid(),
    p_tenant_id,
    'AIWriteInterceptionTriggered',
    'v1',
    v_approval_id,
    'Approval',
    jsonb_build_object(
      'approval_id',    v_approval_id,
      'command_type',   p_command_type,
      'actor_id',       p_actor_id,
      'aggregate_id',   p_aggregate_id,
      'aggregate_type', p_aggregate_type
    ),
    'pending',
    p_trace_id,
    p_actor_id,
    NOW()
  );

  p_approval_id := v_approval_id;
  p_status := 'pending';
END;
$$;
