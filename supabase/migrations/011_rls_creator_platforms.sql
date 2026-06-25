-- creator_platforms — mirror the creator_profiles policy pattern (007), but the owner
-- check hops through creator_profiles since this table keys on creator_id, not user_id.
-- Server-side score writes use the service role client and bypass RLS intentionally.
ALTER TABLE creator_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_platforms_select" ON creator_platforms FOR SELECT TO authenticated USING (true);

CREATE POLICY "creator_platforms_insert" ON creator_platforms FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creator_profiles cp
      WHERE cp.id = creator_platforms.creator_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "creator_platforms_update" ON creator_platforms FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creator_profiles cp
      WHERE cp.id = creator_platforms.creator_id AND cp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creator_profiles cp
      WHERE cp.id = creator_platforms.creator_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "creator_platforms_delete" ON creator_platforms FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creator_profiles cp
      WHERE cp.id = creator_platforms.creator_id AND cp.user_id = auth.uid()
    )
  );
