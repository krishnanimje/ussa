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
