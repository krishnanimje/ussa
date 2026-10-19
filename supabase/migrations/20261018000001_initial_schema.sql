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
