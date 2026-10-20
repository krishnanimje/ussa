-- =====================================================================
-- EDGAR VALLE REAL ESTATE PLATFORM — COMPLETE SUPABASE DATABASE SETUP
-- Run this entire file in Supabase Dashboard -> SQL Editor -> New Query
-- =====================================================================


-- >>>>>>>>>>>>>> MIGRATION: 20261018000001_initial_schema.sql <<<<<<<<<<<<<<
-- 20261018000001_initial_schema.sql
-- Schema definition for Edgar Valle Real Estate Platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Agent & Admins)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE,
  full_name TEXT NOT NULL DEFAULT 'Edgar Valle',
  title TEXT NOT NULL DEFAULT 'Realtor® | Real Estate Specialist',
  email TEXT NOT NULL DEFAULT 'edgar@yourrealtoredgar.com',
  phone TEXT NOT NULL DEFAULT '(619) 555-0198',
  brokerage TEXT NOT NULL DEFAULT 'Full Circle Group',
  dre_license TEXT NOT NULL DEFAULT '02375273',
  instagram TEXT NOT NULL DEFAULT '@yourrealtoredgar',
  bio TEXT,
  languages TEXT[] DEFAULT ARRAY['English', 'Spanish'],
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'agent', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  property_type TEXT NOT NULL CHECK (property_type IN ('Single Family', 'Condo', 'Townhome', 'Multi-Family', 'Fixer-Upper', 'Commercial')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'open_house', 'draft')),
  price NUMERIC(14, 2) NOT NULL,
  original_price NUMERIC(14, 2),
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  bathrooms NUMERIC(3, 1) NOT NULL CHECK (bathrooms >= 0),
  square_feet INTEGER NOT NULL CHECK (square_feet > 0),
  lot_size_sqft INTEGER CHECK (lot_size_sqft >= 0),
  year_built INTEGER,
  garage_spaces INTEGER NOT NULL DEFAULT 0,
  has_pool BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_va_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  is_fixer_upper BOOLEAN NOT NULL DEFAULT FALSE,
  arv_estimate NUMERIC(14, 2), -- After Repair Value for investment flips
  address_street TEXT NOT NULL,
  address_city TEXT NOT NULL DEFAULT 'San Diego',
  address_state TEXT NOT NULL DEFAULT 'CA',
  address_zip TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  description TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  hoa_fee_monthly NUMERIC(10, 2) DEFAULT 0,
  property_tax_rate NUMERIC(4, 2) DEFAULT 1.25,
  virtual_tour_url TEXT,
  mls_number TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);

-- 3. Property Media Table
CREATE TABLE IF NOT EXISTS property_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'floorplan')),
  url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_media_property_id ON property_media(property_id);

-- 4. Leads & Inquiries Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  lead_type TEXT NOT NULL CHECK (lead_type IN (
    'first_time_buyer',
    'va_buyer',
    'seller_valuation',
    'investor_flip',
    'general_contact',
    'tour_request',
    'open_house_rsvp'
  )),
  message TEXT,
  preferred_contact_method TEXT DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'email', 'text')),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  property_address TEXT,
  estimated_budget TEXT,
  timeframe TEXT,
  is_preapproved BOOLEAN DEFAULT FALSE,
  language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'es')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'appointment_set', 'closed', 'archived')),
  admin_notes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- 5. Open Houses Table
CREATE TABLE IF NOT EXISTS open_houses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  host_name TEXT NOT NULL DEFAULT 'Edgar Valle',
  refreshments_provided BOOLEAN DEFAULT TRUE,
  special_instructions TEXT,
  is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_open_houses_property ON open_houses(property_id);
CREATE INDEX IF NOT EXISTS idx_open_houses_time ON open_houses(start_time);

-- 6. Neighborhoods Guide Table
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  summary TEXT NOT NULL,
  median_home_price NUMERIC(14, 2) NOT NULL,
  vibe TEXT NOT NULL,
  commute_downtown_mins INTEGER,
  highlights TEXT[] DEFAULT '{}',
  hero_image TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug ON neighborhoods(slug);

-- 7. Blog & Market Insights Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Market Updates', 'Buyer Guides', 'VA Loans', 'Fix & Flip', 'Community')),
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Edgar Valle',
  read_time_mins INTEGER NOT NULL DEFAULT 5,
  cover_image TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published, published_at DESC);

-- 8. Site Settings & Brokerage Disclosures Table
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Audit Logs Table (Security & Admin Activity)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);


-- >>>>>>>>>>>>>> MIGRATION: 20261018000002_rls_policies.sql <<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>> MIGRATION: 20261019000004_property_cms_extensions.sql <<<<<<<<<<<<<<
-- 20261019000004_property_cms_extensions.sql
-- Property CMS, Media Management, Storage, and Audit Logging Extensions

-- 1. Extend Properties Table with CMS and Publishing Lifecycle Fields
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS listing_status TEXT NOT NULL DEFAULT 'for_sale' CHECK (listing_status IN ('for_sale', 'for_rent', 'pending', 'sold', 'coming_soon')),
  ADD COLUMN IF NOT EXISTS publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS previous_price NUMERIC(14, 2),
  ADD COLUMN IF NOT EXISTS hoa_fee_frequency TEXT DEFAULT 'monthly' CHECK (hoa_fee_frequency IN ('monthly', 'quarterly', 'annually', 'none')),
  ADD COLUMN IF NOT EXISTS additional_costs JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS address_unit TEXT,
  ADD COLUMN IF NOT EXISTS address_country TEXT NOT NULL DEFAULT 'USA',
  ADD COLUMN IF NOT EXISTS address_visibility TEXT NOT NULL DEFAULT 'full' CHECK (address_visibility IN ('full', 'neighborhood_only')),
  ADD COLUMN IF NOT EXISTS lot_size_unit TEXT NOT NULL DEFAULT 'sqft' CHECK (lot_size_unit IN ('sqft', 'acres')),
  ADD COLUMN IF NOT EXISTS parking_spaces INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_spa BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS renovation_status TEXT DEFAULT 'updated' CHECK (renovation_status IN ('turnkey', 'updated', 'original', 'fixer_upper')),
  ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS is_indexable BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS inquiries_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Extend Property Media Table
ALTER TABLE property_media
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS alt_text TEXT,
  ADD COLUMN IF NOT EXISTS file_size_bytes INTEGER,
  ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- 3. Create Additional Indexes for High-Performance Admin Filtering
CREATE INDEX IF NOT EXISTS idx_properties_publication_status ON properties(publication_status);
CREATE INDEX IF NOT EXISTS idx_properties_listing_status ON properties(listing_status);
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON properties(deleted_at);
CREATE INDEX IF NOT EXISTS idx_properties_city_hood ON properties(address_city, neighborhood);
CREATE INDEX IF NOT EXISTS idx_property_media_order ON property_media(property_id, display_order ASC);

-- 4. Supabase Storage Setup for Property Media
-- Create public property-media bucket if storage extension is available
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-media',
  'property-media',
  true,
  10485760, -- 10MB limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];

-- 5. Storage Security Policies
CREATE POLICY "Public can view property media images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-media');

CREATE POLICY "Authenticated admins can upload property media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-media' AND
    (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated')
  );

CREATE POLICY "Authenticated admins can update property media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-media' AND
    (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated')
  );

CREATE POLICY "Authenticated admins can delete property media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-media' AND
    (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated')
  );

-- 6. Updated RLS Policies for Properties
DROP POLICY IF EXISTS "Public can view published properties" ON properties;

CREATE POLICY "Public can view published properties"
  ON properties FOR SELECT
  USING (
    publication_status = 'published' AND
    deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Admins have full access to properties" ON properties;

CREATE POLICY "Admins have full access to properties"
  ON properties FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated');

-- 7. Audit Log Trigger & Function (Automatic Capture of Sensitive Changes)
CREATE OR REPLACE FUNCTION log_property_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (action, entity_type, entity_id, details)
    VALUES (
      'update_property',
      'property',
      NEW.id::text,
      jsonb_build_object(
        'title', NEW.title,
        'old_price', OLD.price,
        'new_price', NEW.price,
        'old_status', OLD.publication_status,
        'new_status', NEW.publication_status
      )
    );
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (action, entity_type, entity_id, details)
    VALUES (
      'create_property',
      'property',
      NEW.id::text,
      jsonb_build_object('title', NEW.title, 'status', NEW.publication_status, 'price', NEW.price)
    );
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (action, entity_type, entity_id, details)
    VALUES (
      'delete_property',
      'property',
      OLD.id::text,
      jsonb_build_object('title', OLD.title, 'deleted_at', NOW())
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_property_audit_event ON properties;
CREATE TRIGGER trg_property_audit_event
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION log_property_audit_event();


-- >>>>>>>>>>>>>> MIGRATION: 20261019000005_analytics_and_crm_bi.sql <<<<<<<<<<<<<<
-- Supabase Migration: 20261019000005_analytics_and_crm_bi.sql
-- Master Prompt 03: Real Estate Business Intelligence & CRM Extensions

-- 1. Extend Leads Table for Full CRM Lifecycle
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (
  status IN (
    'new',
    'contacted',
    'qualified',
    'appointment_scheduled',
    'in_progress',
    'converted',
    'lost',
    'spam'
  )
);

-- Add CRM metadata fields to leads
ALTER TABLE leads 
  ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_admin TEXT DEFAULT 'edgar@yourrealtoredgar.com',
  ADD COLUMN IF NOT EXISTS source_page TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON leads(follow_up_date) WHERE follow_up_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON leads(utm_source) WHERE utm_source IS NOT NULL;

-- 2. Structured Lead Notes Table for Audit Trail
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_at ON lead_notes(created_at DESC);

-- Enable RLS on lead_notes
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to lead notes"
  ON lead_notes
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- 3. Analytics Events Table for Privacy-Conscious Visitor Tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL CHECK (
    event_name IN (
      'page_view',
      'session_started',
      'property_view',
      'property_search',
      'contact_click',
      'inquiry_form_started',
      'inquiry_submitted',
      'consultation_requested',
      'appointment_requested',
      'open_house_view',
      'outbound_link_click'
    )
  ),
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  referrer TEXT,
  traffic_source TEXT NOT NULL DEFAULT 'direct' CHECK (
    traffic_source IN ('direct', 'organic', 'social', 'referral', 'paid')
  ),
  device_category TEXT NOT NULL DEFAULT 'desktop' CHECK (
    device_category IN ('desktop', 'mobile', 'tablet')
  ),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimize high-frequency analytics query indexes
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_property_id ON analytics_events(property_id) WHERE property_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_page_path ON analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_traffic_source ON analytics_events(traffic_source);
CREATE INDEX IF NOT EXISTS idx_analytics_composite_date_event ON analytics_events(created_at DESC, event_name);

-- Enable RLS on analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Anonymous public visitors can insert events via tracking beacon (with strict constraints)
CREATE POLICY "Public anonymous can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    event_name IN (
      'page_view',
      'session_started',
      'property_view',
      'property_search',
      'contact_click',
      'inquiry_form_started',
      'inquiry_submitted',
      'consultation_requested',
      'appointment_requested',
      'open_house_view',
      'outbound_link_click'
    )
  );

-- Only authenticated admins or service role can read analytics events
CREATE POLICY "Only authenticated admins can read analytics"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- 4. Server-Side Daily Rollup Aggregation Table for Fast Dashboard Rendering
CREATE TABLE IF NOT EXISTS analytics_daily_rollups (
  date DATE PRIMARY KEY,
  page_views INTEGER NOT NULL DEFAULT 0,
  sessions INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  property_views INTEGER NOT NULL DEFAULT 0,
  inquiries INTEGER NOT NULL DEFAULT 0,
  qualified_leads INTEGER NOT NULL DEFAULT 0,
  consultations INTEGER NOT NULL DEFAULT 0,
  appointments INTEGER NOT NULL DEFAULT 0,
  direct_sessions INTEGER NOT NULL DEFAULT 0,
  organic_sessions INTEGER NOT NULL DEFAULT 0,
  social_sessions INTEGER NOT NULL DEFAULT 0,
  referral_sessions INTEGER NOT NULL DEFAULT 0,
  paid_sessions INTEGER NOT NULL DEFAULT 0,
  mobile_sessions INTEGER NOT NULL DEFAULT 0,
  desktop_sessions INTEGER NOT NULL DEFAULT 0,
  tablet_sessions INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_rollups_date ON analytics_daily_rollups(date DESC);

ALTER TABLE analytics_daily_rollups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authenticated admins can read analytics rollups"
  ON analytics_daily_rollups
  FOR SELECT
  TO authenticated
  USING (TRUE);


-- >>>>>>>>>>>>>> MIGRATION: 20261019000006_security_privacy_and_compliance.sql <<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>> MIGRATION: 20261018000003_seed_data.sql <<<<<<<<<<<<<<
-- 20261018000003_seed_data.sql
-- Seed data for Edgar Valle Real Estate Platform (San Diego, CA)

-- 1. Insert Profile
INSERT INTO profiles (
  id,
  full_name,
  title,
  email,
  phone,
  brokerage,
  dre_license,
  instagram,
  bio,
  languages,
  role
) VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'Edgar Valle',
  'Realtor® | San Diego Real Estate Specialist',
  'edgar@yourrealtoredgar.com',
  '(619) 555-0198',
  'Full Circle Group',
  '02375273',
  '@yourrealtoredgar',
  'Edgar Valle is a dedicated San Diego Realtor® with Full Circle Group (DRE #02375273) specializing in first-time homebuyers, VA military relocation, and fix-and-flip investment opportunities throughout San Diego County. With fluent bilingual service (English & Spanish), Edgar provides transparent, analytical, and hands-on guidance from initial consultation to closing and beyond.',
  ARRAY['English', 'Spanish'],
  'admin'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Properties
INSERT INTO properties (
  id,
  slug,
  title,
  tagline,
  property_type,
  status,
  price,
  original_price,
  bedrooms,
  bathrooms,
  square_feet,
  lot_size_sqft,
  year_built,
  garage_spaces,
  has_pool,
  is_featured,
  is_va_eligible,
  is_fixer_upper,
  arv_estimate,
  address_street,
  address_city,
  address_state,
  address_zip,
  neighborhood,
  latitude,
  longitude,
  description,
  features,
  hoa_fee_monthly,
  property_tax_rate,
  mls_number
) VALUES
(
  'p0000000-0000-0000-0000-000000000001',
  'north-park-spanish-revival',
  'Restored Spanish Revival with Courtyard & ADU Potential',
  'Timeless San Diego character with modern bespoke renovations in vibrant North Park',
  'Single Family',
  'open_house',
  1185000,
  1225000,
  3,
  2.0,
  1740,
  5200,
  1932,
  2,
  false,
  true,
  true,
  false,
  NULL,
  '3428 Herman Ave',
  'San Diego',
  'CA',
  '92104',
  'North Park',
  32.7483,
  -117.1328,
  'Step into this architectural 1932 Spanish revival masterpiece nestled in the coveted heart of North Park. Featuring restored original arched mahogany doorways, hand-painted coved ceilings, and a sun-drenched central courtyard with custom terracotta pavers. The fully modernized chef kitchen boasts quartz waterfall countertops, zellige tile backsplash, and bespoke cabinetry. The detached 2-car garage features alley access and is pre-plumbed for an immediate income-generating ADU.',
  ARRAY['Spanish Revival Architecture', 'Original Coved Ceilings', 'Private Terracotta Courtyard', 'ADU Potential with Alley Access', 'Quartz Waterfall Kitchen', 'Central HVAC', 'Walk to 30th St Dining'],
  0,
  1.22,
  'SD26-90412'
),
(
  'p0000000-0000-0000-0000-000000000002',
  'pacific-beach-coastal-condo',
  'Modern Coastal Condo with Private Sunset Balcony',
  'Blocks from Sail Bay and the Pacific surf with resort-style amenities',
  'Condo',
  'active',
  895000,
  NULL,
  2,
  2.0,
  1150,
  NULL,
  2018,
  2,
  true,
  true,
  true,
  false,
  NULL,
  '1245 Pacific Beach Dr #3B',
  'San Diego',
  'CA',
  '92109',
  'Pacific Beach',
  32.7932,
  -117.2415,
  'Experience California coastal living at its finest in this immaculate 2-bedroom, 2-bath designer residence. Positioned just three blocks from the sand and Sail Bay, this sunlit corner unit features floor-to-ceiling sliding glass doors opening onto an expansive sunset balcony. Highlights include white oak hardwood flooring, custom motorized shades, in-unit laundry, and two secured underground parking spaces with EV charging.',
  ARRAY['3 Blocks to Beach', 'Ocean Sunset Views', 'White Oak Hardwood Flooring', 'Resort Heated Pool & Spa', 'Two Underground Parking Spaces with EV', 'In-Unit Washer/Dryer', 'Secure Access Building'],
  420,
  1.18,
  'SD26-88104'
),
(
  'p0000000-0000-0000-0000-000000000003',
  'eastlake-greens-chula-vista-pool-home',
  'Luxury Chula Vista Estate with Heated Pool & 3-Car Garage',
  'Suburban paradise with resort backyard, custom rock waterfall pool, and owned solar',
  'Single Family',
  'active',
  975000,
  NULL,
  4,
  3.0,
  2580,
  7850,
  2004,
  3,
  true,
  true,
  true,
  false,
  NULL,
  '2184 Greensview Dr',
  'Chula Vista',
  'CA',
  '91915',
  'Chula Vista',
  32.6394,
  -116.9421,
  'A true entertainer paradise in Eastlake Greens! This spacious 4-bedroom executive home features an open concept floor plan, dramatic high vaulted ceilings, and a backyard oasis that rivals a five-star resort. Enjoy your pebble-finish heated pool with elevated spa and stone waterfall, covered outdoor kitchen with built-in BBQ, and full synthetic turf lawn. Fully owned 9.8kW solar system dramatically reduces electric bills.',
  ARRAY['Custom Heated Pool & Spa', '3-Car Tandem Garage', 'Owned 9.8kW Solar Panels', 'Outdoor Kitchen with Built-in Grill', 'Vaulted Ceilings', 'Top-Rated Eastlake Schools', 'Downstairs Bedroom & Full Bath'],
  115,
  1.28,
  'CV26-44219'
),
(
  'p0000000-0000-0000-0000-000000000004',
  'oceanside-va-friendly-turnkey-ranch',
  'Turnkey Oceanside Single-Story Near Camp Pendleton',
  'Zero-down VA loan approved, spacious RV parking, and expansive private yard',
  'Single Family',
  'active',
  765000,
  780000,
  3,
  2.0,
  1520,
  6800,
  1986,
  2,
  false,
  true,
  true,
  false,
  NULL,
  '4120 Calle Ariane',
  'Oceanside',
  'CA',
  '92057',
  'Oceanside',
  33.2281,
  -117.3195,
  'Tailored for our active military families and first-time buyers! Located just 12 minutes to Camp Pendleton Main Gate and San Luis Rey bike trail to the beach. Completely remodeled with new dual-pane vinyl windows, energy-efficient HVAC with smart thermostat, fresh interior/exterior paint, and brand new shaker kitchen with stainless appliance package. Gated side yard provides dedicated RV/boat parking with no HOA or Mello-Roos.',
  ARRAY['100% VA Loan Approved', '12 Min to Camp Pendleton', 'Dedicated RV / Boat Parking', 'No HOA & No Mello-Roos', 'Brand New Kitchen & Appliances', 'Large Fenced Backyard', 'Single Story Living'],
  0,
  1.15,
  'OC26-31902'
),
(
  'p0000000-0000-0000-0000-000000000005',
  'clairemont-mesa-fixer-investor-opportunity',
  'Prime Clairemont Fixer-Upper with Massive ARV Spread',
  'High-upside investment opportunity on a flat 8,500 sq ft canyon-adjacent lot',
  'Fixer-Upper',
  'active',
  699000,
  NULL,
  3,
  1.5,
  1380,
  8500,
  1961,
  2,
  false,
  false,
  false,
  true,
  985000,
  '4912 Mount Alifan Dr',
  'San Diego',
  'CA',
  '92111',
  'Clairemont',
  32.8198,
  -117.1852,
  'Investor special & fix-and-flip goldmine! Edgar Valle exclusive opportunity with solid bones and incredible upside. Property needs full cosmetic rehab, kitchen/bath overhaul, and floor plan opening. Comps in the immediate half-mile radius for remodeled homes are commanding $975K - $1.05M. Expansive 8,500 sq ft flat lot allows for a simple 300 sq ft master suite expansion plus detached 1,000 sq ft ADU. Cash or hard money preferred.',
  ARRAY['Fix & Flip Potential', 'Estimated ARV $985,000+', '8,500 Sq Ft Flat Lot', 'Canyon-Adjacent Setting', 'Zoned for SB9 / ADU Expansion', 'Original Mid-Century Hardwoods', 'High Investor Equity Spread'],
  0,
  1.20,
  'SD26-11984'
),
(
  'p0000000-0000-0000-0000-000000000006',
  'san-carlos-cowles-mountain-starter-home',
  'Sunlit San Carlos Starter Home with Mountain Views',
  'First-time homebuyer friendly with scenic trail access and mature fruit trees',
  'Single Family',
  'pending',
  749000,
  NULL,
  3,
  2.0,
  1410,
  6200,
  1974,
  2,
  false,
  false,
  true,
  false,
  NULL,
  '7815 Lake Adlon Dr',
  'San Diego',
  'CA',
  '92119',
  'San Carlos',
  32.8021,
  -117.0392,
  'Under contract in 6 days! This delightful single-level home offers panoramic morning views of Cowles Mountain. Featuring an updated kitchen with solid maple cabinets, remodeled guest bath, double-pane low-E windows, and a shaded pergola patio surrounded by producing Meyer lemon and Haas avocado trees. Ideal for first-time buyers looking for peaceful suburban stability with quick access to Mission Trails Regional Park.',
  ARRAY['Cowles Mountain Views', 'Walk to Mission Trails Park', 'Under Contract in 6 Days', 'Producing Avocado & Citrus Trees', 'Dual Pane Windows', 'Quiet Cul-de-Sac Street'],
  0,
  1.19,
  'SD26-77312'
),
(
  'p0000000-0000-0000-0000-000000000007',
  'la-jolla-village-contemporary-townhome',
  'Architectural Contemporary Townhome Near Windansea',
  'Steps to the La Jolla shoreline with private rooftop deck and ocean breezes',
  'Townhome',
  'active',
  1650000,
  NULL,
  3,
  2.5,
  1980,
  NULL,
  2016,
  2,
  false,
  true,
  true,
  false,
  NULL,
  '7435 Draper Ave #2',
  'La Jolla',
  'CA',
  '92037',
  'La Jolla',
  32.8398,
  -117.2764,
  'Spectacular multi-level architectural masterpiece in the Village of La Jolla. Enjoy sunsets from your private 400 sq ft rooftop terrace with panoramic Pacific ocean peeks. Features include 10-foot ceilings, European white oak cabinetry, Miele appliance suite, floating steel staircase, and direct entry 2-car garage with epoxy floors. Moments to world-famous Windansea beach and Girard Avenue boutiques.',
  ARRAY['Private Rooftop Deck with Ocean View', 'Walk to Windansea Beach', 'Miele Luxury Appliance Suite', 'Floating Architectural Staircase', 'Attached 2-Car Garage', 'Low HOA'],
  310,
  1.16,
  'LJ26-99214'
),
(
  'p0000000-0000-0000-0000-000000000008',
  'golden-hill-multi-family-duplex',
  'Income Generating Golden Hill Duplex with Downtown Skyline Views',
  'Two detached residences on one lot with high cash-flow potential',
  'Multi-Family',
  'active',
  1350000,
  NULL,
  4,
  3.0,
  2240,
  5500,
  1928,
  2,
  false,
  false,
  true,
  false,
  NULL,
  '2418 B Street',
  'San Diego',
  'CA',
  '92102',
  'Golden Hill',
  32.7214,
  -117.1396,
  'Incredible house-hack or pure cash-flow investment! Front house is a charming 3-bed/2-bath Craftsman with fireplace and original built-ins; rear unit is a fully permitted 1-bed/1-bath cottage with private yard and Downtown San Diego skyline views. Separate electric and gas meters. Live in one and let your tenant pay 70% of your mortgage, or rent both for strong cap rate return.',
  ARRAY['Two Detached Units on One Lot', 'Downtown San Diego Skyline Views', 'Separate Utility Meters', 'Proven Rental Income', 'Walk to Balboa Park', 'Classic Craftsman Details'],
  0,
  1.21,
  'SD26-62019'
) ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Open Houses
INSERT INTO open_houses (
  id,
  property_id,
  start_time,
  end_time,
  host_name,
  refreshments_provided,
  special_instructions
) VALUES 
(
  'oh000000-0000-0000-0000-000000000001',
  'p0000000-0000-0000-0000-000000000001',
  NOW() + INTERVAL '2 days' + INTERVAL '13 hours',
  NOW() + INTERVAL '2 days' + INTERVAL '16 hours',
  'Edgar Valle',
  true,
  'Saturday Open House: Hosted by Edgar Valle. Espresso bar and artisan pastries served in the courtyard. All buyers and agents welcome!'
),
(
  'oh000000-0000-0000-0000-000000000002',
  'p0000000-0000-0000-0000-000000000001',
  NOW() + INTERVAL '3 days' + INTERVAL '13 hours',
  NOW() + INTERVAL '3 days' + INTERVAL '16 hours',
  'Edgar Valle',
  true,
  'Sunday Twilight Tour: Sunset refreshments and property walkthrough. Ask Edgar about the ADU floorplan & financing options.'
),
(
  'oh000000-0000-0000-0000-000000000003',
  'p0000000-0000-0000-0000-000000000003',
  NOW() + INTERVAL '2 days' + INTERVAL '12 hours',
  NOW() + INTERVAL '2 days' + INTERVAL '15 hours',
  'Edgar Valle',
  true,
  'Eastlake Greens Pool Tour: Tour this immaculate backyard oasis. Cold drinks and pool-side refreshments provided.'
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert Neighborhoods
INSERT INTO neighborhoods (
  id,
  slug,
  name,
  tagline,
  summary,
  median_home_price,
  vibe,
  commute_downtown_mins,
  highlights,
  hero_image
) VALUES
(
  'n0000000-0000-0000-0000-000000000001',
  'north-park',
  'North Park',
  'Historic Charm Meets Urban Energy',
  'Known for its tree-lined streets of 1920s Craftsman bungalows, craft breweries, art galleries, and vibrant dining along University Ave and 30th Street. A favorite for professionals and first-time buyers seeking high walkability.',
  1120000,
  'Eclectic, Walkable, Historic & Trendy',
  10,
  ARRAY['Top Walk Score in SD', 'Historic Craftsman & Spanish Architecture', 'Culinary & Craft Beer Capital', 'Bordering Balboa Park'],
  '/images/neighborhoods/north-park.svg'
),
(
  'n0000000-0000-0000-0000-000000000002',
  'pacific-beach',
  'Pacific Beach',
  'Iconic California Beach Lifestyle',
  'Miles of sandy coastline, the iconic Crystal Pier, lively beach boardwalks, and tranquil bayside living along Crown Point and Sail Bay. Perfect for ocean lovers and active lifestyles.',
  1280000,
  'Coastal, Active, Vibrant & Breezy',
  15,
  ARRAY['Crystal Pier & Surf Breaks', 'Sail Bay Boardwalk', 'Year-Round Coastal Climate', 'Great Condo & Multi-Family Options'],
  '/images/neighborhoods/pacific-beach.svg'
),
(
  'n0000000-0000-0000-0000-000000000003',
  'chula-vista',
  'Chula Vista & Eastlake',
  'Family Communities, Mountain Vistas & Resort Living',
  'South Bay crown jewel offering master-planned communities like Eastlake and Otay Ranch. Renowned for top-tier schools, sprawling community parks with Olympic-size pools, scenic lakes, and newer construction homes with large garages.',
  895000,
  'Family-Oriented, Spacious, Master-Planned',
  20,
  ARRAY['Eastlake Lake & Parks', 'Top Performing School Districts', 'Modern Homes with Pools & 3-Car Garages', 'New Bayfront Redevelopment'],
  '/images/neighborhoods/chula-vista.svg'
),
(
  'n0000000-0000-0000-0000-000000000004',
  'oceanside',
  'Oceanside',
  'Coastal Community with Strong Military Roots',
  'North County coastal hub home to historic wooden pier, harbor marina, and immediate proximity to Camp Pendleton. Popular with military families using VA loans and investors seeking coastal value.',
  845000,
  'Coastal, Military-Friendly, Value-Driven',
  35,
  ARRAY['Direct Proximity to Camp Pendleton', '100% VA Financing Hub', 'Historic Pier & Harbor Marina', 'Growing Downtown Food Scene'],
  '/images/neighborhoods/oceanside.svg'
),
(
  'n0000000-0000-0000-0000-000000000005',
  'la-jolla',
  'La Jolla',
  'World-Class Luxury & Dramatic Ocean Cliffs',
  'San Diego premier luxury destination famous for La Jolla Cove, scenic sea cliffs, designer shopping along Prospect Street, and architecturally stunning estates.',
  2450000,
  'Prestigious, Coastal Luxury, World-Class',
  20,
  ARRAY['La Jolla Cove & Torrey Pines', 'World-Class Public & Private Schools', 'Michelin-Starred Dining', 'Unmatched Coastal Appreciation'],
  '/images/neighborhoods/la-jolla.svg'
) ON CONFLICT (slug) DO NOTHING;

-- 5. Insert Blog Posts
INSERT INTO blog_posts (
  id,
  slug,
  title,
  category,
  excerpt,
  content,
  author_name,
  read_time_mins,
  cover_image
) VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'va-home-loan-san-diego-complete-guide',
  'The Complete Guide to Using Your VA Loan in High-Cost San Diego',
  'VA Loans',
  'Learn how military service members and veterans can buy a home in San Diego with zero down payment, no PMI, and maximum purchasing power using their BAH.',
  'San Diego is proudly home to one of the largest concentrations of active-duty military and veterans in the nation. With Camp Pendleton in Oceanside, Naval Base San Diego (32nd Street), Naval Base Coronado, and MCAS Miramar, our military community is the heartbeat of our region. As a Realtor specializing in military relocation and VA loans, I hear the same myth every week: "Can I actually buy a home in San Diego with zero down?" The answer is an emphatic YES. Thanks to the Blue Water Navy Vietnam Veterans Act, statutory VA loan limits were eliminated for veterans with full entitlement. That means qualified buyers in San Diego can purchase above $1,000,000 with 0% down payment...',
  'Edgar Valle',
  6,
  '/images/blog/va-loan-guide.svg'
),
(
  'b0000000-0000-0000-0000-000000000002',
  'first-time-homebuyer-roadmap-san-diego',
  'First-Time Homebuyer Roadmap: Grants, Down Payment Assistance & CalHFA',
  'Buyer Guides',
  'A clear, step-by-step roadmap for first-time buyers navigating San Diego real estate, including CalHFA grants and credit score optimization.',
  'Buying your first home in California can feel intimidating, but having a clear, structured roadmap makes all the difference. When you work with Edgar Valle, we begin with your financial foundation: understanding your debt-to-income ratio, optimizing your credit score, and exploring California state programs like the CalHFA Dream For All shared appreciation loan or standard FHA down payment assistance programs...',
  'Edgar Valle',
  7,
  '/images/blog/first-time-buyer.svg'
),
(
  'b0000000-0000-0000-0000-000000000003',
  'san-diego-fix-and-flip-70-percent-rule',
  'The San Diego Fix & Flip Playbook: Mastering the 70% Rule in 2026',
  'Fix & Flip',
  'How savvy real estate investors analyze distressed properties, calculate accurate ARV, and protect profit margins in San Diego County.',
  'In high-velocity California real estate markets, successful fix-and-flip investing isn''t about guesswork; it''s about rigorous mathematical discipline. In this guide, Edgar breaks down how to apply the classic 70% formula (Maximum Allowable Offer = ARV × 70% - Rehab Costs) specifically for San Diego neighborhoods like Clairemont, Chula Vista, and El Cajon...',
  'Edgar Valle',
  8,
  '/images/blog/fix-and-flip.svg'
) ON CONFLICT (slug) DO NOTHING;

-- 6. Insert Site Settings & Brokerage Disclosures
INSERT INTO site_settings (key, value, description) VALUES
(
  'general',
  '{
    "brand_name": "Edgar Valle | Realtor",
    "agent_name": "Edgar Valle",
    "brokerage_name": "Full Circle Group",
    "dre_license": "02375273",
    "tagline": "San Diego Real Estate Specialist | Hablamos Español",
    "email": "edgar@yourrealtoredgar.com",
    "phone": "(619) 555-0198",
    "instagram": "@yourrealtoredgar",
    "instagram_url": "https://www.instagram.com/yourrealtoredgar/",
    "service_area": "San Diego County, California",
    "languages": ["English", "Spanish"]
  }',
  'Core brand information, license numbers, and primary contact details'
),
(
  'disclosures',
  '{
    "dre_text": "California Department of Real Estate License #02375273. Affiliated with Full Circle Group.",
    "equal_housing": "Equal Housing Opportunity. All real estate advertised herein is subject to the federal Fair Housing Act.",
    "disclaimer": "All property data, square footage, lot size, and specifications are deemed reliable but not guaranteed and should be independently verified. Not an endorsement or official publication of the MLS unless explicitly authorized."
  }',
  'Mandatory California real estate and Fair Housing legal disclosures'
) ON CONFLICT (key) DO NOTHING;

