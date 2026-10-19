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

export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'appointment_scheduled' 
  | 'appointment_set' 
  | 'in_progress' 
  | 'converted' 
  | 'closed' 
  | 'lost' 
  | 'spam' 
  | 'archived';
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

export interface LeadNote {
  id: string;
  lead_id: string;
  author_email: string;
  note: string;
  created_at: string;
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
  follow_up_date?: string;
  assigned_admin?: string;
  source_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  notes?: LeadNote[];
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

// ==========================================
// MASTER PROMPT 03: BUSINESS INTELLIGENCE & CRM TYPES
// ==========================================

export type AnalyticsEventName = 
  | 'page_view'
  | 'session_started'
  | 'property_view'
  | 'property_search'
  | 'contact_click'
  | 'inquiry_form_started'
  | 'inquiry_submitted'
  | 'consultation_requested'
  | 'appointment_requested'
  | 'open_house_view'
  | 'outbound_link_click';

export type TrafficSource = 'direct' | 'organic' | 'social' | 'referral' | 'paid';
export type DeviceCategory = 'desktop' | 'mobile' | 'tablet';

export interface AnalyticsEvent {
  id: string;
  event_name: AnalyticsEventName;
  session_id: string;
  page_path: string;
  property_id?: string;
  referrer?: string;
  traffic_source: TrafficSource;
  device_category: DeviceCategory;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export type DateRangeFilter = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'custom';

export interface MetricDelta {
  current: number;
  previous: number;
  deltaPercentage: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface DailyTrafficPoint {
  date: string;
  page_views: number;
  sessions: number;
  unique_visitors: number;
  inquiries: number;
}

export interface TrafficSourceBreakdown {
  source: TrafficSource;
  label: string;
  sessions: number;
  percentage: number;
}

export interface DeviceBreakdown {
  category: DeviceCategory;
  label: string;
  sessions: number;
  percentage: number;
}

export interface PropertyRanking {
  property_id: string;
  title: string;
  slug: string;
  price: number;
  status: string;
  views: number;
  inquiries: number;
  conversion_rate: number;
}

export interface LandingPagePerformance {
  path: string;
  views: number;
  inquiries: number;
  conversion_rate: number;
}

export interface FunnelStage {
  stage: string;
  label: string;
  count: number;
  dropoffRate: number;
  conversionRate: number;
}

export interface AnalyticsSummary {
  range: DateRangeFilter;
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
  hasPreviousData: boolean;
  page_views: MetricDelta;
  sessions: MetricDelta;
  unique_visitors: MetricDelta;
  property_views: MetricDelta;
  inquiries: MetricDelta;
  qualified_leads: MetricDelta;
  consultations: MetricDelta;
  appointments: MetricDelta;
  conversion_rate: MetricDelta;
  published_count: number;
  organic_traffic: MetricDelta;
  traffic_trend: DailyTrafficPoint[];
  traffic_sources: TrafficSourceBreakdown[];
  device_distribution: DeviceBreakdown[];
  lead_status_distribution: Record<string, number>;
  property_ranking: PropertyRanking[];
  landing_pages: LandingPagePerformance[];
  funnel: FunnelStage[];
  inventory_status_breakdown: Record<string, number>;
  open_house_inquiries_count: number;
}

export interface GSCQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCMetrics {
  connected: boolean;
  statusMessage: string;
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  topQueries: GSCQuery[];
}

export type ReportType = 
  | 'property_inventory'
  | 'traffic'
  | 'property_views_inquiries'
  | 'leads_by_date'
  | 'conversion_funnel'
  | 'traffic_sources'
  | 'listing_performance'
  | 'open_house_inquiries';

