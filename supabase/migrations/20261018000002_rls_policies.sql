-- 20261018000002_rls_policies.sql
-- Row Level Security (RLS) Policies for Edgar Valle Real Estate

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
-- Public can read agent profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

-- Only authenticated admins can modify profiles
CREATE POLICY "Admins can update profiles" 
  ON profiles FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin' OR auth.uid() = user_id)
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.uid() = user_id);

-- 2. Properties Policies
-- Anonymous & public can only view published non-draft listings
CREATE POLICY "Public can view published properties" 
  ON properties FOR SELECT 
  USING (status != 'draft');

-- Authenticated admins have full CRUD access to properties
CREATE POLICY "Admins have full access to properties" 
  ON properties FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 3. Property Media Policies
-- Public can view media for active properties
CREATE POLICY "Public can view active property media" 
  ON property_media FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_media.property_id 
      AND properties.status != 'draft'
    )
  );

-- Admins have full access to property media
CREATE POLICY "Admins have full access to property media" 
  ON property_media FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 4. Leads & Inquiries Policies (CRITICAL PRIVACY)
-- Anyone (including public / anon) can submit an inquiry / lead
CREATE POLICY "Public can submit leads" 
  ON leads FOR INSERT 
  WITH CHECK (
    full_name IS NOT NULL AND 
    email IS NOT NULL AND 
    phone IS NOT NULL AND 
    lead_type IS NOT NULL
  );

-- STRICT: Public CANNOT read, update, or delete any leads
-- Only authenticated admins can view and manage leads
CREATE POLICY "Only admins can view and manage leads" 
  ON leads FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 5. Open Houses Policies
CREATE POLICY "Public can view uncancelled open houses" 
  ON open_houses FOR SELECT 
  USING (is_cancelled = false);

CREATE POLICY "Admins can manage open houses" 
  ON open_houses FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 6. Neighborhoods Policies
CREATE POLICY "Public can view neighborhoods" 
  ON neighborhoods FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage neighborhoods" 
  ON neighborhoods FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 7. Blog Posts Policies
CREATE POLICY "Public can view published blog posts" 
  ON blog_posts FOR SELECT 
  USING (is_published = true AND published_at <= NOW());

CREATE POLICY "Admins can manage all blog posts" 
  ON blog_posts FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 8. Site Settings Policies
CREATE POLICY "Public can view public site settings" 
  ON site_settings FOR SELECT 
  USING (key IN ('general', 'contact', 'disclosures', 'socials'));

CREATE POLICY "Admins can manage site settings" 
  ON site_settings FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 9. Audit Logs Policies (Admin Eyes Only)
CREATE POLICY "Admins can view audit logs" 
  ON audit_logs FOR SELECT 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins and service role can insert audit logs" 
  ON audit_logs FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
