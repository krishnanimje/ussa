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
