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
