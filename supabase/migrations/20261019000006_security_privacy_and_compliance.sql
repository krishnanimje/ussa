-- 20261019000006_security_privacy_and_compliance.sql
-- Master Prompt 05: Comprehensive Database Security, Strict RLS Hardening & Least Privilege

-- 1. Tighten RLS on Leads Table: Public CANNOT read, update or delete any leads
DROP POLICY IF EXISTS "Only admins can view and manage leads" ON leads;
CREATE POLICY "Admins have exclusive access to leads"
  ON leads
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' IN ('edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com')
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' IN ('edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com')
  );

-- 2. Tighten RLS on Lead Notes: Admin Eyes Only
DROP POLICY IF EXISTS "Admins have full access to lead notes" ON lead_notes;
CREATE POLICY "Admins have exclusive access to lead notes"
  ON lead_notes
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' IN ('edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com')
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' IN ('edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com')
  );

-- 3. Tighten RLS on Analytics Events: Anonymous Public CANNOT read analytics
DROP POLICY IF EXISTS "Only authenticated admins can read analytics" ON analytics_events;
CREATE POLICY "Admins have exclusive read access to analytics"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' IN ('edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com')
  );

-- 4. Tighten RLS on Analytics Rollups: Admin Read Only
DROP POLICY IF EXISTS "Only authenticated admins can read analytics rollups" ON analytics_daily_rollups;
CREATE POLICY "Admins have exclusive read access to analytics rollups"
  ON analytics_daily_rollups
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' IN ('edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com')
  );

-- 5. Tighten RLS on Audit Logs: Admin Read Only
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins have exclusive read access to audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' IN ('edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com')
  );

-- 6. Tighten Properties RLS: Public CANNOT view drafts or soft-deleted records
DROP POLICY IF EXISTS "Public can view published properties" ON properties;
CREATE POLICY "Public can view published non-deleted properties"
  ON properties
  FOR SELECT
  TO anon, authenticated
  USING (
    publication_status = 'published' AND
    deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Admins have full access to properties" ON properties;
CREATE POLICY "Admins have full access to properties"
  ON properties
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' IN ('edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com')
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' IN ('edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com')
  );

-- 7. Tighten Property Media RLS: Media of unpublished properties cannot be viewed by public
DROP POLICY IF EXISTS "Public can view active property media" ON property_media;
CREATE POLICY "Public can view published property media"
  ON property_media
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_media.property_id
      AND properties.publication_status = 'published'
      AND properties.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Admins have full access to property media" ON property_media;
CREATE POLICY "Admins have full access to property media"
  ON property_media
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' IN ('edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com')
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'email' IN ('edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com')
  );

-- 8. Explicitly Revoke Public Admin Registration
-- In Supabase auth.users, public sign-ups are disabled via project configuration:
-- `auth.enable_signup = false` in config.toml or project auth settings.
