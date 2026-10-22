-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR BRANDON URZUA LUXURY REAL ESTATE
-- Project URL: https://oqoqgdlagroxwzoibgnf.supabase.co
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROPERTY LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL,
  formatted_price TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  zip TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 4,
  bathrooms INTEGER NOT NULL DEFAULT 5,
  sqft INTEGER NOT NULL DEFAULT 5000,
  lot_size TEXT DEFAULT '0.5 Acres',
  property_type TEXT DEFAULT 'Estate',
  status TEXT DEFAULT 'Active',
  year_built INTEGER DEFAULT 2024,
  featured BOOLEAN DEFAULT true,
  description TEXT,
  key_features JSONB DEFAULT '[]'::jsonb,
  media_path TEXT NOT NULL,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  external_url TEXT,
  virtual_tour_url TEXT,
  coordinates JSONB DEFAULT '{"lat": 34.0736, "lng": -118.4004}'::jsonb,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INQUIRIES & SHOWING REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  inquiry_type TEXT NOT NULL DEFAULT 'Buyer Representation',
  property_id TEXT,
  property_address TEXT,
  budget_range TEXT,
  timeframe TEXT,
  preferred_tour_date TEXT,
  preferred_tour_time TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  internal_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ADVISORY SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 1,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. JOURNAL & MARKET INSIGHT ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  read_time_minutes INTEGER DEFAULT 5,
  cover_image_path TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AGENT PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  title TEXT NOT NULL,
  handle TEXT,
  license_number TEXT,
  brokerage TEXT,
  headline TEXT,
  biography TEXT,
  secondary_bio TEXT,
  career_volume TEXT,
  average_sale TEXT,
  phone TEXT,
  contact_email TEXT,
  location TEXT,
  profile_image_path TEXT,
  hero_image_path TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  verified_status JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Listings: Public read of published estates, full admin access for service_role
CREATE POLICY "Public can view published listings"
  ON public.listings FOR SELECT
  USING (published = true);

CREATE POLICY "Service role full access to listings"
  ON public.listings FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

-- Inquiries: Anyone can submit an inquiry, only admin/service_role can view & edit
CREATE POLICY "Public can submit inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role full access to inquiries"
  ON public.inquiries FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

-- Services: Public read
CREATE POLICY "Public can view published services"
  ON public.services FOR SELECT
  USING (published = true);

CREATE POLICY "Service role full access to services"
  ON public.services FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

-- Articles: Public read
CREATE POLICY "Public can view published articles"
  ON public.articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Service role full access to articles"
  ON public.articles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

-- Profile: Public read
CREATE POLICY "Public can view profile"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Service role full access to profile"
  ON public.profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

-- ====================================================================
-- STORAGE BUCKET POLICIES (for public image CDN access)
-- ====================================================================

-- Ensure property-media bucket is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-media', 'property-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public can view images
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-media');

-- Service role can upload/delete
CREATE POLICY "Service Role Upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-media');

CREATE POLICY "Service Role Delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-media');
