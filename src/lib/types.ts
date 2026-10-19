// TypeScript type definitions for Edgar Valle Real Estate Platform

export type PropertyType = 'Single Family' | 'Condo' | 'Townhome' | 'Multi-Family' | 'Fixer-Upper' | 'Commercial';
export type PropertyStatus = 'active' | 'pending' | 'sold' | 'open_house' | 'draft';
export type ListingStatus = 'for_sale' | 'for_rent' | 'pending' | 'sold' | 'coming_soon';
export type PublicationStatus = 'draft' | 'published' | 'archived';
export type AddressVisibility = 'full' | 'neighborhood_only';
export type LotSizeUnit = 'sqft' | 'acres';
export type RenovationStatus = 'turnkey' | 'updated' | 'original' | 'fixer_upper';
export type HoaFrequency = 'monthly' | 'quarterly' | 'annually' | 'none';

export type LeadType = 
  | 'first_time_buyer' 
  | 'va_buyer' 
  | 'seller_valuation' 
  | 'investor_flip' 
  | 'general_contact' 
  | 'tour_request' 
  | 'open_house_rsvp';

export type LeadStatus = 'new' | 'contacted' | 'appointment_set' | 'closed' | 'archived';
export type ContactMethod = 'phone' | 'email' | 'text';
export type Language = 'en' | 'es';

export interface PropertyMedia {
  id: string;
  property_id: string;
  media_type: 'image' | 'video' | 'floorplan';
  url: string;
  storage_path?: string;
  alt_text?: string;
  caption?: string;
  display_order: number;
  is_primary: boolean;
  file_size_bytes?: number;
  mime_type?: string;
  created_at: string;
}

export interface AdditionalCost {
  name: string;
  amount: number;
  frequency?: 'monthly' | 'annually' | 'one_time';
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  property_type: PropertyType;
  status: PropertyStatus;
  listing_status?: ListingStatus;
  publication_status?: PublicationStatus;
  price: number;
  currency?: string;
  original_price?: number;
  previous_price?: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  lot_size_sqft?: number;
  lot_size?: number;
  lot_size_unit?: LotSizeUnit;
  year_built?: number;
  garage_spaces: number;
  parking_spaces?: number;
  has_pool: boolean;
  has_spa?: boolean;
  is_featured: boolean;
  is_va_eligible: boolean;
  is_fixer_upper: boolean;
  renovation_status?: RenovationStatus;
  arv_estimate?: number;
  address_street: string;
  address_unit?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country?: string;
  address_visibility?: AddressVisibility;
  neighborhood: string;
  latitude?: number;
  longitude?: number;
  description: string;
  features: string[];
  amenities?: string[];
  hoa_fee_monthly?: number;
  hoa_fee_frequency?: HoaFrequency;
  additional_costs?: AdditionalCost[];
  property_tax_rate?: number;
  virtual_tour_url?: string;
  video_url?: string;
  mls_number?: string;
  primary_image?: string;
  gallery_images?: string[];
  media?: PropertyMedia[];
  view_count?: number;
  inquiries_count?: number;
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
  is_indexable?: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface OpenHouse {
  id: string;
  property_id: string;
  property?: Property;
  start_time: string;
  end_time: string;
  timezone?: string;
  host_name: string;
  refreshments_provided: boolean;
  special_instructions?: string;
  is_cancelled: boolean;
  rsvp_link?: string;
  created_at?: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  lead_type: LeadType;
  message?: string;
  preferred_contact_method?: ContactMethod;
  property_id?: string;
  property_address?: string;
  estimated_budget?: string;
  timeframe?: string;
  is_preapproved?: boolean;
  language_preference?: Language;
  status: LeadStatus;
  admin_notes?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at?: string;
}

export interface Neighborhood {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  summary: string;
  median_home_price: number;
  vibe: string;
  commute_downtown_mins?: number;
  highlights: string[];
  hero_image: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: 'Market Updates' | 'Buyer Guides' | 'VA Loans' | 'Fix & Flip' | 'Community';
  excerpt: string;
  content: string;
  author_name: string;
  read_time_mins: number;
  cover_image: string;
  is_published: boolean;
  published_at: string;
  created_at?: string;
}

export interface SiteSettings {
  brand_name: string;
  agent_name: string;
  brokerage_name: string;
  dre_license: string;
  tagline: string;
  email: string;
  phone: string;
  instagram: string;
  instagram_url: string;
  service_area: string;
  languages: string[];
}

export interface AuditLog {
  id: string;
  actor_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface MortgageCalculationInput {
  homePrice: number;
  downPaymentPercent: number;
  interestRate: number; // e.g. 6.5 for 6.5%
  loanTermYears: number; // 15 or 30
  annualPropertyTaxRate?: number; // e.g. 1.25%
  annualHomeInsurance?: number; // e.g. $1200
  monthlyHoa?: number;
  isVaLoan?: boolean;
}

export interface MortgageCalculationResult {
  homePrice: number;
  downPaymentAmount: number;
  loanAmount: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  monthlyPmi: number;
  monthlyHoa: number;
  totalMonthlyPayment: number;
}
