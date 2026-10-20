// Data repository layer with Supabase integration and resilient fallback
import { getSupabase, getSupabaseAdmin } from './supabase';
import type { 
  Property, 
  OpenHouse, 
  Neighborhood, 
  BlogPost, 
  SiteSettings, 
  Lead,
  LeadNote,
  PropertyMedia,
  AuditLog
} from './types';

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Seed data constants representing Edgar Valle's San Diego listings & specialties
export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    slug: 'north-park-spanish-revival',
    title: 'Restored Spanish Revival with Courtyard & ADU Potential',
    tagline: 'Timeless San Diego character with modern bespoke renovations in vibrant North Park',
    property_type: 'Single Family',
    status: 'open_house',
    listing_status: 'for_sale',
    publication_status: 'published',
    price: 1185000,
    currency: 'USD',
    original_price: 1225000,
    previous_price: 1225000,
    bedrooms: 3,
    bathrooms: 2.0,
    square_feet: 1740,
    lot_size_sqft: 5200,
    lot_size_unit: 'sqft',
    year_built: 1932,
    garage_spaces: 2,
    parking_spaces: 2,
    has_pool: false,
    has_spa: false,
    is_featured: true,
    is_va_eligible: true,
    is_fixer_upper: false,
    renovation_status: 'turnkey',
    address_street: '3428 Herman Ave',
    address_city: 'San Diego',
    address_state: 'CA',
    address_zip: '92104',
    address_country: 'USA',
    address_visibility: 'full',
    neighborhood: 'North Park',
    latitude: 32.7483,
    longitude: -117.1328,
    description: 'Step into this architectural 1932 Spanish revival masterpiece nestled in the coveted heart of North Park. Featuring restored original arched mahogany doorways, hand-painted coved ceilings, and a sun-drenched central courtyard with custom terracotta pavers. The fully modernized chef kitchen boasts quartz waterfall countertops, zellige tile backsplash, and bespoke cabinetry. The detached 2-car garage features alley access and is pre-plumbed for an immediate income-generating ADU.',
    features: [
      'Spanish Revival Architecture',
      'Original Coved Ceilings',
      'Private Terracotta Courtyard',
      'ADU Potential with Alley Access',
      'Quartz Waterfall Kitchen',
      'Central HVAC',
      'Walk to 30th St Dining'
    ],
    amenities: ['Central A/C', 'Quartz Countertops', 'Hardwood Floors', 'Courtyard Patio', 'ADU Pre-Plumbed'],
    hoa_fee_monthly: 0,
    hoa_fee_frequency: 'none',
    property_tax_rate: 1.22,
    mls_number: 'SD26-90412',
    primary_image: '/images/properties/north-park-spanish.svg',
    gallery_images: [
      '/images/properties/north-park-spanish.svg',
      '/images/properties/interior-living.svg',
      '/images/properties/kitchen-luxury.svg',
      '/images/properties/courtyard-patio.svg'
    ],
    media: [
      {
        id: 'm-np-01',
        property_id: 'a0000000-0000-0000-0000-000000000001',
        media_type: 'image',
        url: '/images/properties/north-park-spanish.svg',
        alt_text: 'Spanish revival facade with terracotta tiled roof and landscaping',
        display_order: 1,
        is_primary: true,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'm-np-02',
        property_id: 'a0000000-0000-0000-0000-000000000001',
        media_type: 'image',
        url: '/images/properties/interior-living.svg',
        alt_text: 'Open-concept living room with coved ceilings and hardwood flooring',
        display_order: 2,
        is_primary: false,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'm-np-03',
        property_id: 'a0000000-0000-0000-0000-000000000001',
        media_type: 'image',
        url: '/images/properties/kitchen-luxury.svg',
        alt_text: 'Designer chef kitchen with waterfall quartz island and custom pendant lighting',
        display_order: 3,
        is_primary: false,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'm-np-04',
        property_id: 'a0000000-0000-0000-0000-000000000001',
        media_type: 'image',
        url: '/images/properties/courtyard-patio.svg',
        alt_text: 'Private central terracotta courtyard with string lights and drought-tolerant succulents',
        display_order: 4,
        is_primary: false,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ],
    view_count: 248,
    inquiries_count: 14,
    seo_title: '3428 Herman Ave — Restored Spanish Revival in North Park',
    seo_description: '3 Bed, 2 Bath Spanish Revival home in North Park, San Diego with private courtyard and permitted ADU potential. Offered at $1,185,000.',
    is_indexable: true,
    deleted_at: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    slug: 'pacific-beach-coastal-condo',
    title: 'Modern Coastal Condo with Private Sunset Balcony',
    tagline: 'Blocks from Sail Bay and the Pacific surf with resort-style amenities',
    property_type: 'Condo',
    status: 'active',
    listing_status: 'for_sale',
    publication_status: 'published',
    price: 895000,
    currency: 'USD',
    bedrooms: 2,
    bathrooms: 2.0,
    square_feet: 1150,
    year_built: 2018,
    garage_spaces: 2,
    parking_spaces: 2,
    has_pool: true,
    has_spa: true,
    is_featured: true,
    is_va_eligible: true,
    is_fixer_upper: false,
    renovation_status: 'turnkey',
    address_street: '1245 Pacific Beach Dr',
    address_unit: '#3B',
    address_city: 'San Diego',
    address_state: 'CA',
    address_zip: '92109',
    address_country: 'USA',
    address_visibility: 'full',
    neighborhood: 'Pacific Beach',
    latitude: 32.7932,
    longitude: -117.2415,
    description: 'Experience California coastal living at its finest in this immaculate 2-bedroom, 2-bath designer residence. Positioned just three blocks from the sand and Sail Bay, this sunlit corner unit features floor-to-ceiling sliding glass doors opening onto an expansive sunset balcony. Highlights include white oak hardwood flooring, custom motorized shades, in-unit laundry, and two secured underground parking spaces with EV charging.',
    features: [
      '3 Blocks to Beach & Sail Bay',
      'Ocean Sunset Views',
      'White Oak Hardwood Flooring',
      'Resort Heated Pool & Spa',
      'Two Underground Parking Spaces with EV',
      'In-Unit Washer/Dryer',
      'Secure Access Building'
    ],
    amenities: ['Heated Pool', 'Spa', 'EV Charging Station', 'Elevator', 'In-Unit Laundry'],
    hoa_fee_monthly: 420,
    hoa_fee_frequency: 'monthly',
    property_tax_rate: 1.18,
    mls_number: 'SD26-88104',
    primary_image: '/images/properties/pacific-beach-condo.svg',
    gallery_images: [
      '/images/properties/pacific-beach-condo.svg',
      '/images/properties/interior-living.svg',
      '/images/properties/pool-resort.svg'
    ],
    media: [
      {
        id: 'm-pb-01',
        property_id: 'a0000000-0000-0000-0000-000000000002',
        media_type: 'image',
        url: '/images/properties/pacific-beach-condo.svg',
        alt_text: 'Pacific Beach modern condo exterior with glass balconies and coastal palms',
        display_order: 1,
        is_primary: true,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 'm-pb-02',
        property_id: 'a0000000-0000-0000-0000-000000000002',
        media_type: 'image',
        url: '/images/properties/pool-resort.svg',
        alt_text: 'Community heated swimming pool with lounge cabanas',
        display_order: 2,
        is_primary: false,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      }
    ],
    view_count: 184,
    inquiries_count: 9,
    seo_title: '1245 Pacific Beach Dr #3B — Luxury Coastal Condo',
    seo_description: '2 Bed, 2 Bath modern condo 3 blocks from Sail Bay in Pacific Beach, San Diego. Offered at $895,000.',
    is_indexable: true,
    deleted_at: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    slug: 'chula-vista-pool-home-eastlake',
    title: 'Resort Living: Eastlake Family Home with Saltwater Pool & Solar',
    tagline: 'Expansive 4-bedroom executive estate with panoramic mountain views and resort backyard',
    property_type: 'Single Family',
    status: 'active',
    listing_status: 'for_sale',
    publication_status: 'published',
    price: 949000,
    currency: 'USD',
    bedrooms: 4,
    bathrooms: 3.0,
    square_feet: 2650,
    lot_size_sqft: 7800,
    lot_size_unit: 'sqft',
    year_built: 2004,
    garage_spaces: 3,
    parking_spaces: 3,
    has_pool: true,
    has_spa: true,
    is_featured: true,
    is_va_eligible: true,
    is_fixer_upper: false,
    renovation_status: 'updated',
    address_street: '2842 Eastlake Pkwy',
    address_city: 'Chula Vista',
    address_state: 'CA',
    address_zip: '91915',
    address_country: 'USA',
    address_visibility: 'full',
    neighborhood: 'Chula Vista',
    latitude: 32.6328,
    longitude: -116.9745,
    description: 'Welcome home to resort-style California living in Eastlake Greens. This stunning single-family home features an entertainer backyard with a heated pebble-finish saltwater pool, raised spa, covered patio with built-in BBQ kitchen, and fire pit. Inside features soaring vaulted ceilings, ground-floor bedroom with full bath, gourmet kitchen with granite countertops, owned 8.4kW solar system, and a 3-car garage.',
    features: [
      'Heated Saltwater Pool & Raised Spa',
      'Fully Owned 8.4kW Solar System',
      'Main-Floor Bedroom & Full Bathroom',
      '3-Car Direct-Entry Garage',
      'Built-in Outdoor Kitchen & Fire Pit',
      'Top-Ranked Eastlake Schools'
    ],
    amenities: ['Saltwater Pool', 'Spa', 'Owned Solar', 'Outdoor Kitchen', '3-Car Garage'],
    hoa_fee_monthly: 95,
    hoa_fee_frequency: 'monthly',
    property_tax_rate: 1.28,
    mls_number: 'CV26-77312',
    primary_image: '/images/properties/chula-vista-pool.svg',
    gallery_images: [
      '/images/properties/chula-vista-pool.svg',
      '/images/properties/pool-resort.svg',
      '/images/properties/kitchen-luxury.svg',
      '/images/properties/interior-living.svg'
    ],
    media: [
      {
        id: 'm-cv-01',
        property_id: 'a0000000-0000-0000-0000-000000000003',
        media_type: 'image',
        url: '/images/properties/chula-vista-pool.svg',
        alt_text: 'Chula Vista Eastlake estate with pool and palm landscaping',
        display_order: 1,
        is_primary: true,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
      }
    ],
    view_count: 312,
    inquiries_count: 22,
    seo_title: '2842 Eastlake Pkwy — Chula Vista Family Pool Estate',
    seo_description: '4 Bed, 3 Bath home in Eastlake, Chula Vista with saltwater pool, owned solar, and 3-car garage. Offered at $949,000.',
    is_indexable: true,
    deleted_at: null,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    slug: 'oceanside-va-approved-ranch-home',
    title: 'Turnkey Coastal Ranch Minutes to Camp Pendleton Main Gate',
    tagline: 'Ideal for military buyers utilizing 0% down VA financing with private RV parking',
    property_type: 'Single Family',
    status: 'active',
    listing_status: 'for_sale',
    publication_status: 'published',
    price: 789000,
    currency: 'USD',
    bedrooms: 3,
    bathrooms: 2.0,
    square_feet: 1520,
    lot_size_sqft: 6500,
    lot_size_unit: 'sqft',
    year_built: 1978,
    garage_spaces: 2,
    parking_spaces: 4,
    has_pool: false,
    has_spa: false,
    is_featured: true,
    is_va_eligible: true,
    is_fixer_upper: false,
    renovation_status: 'turnkey',
    address_street: '412 Canyon Dr',
    address_city: 'Oceanside',
    address_state: 'CA',
    address_zip: '92054',
    address_country: 'USA',
    address_visibility: 'full',
    neighborhood: 'Oceanside',
    latitude: 33.1959,
    longitude: -117.3795,
    description: 'Perfect for military families! Located just 8 minutes from the Camp Pendleton San Luis Rey gate and 2 miles to Oceanside Harbor beaches. This single-level ranch has been meticulously renovated with dual-pane vinyl windows, new roof, luxury vinyl plank flooring, recessed LED lighting, and an upgraded electrical panel. Huge flat fenced backyard with gated side RV/boat parking and no HOA fees or Mello-Roos.',
    features: [
      '8 Mins to Camp Pendleton Main Gate',
      '0% Down VA Loan Pre-Approved',
      'Gated RV / Boat Parking',
      'New Roof & Upgraded 200A Electrical',
      'Zero HOA Fees & No Mello-Roos',
      'Single-Story Accessibility'
    ],
    amenities: ['RV Parking', 'Fenced Yard', 'Single Story', 'No HOA', 'Central Heat'],
    hoa_fee_monthly: 0,
    hoa_fee_frequency: 'none',
    property_tax_rate: 1.15,
    mls_number: 'OC26-55409',
    primary_image: '/images/properties/oceanside-ranch.svg',
    gallery_images: [
      '/images/properties/oceanside-ranch.svg',
      '/images/properties/interior-living.svg',
      '/images/properties/courtyard-patio.svg'
    ],
    media: [
      {
        id: 'm-oc-01',
        property_id: 'a0000000-0000-0000-0000-000000000004',
        media_type: 'image',
        url: '/images/properties/oceanside-ranch.svg',
        alt_text: 'Oceanside single-story coastal ranch with RV driveway',
        display_order: 1,
        is_primary: true,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ],
    view_count: 279,
    inquiries_count: 19,
    seo_title: '412 Canyon Dr — Oceanside Single Story VA Ranch Home',
    seo_description: '3 Bed, 2 Bath Oceanside home minutes to Camp Pendleton. 0% Down VA financing ready with RV parking. $789,000.',
    is_indexable: true,
    deleted_at: null,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    slug: 'clairemont-fixer-investor-special',
    title: 'High-Upside Fixer with Canyon Views & 8,400 Sq Ft Lot (SB 9 / ADU)',
    tagline: '70% ARV Rule Investor Opportunity: Large lot primed for remodel and detached dual ADU build',
    property_type: 'Fixer-Upper',
    status: 'pending',
    listing_status: 'pending',
    publication_status: 'published',
    price: 765000,
    currency: 'USD',
    original_price: 799000,
    previous_price: 799000,
    bedrooms: 3,
    bathrooms: 2.0,
    square_feet: 1420,
    lot_size_sqft: 8400,
    lot_size_unit: 'sqft',
    year_built: 1959,
    garage_spaces: 2,
    parking_spaces: 2,
    has_pool: false,
    has_spa: false,
    is_featured: false,
    is_va_eligible: false,
    is_fixer_upper: true,
    renovation_status: 'fixer_upper',
    arv_estimate: 1150000,
    address_street: '4920 Mount Alifan Dr',
    address_city: 'San Diego',
    address_state: 'CA',
    address_zip: '92111',
    address_country: 'USA',
    address_visibility: 'full',
    neighborhood: 'Clairemont',
    latitude: 32.8256,
    longitude: -117.1852,
    description: 'Contractor special and fix-and-flip investor dream in central Clairemont Mesa! Property backs up to serene canyon green space with no rear neighbors. Solid mid-century bones with copper plumbing and solid foundation, but requires full cosmetic overhaul: kitchen, baths, flooring, and roof. Massive 8,400 sq ft RS-1-7 zoned lot qualifies under City of San Diego ADU bonus programs for up to two detached rental units. Estimated ARV after full renovation: $1,150,000.',
    features: [
      'Huge 8,400 Sq Ft Canyon-Backing Lot',
      'SB 9 / Multi-ADU Development Potential',
      'Estimated After Repair Value: $1,150,000',
      'Strong 70% ARV Acquisition Spread',
      'Solid Mid-Century Foundation & Copper Plumbing',
      'Convenient Central San Diego Location'
    ],
    amenities: ['Canyon View', 'Large Lot', 'ADU Zoning', 'Fixer Spread'],
    hoa_fee_monthly: 0,
    hoa_fee_frequency: 'none',
    property_tax_rate: 1.20,
    mls_number: 'CM26-44012',
    primary_image: '/images/properties/clairemont-fixer.svg',
    gallery_images: [
      '/images/properties/clairemont-fixer.svg',
      '/images/properties/courtyard-patio.svg'
    ],
    media: [
      {
        id: 'm-cm-01',
        property_id: 'a0000000-0000-0000-0000-000000000005',
        media_type: 'image',
        url: '/images/properties/clairemont-fixer.svg',
        alt_text: 'Clairemont mid-century single-story fixer with canyon lot',
        display_order: 1,
        is_primary: true,
        created_at: new Date(Date.now() - 12 * 86400000).toISOString()
      }
    ],
    view_count: 421,
    inquiries_count: 27,
    seo_title: '4920 Mount Alifan Dr — Clairemont Fixer with Canyon View',
    seo_description: 'Fix & flip opportunity in Clairemont San Diego. 8,400 sq ft lot with ADU potential. ARV $1.15M.',
    is_indexable: true,
    deleted_at: null,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    slug: 'san-carlos-lake-murray-view-home',
    title: 'San Carlos Modernized Mid-Century Near Lake Murray & Cowles Mountain',
    tagline: 'Ideal for first-time buyers wanting space, top schools, and mountain views',
    property_type: 'Single Family',
    status: 'active',
    listing_status: 'for_sale',
    publication_status: 'published',
    price: 925000,
    currency: 'USD',
    bedrooms: 3,
    bathrooms: 2.0,
    square_feet: 1680,
    lot_size_sqft: 6800,
    lot_size_unit: 'sqft',
    year_built: 1968,
    garage_spaces: 2,
    parking_spaces: 2,
    has_pool: false,
    has_spa: false,
    is_featured: false,
    is_va_eligible: true,
    is_fixer_upper: false,
    renovation_status: 'updated',
    address_street: '7215 Navajo Rd',
    address_city: 'San Diego',
    address_state: 'CA',
    address_zip: '92119',
    address_country: 'USA',
    address_visibility: 'full',
    neighborhood: 'San Carlos',
    latitude: 32.8012,
    longitude: -117.0345,
    description: 'Breathtaking Cowles Mountain views from your private front patio! This light-filled San Carlos home has been tastefully updated with an open-concept kitchen, custom quartz counters, stainless appliances, and dual pane sliding doors leading out to a peaceful tiered backyard with mature fruit trees. Walking distance to Lake Murray community park, coffee shops, and top-rated Grossmont Unified schools.',
    features: [
      'Cowles Mountain & Lake Murray Views',
      'Open-Concept Quartz Chef Kitchen',
      'Private Tiered Backyard with Fruit Trees',
      'Attached 2-Car Garage with Epoxy Floor',
      'Qualifies for CalHFA First-Time Buyer Programs',
      'No HOA Fees'
    ],
    amenities: ['Mountain View', 'Quartz Kitchen', 'Epoxy Garage', 'Fruit Trees'],
    hoa_fee_monthly: 0,
    hoa_fee_frequency: 'none',
    property_tax_rate: 1.19,
    mls_number: 'SC26-33019',
    primary_image: '/images/properties/san-carlos-home.svg',
    gallery_images: [
      '/images/properties/san-carlos-home.svg',
      '/images/properties/interior-living.svg',
      '/images/properties/kitchen-luxury.svg'
    ],
    media: [
      {
        id: 'm-sc-01',
        property_id: 'a0000000-0000-0000-0000-000000000006',
        media_type: 'image',
        url: '/images/properties/san-carlos-home.svg',
        alt_text: 'San Carlos family home with Cowles mountain backdrop',
        display_order: 1,
        is_primary: true,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString()
      }
    ],
    view_count: 198,
    inquiries_count: 11,
    seo_title: '7215 Navajo Rd — San Carlos Family Home Near Lake Murray',
    seo_description: '3 Bed, 2 Bath modernized home in San Carlos, San Diego with mountain views and CalHFA eligibility. $925,000.',
    is_indexable: true,
    deleted_at: null,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    slug: 'la-jolla-village-luxury-townhome',
    title: 'Architectural Townhome in the Village of La Jolla with Rooftop Ocean Peeks',
    tagline: 'Sophisticated coastal living steps from Girard Avenue fine dining and beaches',
    property_type: 'Townhome',
    status: 'active',
    listing_status: 'for_sale',
    publication_status: 'published',
    price: 1875000,
    currency: 'USD',
    bedrooms: 3,
    bathrooms: 2.5,
    square_feet: 1980,
    year_built: 2016,
    garage_spaces: 2,
    parking_spaces: 2,
    has_pool: false,
    has_spa: false,
    is_featured: true,
    is_va_eligible: true,
    is_fixer_upper: false,
    renovation_status: 'turnkey',
    address_street: '7435 Draper Ave',
    address_unit: '#2',
    address_city: 'La Jolla',
    address_state: 'CA',
    address_zip: '92037',
    address_country: 'USA',
    address_visibility: 'full',
    neighborhood: 'La Jolla',
    latitude: 32.8398,
    longitude: -117.2764,
    description: 'Spectacular multi-level architectural masterpiece in the Village of La Jolla. Enjoy sunsets from your private 400 sq ft rooftop terrace with panoramic Pacific ocean peeks. Features include 10-foot ceilings, European white oak cabinetry, Miele appliance suite, floating steel staircase, and direct entry 2-car garage with epoxy floors. Moments to world-famous Windansea beach and Girard Avenue boutiques.',
    features: [
      'Private Rooftop Deck with Ocean View',
      'Walk to Windansea Beach',
      'Miele Luxury Appliance Suite',
      'Floating Architectural Staircase',
      'Attached 2-Car Garage',
      'Low HOA'
    ],
    amenities: ['Rooftop Terrace', 'Ocean Views', 'Miele Appliances', 'Epoxy Garage'],
    hoa_fee_monthly: 310,
    hoa_fee_frequency: 'monthly',
    property_tax_rate: 1.16,
    mls_number: 'LJ26-99214',
    primary_image: '/images/properties/la-jolla-townhome.svg',
    gallery_images: [
      '/images/properties/la-jolla-townhome.svg',
      '/images/properties/kitchen-luxury.svg',
      '/images/properties/courtyard-patio.svg'
    ],
    media: [
      {
        id: 'm-lj-01',
        property_id: 'a0000000-0000-0000-0000-000000000007',
        media_type: 'image',
        url: '/images/properties/la-jolla-townhome.svg',
        alt_text: 'La Jolla architectural multi-level townhome with rooftop deck',
        display_order: 1,
        is_primary: true,
        created_at: new Date(Date.now() - 18 * 86400000).toISOString()
      }
    ],
    view_count: 512,
    inquiries_count: 31,
    seo_title: '7435 Draper Ave #2 — Luxury La Jolla Village Townhome',
    seo_description: '3 Bed, 2.5 Bath architectural townhome in the Village of La Jolla with private rooftop deck. $1,875,000.',
    is_indexable: true,
    deleted_at: null,
    created_at: new Date(Date.now() - 18 * 86400000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000008',
    slug: 'golden-hill-multi-family-duplex',
    title: 'Income Generating Golden Hill Duplex with Downtown Skyline Views',
    tagline: 'Two detached residences on one lot with high cash-flow potential',
    property_type: 'Multi-Family',
    status: 'active',
    listing_status: 'for_sale',
    publication_status: 'published',
    price: 1350000,
    currency: 'USD',
    bedrooms: 4,
    bathrooms: 3.0,
    square_feet: 2240,
    lot_size_sqft: 5500,
    lot_size_unit: 'sqft',
    year_built: 1928,
    garage_spaces: 2,
    parking_spaces: 2,
    has_pool: false,
    has_spa: false,
    is_featured: false,
    is_va_eligible: true,
    is_fixer_upper: false,
    renovation_status: 'updated',
    address_street: '2418 B Street',
    address_city: 'San Diego',
    address_state: 'CA',
    address_zip: '92102',
    address_country: 'USA',
    address_visibility: 'full',
    neighborhood: 'Golden Hill',
    latitude: 32.7214,
    longitude: -117.1396,
    description: 'Incredible house-hack or pure cash-flow investment! Front house is a charming 3-bed/2-bath Craftsman with fireplace and original built-ins; rear unit is a fully permitted 1-bed/1-bath cottage with private yard and Downtown San Diego skyline views. Separate electric and gas meters. Live in one and let your tenant pay 70% of your mortgage, or rent both for strong cap rate return.',
    features: [
      'Two Detached Units on One Lot',
      'Downtown San Diego Skyline Views',
      'Separate Utility Meters',
      'Proven Rental Income',
      'Walk to Balboa Park',
      'Classic Craftsman Details'
    ],
    amenities: ['Skyline Views', 'Dual Metered', 'Craftsman Fireplace', 'Private Yard'],
    hoa_fee_monthly: 0,
    hoa_fee_frequency: 'none',
    property_tax_rate: 1.21,
    mls_number: 'SD26-62019',
    primary_image: '/images/properties/golden-hill-duplex.svg',
    gallery_images: [
      '/images/properties/golden-hill-duplex.svg',
      '/images/properties/interior-living.svg'
    ],
    media: [
      {
        id: 'm-gh-01',
        property_id: 'a0000000-0000-0000-0000-000000000008',
        media_type: 'image',
        url: '/images/properties/golden-hill-duplex.svg',
        alt_text: 'Golden Hill Craftsman duplex exterior with downtown skyline peeks',
        display_order: 1,
        is_primary: true,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      }
    ],
    view_count: 367,
    inquiries_count: 18,
    seo_title: '2418 B Street — Golden Hill Multi-Family Income Duplex',
    seo_description: '4 Bed, 3 Bath duplex in Golden Hill, San Diego with Downtown skyline views. High cash flow potential. $1,350,000.',
    is_indexable: true,
    deleted_at: null,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000009',
    slug: 'mission-hills-spanish-draft',
    title: 'Historic Mission Hills Spanish Colonial Revival (Coming Soon)',
    tagline: 'Private canyon estate with original 1926 architectural tilework and views',
    property_type: 'Single Family',
    status: 'draft',
    listing_status: 'coming_soon',
    publication_status: 'draft',
    price: 1650000,
    currency: 'USD',
    bedrooms: 4,
    bathrooms: 3.5,
    square_feet: 2850,
    lot_size_sqft: 9200,
    lot_size_unit: 'sqft',
    year_built: 1926,
    garage_spaces: 2,
    parking_spaces: 2,
    has_pool: false,
    has_spa: false,
    is_featured: false,
    is_va_eligible: true,
    is_fixer_upper: false,
    renovation_status: 'turnkey',
    address_street: '1824 Sunset Blvd',
    address_city: 'San Diego',
    address_state: 'CA',
    address_zip: '92103',
    address_country: 'USA',
    address_visibility: 'neighborhood_only',
    neighborhood: 'Mission Hills',
    latitude: 32.7512,
    longitude: -117.1784,
    description: 'Upcoming listing in historic Mission Hills. Architect-designed Spanish colonial estate with hand-crafted batchelder fireplace, panoramic canyon views, and wine cellar. Currently undergoing final stage preparation before public launch.',
    features: ['Original 1926 Spanish Architecture', 'Canyon Views', 'Wine Cellar', 'Preserved Architectural Tilework'],
    amenities: ['Wine Cellar', 'Canyon Views', 'Hardwood Floors'],
    hoa_fee_monthly: 0,
    hoa_fee_frequency: 'none',
    property_tax_rate: 1.18,
    mls_number: 'MH26-DRAFT',
    primary_image: '/images/properties/north-park-spanish.svg',
    gallery_images: [
      '/images/properties/north-park-spanish.svg',
      '/images/properties/interior-living.svg'
    ],
    media: [
      {
        id: 'm-mh-01',
        property_id: 'a0000000-0000-0000-0000-000000000009',
        media_type: 'image',
        url: '/images/properties/north-park-spanish.svg',
        alt_text: 'Mission Hills Spanish colonial front exterior',
        display_order: 1,
        is_primary: true,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ],
    view_count: 12,
    inquiries_count: 1,
    seo_title: '1824 Sunset Blvd — Historic Mission Hills Spanish Estate',
    seo_description: 'Coming soon in Mission Hills, San Diego. 4 Bed, 3.5 Bath Spanish revival with canyon views.',
    is_indexable: false,
    deleted_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000010',
    slug: 'south-park-craftsman-archived',
    title: 'Historic South Park Craftsman with Detached Studio (Closed Escrow)',
    tagline: 'Sold over asking price in 7 days by Edgar Valle & Full Circle Group',
    property_type: 'Single Family',
    status: 'sold',
    listing_status: 'sold',
    publication_status: 'archived',
    price: 1120000,
    currency: 'USD',
    original_price: 1075000,
    bedrooms: 3,
    bathrooms: 2.0,
    square_feet: 1610,
    lot_size_sqft: 4800,
    lot_size_unit: 'sqft',
    year_built: 1922,
    garage_spaces: 1,
    parking_spaces: 2,
    has_pool: false,
    has_spa: false,
    is_featured: false,
    is_va_eligible: true,
    is_fixer_upper: false,
    renovation_status: 'turnkey',
    address_street: '2930 Fern St',
    address_city: 'San Diego',
    address_state: 'CA',
    address_zip: '92104',
    address_country: 'USA',
    address_visibility: 'full',
    neighborhood: 'South Park',
    latitude: 32.7291,
    longitude: -117.1287,
    description: 'Charming 1922 South Park craftsman sold with multiple competitive offers. Features restored Douglas fir trim, detached creative studio, and private brick patio.',
    features: ['Restored Douglas Fir Trim', 'Detached Studio', 'Brick Entertaining Patio'],
    amenities: ['Detached Studio', 'Historic Trim', 'Brick Patio'],
    hoa_fee_monthly: 0,
    hoa_fee_frequency: 'none',
    property_tax_rate: 1.20,
    mls_number: 'SP26-88120',
    primary_image: '/images/properties/north-park-spanish.svg',
    gallery_images: ['/images/properties/north-park-spanish.svg'],
    media: [
      {
        id: 'm-sp-01',
        property_id: 'a0000000-0000-0000-0000-000000000010',
        media_type: 'image',
        url: '/images/properties/north-park-spanish.svg',
        alt_text: 'South Park Craftsman front elevation',
        display_order: 1,
        is_primary: true,
        created_at: new Date(Date.now() - 40 * 86400000).toISOString()
      }
    ],
    view_count: 520,
    inquiries_count: 38,
    seo_title: '2930 Fern St — Sold South Park Craftsman',
    seo_description: 'Sold in 7 days by Edgar Valle. 3 Bed Craftsman in South Park, San Diego.',
    is_indexable: false,
    deleted_at: null,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString()
  }
];

export const INITIAL_OPEN_HOUSES: OpenHouse[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    property_id: 'a0000000-0000-0000-0000-000000000001',
    property: INITIAL_PROPERTIES[0],
    start_time: '2026-10-24T13:00:00-07:00',
    end_time: '2026-10-24T16:00:00-07:00',
    timezone: 'PST',
    host_name: 'Edgar Valle',
    refreshments_provided: true,
    special_instructions: 'Saturday Open House: Hosted personally by Edgar Valle. Espresso bar and artisan pastries served in the courtyard. All buyers and brokers welcome!',
    is_cancelled: false,
    rsvp_link: '/contact?type=open_house_rsvp&prop=a0000000-0000-0000-0000-000000000001'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    property_id: 'a0000000-0000-0000-0000-000000000001',
    property: INITIAL_PROPERTIES[0],
    start_time: '2026-10-25T13:00:00-07:00',
    end_time: '2026-10-25T16:00:00-07:00',
    timezone: 'PST',
    host_name: 'Edgar Valle',
    refreshments_provided: true,
    special_instructions: 'Sunday Open House: Afternoon showing with Edgar Valle. Wine & sparkling water with local gourmet charcuterie.',
    is_cancelled: false,
    rsvp_link: '/contact?type=open_house_rsvp&prop=a0000000-0000-0000-0000-000000000001'
  }
];

export const INITIAL_NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    slug: 'north-park',
    name: 'North Park',
    tagline: 'Historic Craftsman Charm & Thriving Culinary Scene',
    summary: 'A vibrant, highly walkable cultural epicenter filled with California Craftsman bungalows, Spanish revival homes, award-winning craft breweries, third-wave coffee roasters, and Ray at Night art walks.',
    median_home_price: 1120000,
    vibe: 'Walkable, Historic, Artistic & Hip',
    commute_downtown_mins: 10,
    highlights: [
      '30th Street Nationally Ranked Dining Corridor',
      'Historic 1920s Craftsman & Spanish Architecture',
      'Steps to Morley Field & Balboa Park Trails',
      'High Appreciation & High ADU Rental Yields'
    ],
    hero_image: '/images/neighborhoods/north-park.svg'
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    slug: 'pacific-beach',
    name: 'Pacific Beach',
    tagline: 'Sun-Drenched Coastal Energy & Oceanfront Living',
    summary: 'Miles of sandy Pacific coastline, the iconic Crystal Pier, lively beach boardwalks, and tranquil bayside living along Crown Point and Sail Bay. Perfect for ocean enthusiasts and active coastal lifestyles.',
    median_home_price: 1280000,
    vibe: 'Coastal, Active, Vibrant & Breezy',
    commute_downtown_mins: 15,
    highlights: [
      'Crystal Pier & Premier Surf Breaks',
      'Sail Bay Boardwalk & Water Sports',
      'Year-Round Sunlit Coastal Climate',
      'Strong Vacation & Long-Term Rental Demand'
    ],
    hero_image: '/images/neighborhoods/pacific-beach.svg'
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    slug: 'chula-vista',
    name: 'Chula Vista & Eastlake',
    tagline: 'Family Communities, Mountain Vistas & Resort Living',
    summary: 'South Bay crown jewel offering master-planned communities like Eastlake Greens and Otay Ranch. Renowned for top-tier schools, sprawling community parks with Olympic-size pools, scenic lakes, and newer construction homes with pools and 3-car garages.',
    median_home_price: 895000,
    vibe: 'Family-Oriented, Spacious, Master-Planned',
    commute_downtown_mins: 20,
    highlights: [
      'Eastlake Lake, Olympic Training Center & Trails',
      'Top Performing Chula Vista School Districts',
      'Spacious Lots with Pools & 3-Car Garages',
      'Transformational Chula Vista Bayfront Project'
    ],
    hero_image: '/images/neighborhoods/chula-vista.svg'
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    slug: 'oceanside',
    name: 'Oceanside',
    tagline: 'Coastal Community with Strong Military Roots',
    summary: 'North County coastal hub home to historic wooden pier, harbor marina, and immediate proximity to Camp Pendleton. Popular with military families using VA loans and investors seeking coastal value.',
    median_home_price: 845000,
    vibe: 'Coastal, Military-Friendly, Value-Driven',
    commute_downtown_mins: 35,
    highlights: [
      'Direct Proximity to Camp Pendleton Main Gate',
      '100% VA Financing Hub with 0% Down',
      'Historic Wooden Pier & Harbor Marina',
      'Exploding Downtown Culinary Scene'
    ],
    hero_image: '/images/neighborhoods/oceanside.svg'
  },
  {
    id: 'd0000000-0000-0000-0000-000000000005',
    slug: 'la-jolla',
    name: 'La Jolla',
    tagline: 'World-Class Luxury & Dramatic Ocean Cliffs',
    summary: 'San Diego premier luxury destination famous for La Jolla Cove, scenic sea cliffs, designer shopping along Prospect Street, and architecturally stunning estates.',
    median_home_price: 2450000,
    vibe: 'Prestigious, Coastal Luxury, World-Class',
    commute_downtown_mins: 20,
    highlights: [
      'La Jolla Cove & Torrey Pines State Reserve',
      'Top Ranked Public & Private Academies',
      'Michelin-Starred Dining & Fine Art Galleries',
      'Unmatched Long-Term Coastal Capital Preservation'
    ],
    hero_image: '/images/neighborhoods/la-jolla.svg'
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    slug: 'va-home-loan-san-diego-complete-guide',
    title: 'The Complete Guide to Using Your VA Loan in High-Cost San Diego',
    category: 'VA Loans',
    excerpt: 'Learn how military service members and veterans can buy a home in San Diego with zero down payment, no PMI, and maximum purchasing power using their BAH.',
    content: `San Diego is proudly home to one of the largest concentrations of active-duty military and veterans in the nation. With Camp Pendleton in Oceanside, Naval Base San Diego (32nd Street), Naval Base Coronado, and MCAS Miramar, our military community is the heartbeat of our region.

As a San Diego Realtor specializing in military relocation and VA loans, I hear the same misconception every single week: "Can I actually buy a home in San Diego with zero down payment given our median home prices?"

The answer is an emphatic YES.

### 1. No More VA Loan Limits for Full Entitlement
Thanks to the Blue Water Navy Vietnam Veterans Act, statutory county loan limits were eliminated for veterans with full entitlement. What does this mean for you? You can purchase a home in San Diego at $850,000, $1,000,000, or even $1,300,000 with ZERO down payment, provided your debt-to-income (DTI) and Basic Allowance for Housing (BAH) qualify for the monthly mortgage payment.

### 2. Zero Private Mortgage Insurance (PMI)
On a conventional loan with less than 20% down, private mortgage insurance costs buyers $300 to $650 per month. On a VA loan, PMI is $0. That preserves hundreds of dollars every month for your family or savings.

### 3. Leveraging San Diego BAH
San Diego has some of the highest Basic Allowance for Housing (BAH) rates in the entire United States. When you buy instead of renting, your monthly housing allowance builds home equity that belongs to you—not a landlord.

### 4. How Edgar Valle Helps Military Families
We coordinate seamlessly with VA-specialist lenders, schedule virtual walkthroughs for service members deployed or stationed out-of-state, and structure offers that win even in competitive San Diego markets.`,
    author_name: 'Edgar Valle',
    read_time_mins: 6,
    cover_image: '/images/blog/va-loan-guide.svg',
    is_published: true,
    published_at: '2026-10-15T09:00:00-07:00'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    slug: 'first-time-homebuyer-roadmap-san-diego',
    title: 'First-Time Homebuyer Roadmap: Grants, Down Payment Assistance & CalHFA',
    category: 'Buyer Guides',
    excerpt: 'A clear, step-by-step roadmap for first-time buyers navigating San Diego real estate, including CalHFA grants and credit score optimization.',
    content: `Buying your first home in San Diego can feel intimidating, but having a clear, structured roadmap transforms uncertainty into confidence.

### Step 1: Clarify Your Real Buying Power
Before browsing listings online, we connect you with vetted California mortgage specialists to calculate your true purchasing ceiling, monthly payment comfort zone, and credit profile. Even small adjustments to credit utilization can bump your score 30 points and save thousands in interest.

### Step 2: Explore California Assistance Programs
Many buyers believe you need 20% down to purchase. In reality:
- **FHA Loans**: Require only 3.5% down payment.
- **Conventional 97**: Allows 3% down for first-time buyers.
- **CalHFA Programs**: Offer down payment and closing cost assistance loans for qualified California residents.

### Step 3: Define "Needs" vs "Wants" in San Diego
Are you seeking walkability in North Park? Top schools and a swimming pool in Chula Vista? Or beach proximity in Pacific Beach? Prioritizing your top three non-negotiables allows us to pounce on the right home when it hits the market.

### Step 4: Crafting the Winning Offer
In San Diego, the highest offer does not always win. Sellers care deeply about buyer financing reliability, earnest money strength, inspection timelines, and personal communication from the agent. That is where our Full Circle Group representation gives you the edge.`,
    author_name: 'Edgar Valle',
    read_time_mins: 7,
    cover_image: '/images/blog/first-time-buyer.svg',
    is_published: true,
    published_at: '2026-10-12T10:30:00-07:00'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    slug: 'san-diego-fix-and-flip-70-percent-rule',
    title: 'The San Diego Fix & Flip Playbook: Mastering the 70% Rule in 2026',
    category: 'Fix & Flip',
    excerpt: 'How real estate investors analyze distressed properties, calculate accurate ARV, and protect profit margins in San Diego County.',
    content: `In high-velocity California real estate markets, successful fix-and-flip investing isn't about guesswork; it's about mathematical discipline and rapid execution.

### The Foundation: The 70% Rule
The classic formula used by seasoned flippers:
**Maximum Allowable Offer (MAO) = (After Repair Value × 70%) - Estimated Repair Costs**

In competitive San Diego neighborhoods, some investors adjust the margin to 75% for turnkey cosmetic rehabs with low structural risk, but never compromise on conservative After Repair Value (ARV) estimates.

### Hot Value-Add Neighborhoods in San Diego:
1. **Clairemont / Linda Vista**: Mid-century single-story ranches on huge lots primed for open layouts and ADU additions.
2. **Chula Vista / South Bay**: High demand for modern finishes and backyard enhancements.
3. **El Cajon / East County**: Strong spread on single-family fixers with mountain views and RV access.

### Why Work With Edgar Valle on Investments?
As an active real estate professional with Full Circle Group, Edgar tracks off-market opportunities, evaluates comparable sales using strict appraisal methodology, and connects investors with reliable local licensed contractors.`,
    author_name: 'Edgar Valle',
    read_time_mins: 8,
    cover_image: '/images/blog/fix-and-flip.svg',
    is_published: true,
    published_at: '2026-10-08T14:15:00-07:00'
  }
];

export const SITE_SETTINGS: SiteSettings = {
  brand_name: 'Edgar Valle | Realtor',
  agent_name: 'Edgar Valle',
  brokerage_name: 'Full Circle Group',
  dre_license: '02375273',
  tagline: 'San Diego Real Estate Specialist | Hablamos Español',
  email: 'edgar@yourrealtoredgar.com',
  phone: '(619) 555-0198',
  instagram: '@yourrealtoredgar',
  instagram_url: 'https://www.instagram.com/yourrealtoredgar/',
  service_area: 'San Diego County, California',
  languages: ['English', 'Spanish (Hablamos Español)']
};

// Initial Audit Logs (Pre-populated for Audit Stream)
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    actor_email: 'edgar@yourrealtoredgar.com',
    action: 'publish_property',
    entity_type: 'property',
    entity_id: 'a0000000-0000-0000-0000-000000000001',
    details: { title: 'Restored Spanish Revival with Courtyard & ADU Potential', status: 'published' },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'log-002',
    actor_email: 'edgar@yourrealtoredgar.com',
    action: 'update_price',
    entity_type: 'property',
    entity_id: 'a0000000-0000-0000-0000-000000000001',
    details: { old_price: 1225000, new_price: 1185000, title: 'Restored Spanish Revival' },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'log-003',
    actor_email: 'edgar@yourrealtoredgar.com',
    action: 'create_property',
    entity_type: 'property',
    entity_id: 'a0000000-0000-0000-0000-000000000009',
    details: { title: 'Historic Mission Hills Spanish Colonial Revival (Coming Soon)', status: 'draft' },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

// In-memory runtime state for development and fallback
let runtimeProperties: Property[] = [...INITIAL_PROPERTIES];
let runtimeLeads: Lead[] = [
  {
    id: 'lead-001',
    full_name: 'Marcus & Jessica Vance',
    email: 'marcus.vance@gmail.com',
    phone: '(619) 555-0142',
    lead_type: 'va_buyer',
    message: 'Active duty Navy stationed at 32nd St. Looking for a 3-4 bedroom home with yard in Chula Vista or Eastlake utilizing our VA loan with 0 down.',
    preferred_contact_method: 'phone',
    estimated_budget: '$850k - $950k',
    timeframe: '1-3 months',
    is_preapproved: true,
    language_preference: 'en',
    status: 'new',
    follow_up_date: new Date(Date.now() + 24 * 3600000).toISOString(),
    assigned_admin: 'edgar@yourrealtoredgar.com',
    source_page: '/va-loans',
    utm_source: 'instagram',
    utm_medium: 'bio_link',
    utm_campaign: 'san_diego_va_buyer_guide',
    admin_notes: 'Wants single-story if possible. COE certificate in hand.',
    notes: [
      {
        id: 'n-001-1',
        lead_id: 'lead-001',
        author_email: 'edgar@yourrealtoredgar.com',
        note: 'Initial inquiry via Instagram link. Verified active-duty military eligibility with Veterans United pre-approval.',
        created_at: new Date(Date.now() - 2 * 3600000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'lead-002',
    full_name: 'Alejandro Morales',
    email: 'alejandro.morales@outlook.com',
    phone: '(619) 555-0899',
    lead_type: 'first_time_buyer',
    message: 'Hola Edgar, queremos comprar nuestra primera casa en North Park o San Carlos. Queremos saber sobre los programas de ayuda para el enganche de CalHFA.',
    preferred_contact_method: 'phone',
    estimated_budget: '$700k - $800k',
    timeframe: 'Immediate',
    is_preapproved: false,
    language_preference: 'es',
    status: 'contacted',
    follow_up_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    assigned_admin: 'edgar@yourrealtoredgar.com',
    source_page: '/es/primeros-compradores',
    utm_source: 'google',
    utm_medium: 'organic',
    admin_notes: 'Spoke with Alejandro on phone in Spanish. Scheduled introduction with bilingual CalHFA lender partner.',
    notes: [
      {
        id: 'n-002-1',
        lead_id: 'lead-002',
        author_email: 'edgar@yourrealtoredgar.com',
        note: 'Discussed Dream For All down payment assistance eligibility and credit score requirements.',
        created_at: new Date(Date.now() - 3 * 3600000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: 'lead-003',
    full_name: 'David Chen',
    email: 'dchen.investments@gmail.com',
    phone: '(858) 555-0176',
    lead_type: 'investor_flip',
    message: 'Interested in the Clairemont canyon fixer. Ready with all-cash offer and 10-day close. Want to verify SB9 ADU allowance.',
    property_id: 'a0000000-0000-0000-0000-000000000005',
    property_address: '4920 Mount Alifan Dr, San Diego, CA',
    preferred_contact_method: 'text',
    estimated_budget: '$750k - $800k',
    timeframe: 'Immediately',
    is_preapproved: true,
    language_preference: 'en',
    status: 'qualified',
    follow_up_date: new Date(Date.now() + 86400000).toISOString(),
    assigned_admin: 'edgar@yourrealtoredgar.com',
    source_page: '/properties/clairemont-canyon-fixer',
    utm_source: 'direct',
    admin_notes: 'POF verified for $800k cash funds. Sent preliminary title report and contractor inspection estimate.',
    notes: [
      {
        id: 'n-003-1',
        lead_id: 'lead-003',
        author_email: 'edgar@yourrealtoredgar.com',
        note: 'Proof of Funds verified from First Republic/Chase. Target flip timeline 4 months.',
        created_at: new Date(Date.now() - 20 * 3600000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'lead-004',
    full_name: 'Sophia Sterling',
    email: 'sophia.sterling@deloitte.com',
    phone: '(858) 555-0922',
    lead_type: 'tour_request',
    message: 'Requesting private Saturday walkthrough for the La Jolla Village luxury townhome.',
    property_id: 'a0000000-0000-0000-0000-000000000007',
    property_address: '7435 Draper Ave #2, La Jolla, CA',
    preferred_contact_method: 'email',
    estimated_budget: '$1.8M - $2.0M',
    timeframe: 'Within 30 days',
    is_preapproved: true,
    language_preference: 'en',
    status: 'appointment_scheduled',
    follow_up_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    assigned_admin: 'edgar@yourrealtoredgar.com',
    source_page: '/properties/la-jolla-village-luxury-townhome',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'la_jolla_luxury',
    admin_notes: 'Saturday 11:00 AM private tour confirmed with listing concierge.',
    notes: [
      {
        id: 'n-004-1',
        lead_id: 'lead-004',
        author_email: 'edgar@yourrealtoredgar.com',
        note: 'Pre-approval letter received from Wells Fargo Private Bank for $2.2M.',
        created_at: new Date(Date.now() - 36 * 3600000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 48 * 3600000).toISOString()
  },
  {
    id: 'lead-005',
    full_name: 'Carlos & Brenda Gutierrez',
    email: 'carlos.gutierrez@sdsu.edu',
    phone: '(619) 555-0331',
    lead_type: 'seller_valuation',
    message: 'Considering listing our 4-bedroom Spanish home in Mission Hills. Want a comprehensive comparative market analysis and pre-listing prep consult.',
    preferred_contact_method: 'phone',
    estimated_budget: '$1.4M+',
    timeframe: 'Spring 2026',
    is_preapproved: true,
    language_preference: 'en',
    status: 'in_progress',
    follow_up_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    assigned_admin: 'edgar@yourrealtoredgar.com',
    source_page: '/sell',
    utm_source: 'instagram',
    utm_medium: 'stories',
    admin_notes: 'Presented CMA showing $1.45M listing potential. Reviewing staging and photography checklist.',
    notes: [
      {
        id: 'n-005-1',
        lead_id: 'lead-005',
        author_email: 'edgar@yourrealtoredgar.com',
        note: 'In-person home walkthrough completed. Identified minor kitchen updates that could add $50k value.',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'lead-006',
    full_name: 'Elena Rostova',
    email: 'elena.rostova@biotechsd.com',
    phone: '(858) 555-0455',
    lead_type: 'tour_request',
    message: 'Closed escrow on our Torrey Pines luxury condo. Excellent guidance throughout the escrow process.',
    property_id: 'a0000000-0000-0000-0000-000000000004',
    property_address: '4560 Ocean Blvd #401, San Diego, CA',
    preferred_contact_method: 'email',
    estimated_budget: '$1.25M',
    timeframe: 'Completed',
    is_preapproved: true,
    language_preference: 'en',
    status: 'converted',
    assigned_admin: 'edgar@yourrealtoredgar.com',
    source_page: '/properties/pacific-beach-modern-duplex',
    admin_notes: 'Escrow closed on schedule with Chicago Title. 5-star Google review submitted.',
    notes: [
      {
        id: 'n-006-1',
        lead_id: 'lead-006',
        author_email: 'edgar@yourrealtoredgar.com',
        note: 'Keys handed over and housewarming gift delivered.',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'lead-007',
    full_name: 'Robert Miller',
    email: 'rmiller9912@yahoo.com',
    phone: '(619) 555-0611',
    lead_type: 'general_contact',
    message: 'Decided to relocate out of state to Arizona. Pausing our San Diego home search indefinitely.',
    preferred_contact_method: 'email',
    timeframe: 'Cancelled',
    status: 'lost',
    assigned_admin: 'edgar@yourrealtoredgar.com',
    source_page: '/contact',
    admin_notes: 'Client relocated to Phoenix for job transfer. Archived in CRM with referral partner connection.',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    id: 'lead-008',
    full_name: 'Crypto SEO Bot 3000',
    email: 'bot@ranking-boost-fast.ru',
    phone: '(000) 000-0000',
    lead_type: 'general_contact',
    message: 'We guarantee page 1 rankings for Edgar Valle in 48 hours for $500 Bitcoin transfer.',
    status: 'spam',
    assigned_admin: 'edgar@yourrealtoredgar.com',
    source_page: '/contact',
    admin_notes: 'Automated SEO spam submission. IP flagged.',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  }
];
let runtimeAuditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

// -------------------------------------------------------------
// PROPERTIES QUERY METHODS
// -------------------------------------------------------------

export interface PropertyQueryFilters {
  neighborhood?: string;
  propertyType?: string;
  status?: string;
  listingStatus?: string;
  publicationStatus?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  hasPool?: boolean;
  hasGarage?: boolean;
  isVaEligible?: boolean;
  isFixerUpper?: boolean;
  includeUnpublished?: boolean;
  includeDeleted?: boolean;
}

export async function getProperties(filters?: PropertyQueryFilters): Promise<Property[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('properties').select('*');

      // Public filtering: by default, only published non-deleted properties
      if (!filters?.includeUnpublished) {
        query = query.eq('publication_status', 'published');
      }
      if (!filters?.includeDeleted) {
        query = query.is('deleted_at', null);
      }

      if (filters?.neighborhood && filters.neighborhood !== 'all') {
        query = query.eq('neighborhood', filters.neighborhood);
      }
      if (filters?.propertyType && filters.propertyType !== 'all') {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.listingStatus && filters.listingStatus !== 'all') {
        query = query.eq('listing_status', filters.listingStatus);
      }
      if (filters?.publicationStatus && filters.publicationStatus !== 'all') {
        query = query.eq('publication_status', filters.publicationStatus);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.hasPool) {
        query = query.eq('has_pool', true);
      }
      if (filters?.isVaEligible) {
        query = query.eq('is_va_eligible', true);
      }
      if (filters?.isFixerUpper) {
        query = query.eq('is_fixer_upper', true);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Property[];
      }
    } catch (e) {
      console.warn('Supabase properties query fallback to local store:', e);
    }
  }

  // Local filtered fallback
  let list = [...runtimeProperties];

  // Default visibility rules
  if (!filters?.includeUnpublished) {
    list = list.filter(p => p.publication_status === 'published');
  }
  if (!filters?.includeDeleted) {
    list = list.filter(p => !p.deleted_at);
  }

  if (filters) {
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.address_street.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.address_city.toLowerCase().includes(q) ||
        (p.mls_number && p.mls_number.toLowerCase().includes(q))
      );
    }
    if (filters.neighborhood && filters.neighborhood !== 'all') {
      list = list.filter(p => p.neighborhood.toLowerCase() === filters.neighborhood!.toLowerCase());
    }
    if (filters.propertyType && filters.propertyType !== 'all') {
      list = list.filter(p => p.property_type === filters.propertyType);
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter(p => p.status === filters.status);
    }
    if (filters.listingStatus && filters.listingStatus !== 'all') {
      list = list.filter(p => p.listing_status === filters.listingStatus);
    }
    if (filters.publicationStatus && filters.publicationStatus !== 'all') {
      list = list.filter(p => p.publication_status === filters.publicationStatus);
    }
    if (filters.minPrice) {
      list = list.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      list = list.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.minBedrooms) {
      list = list.filter(p => p.bedrooms >= filters.minBedrooms!);
    }
    if (filters.minBathrooms) {
      list = list.filter(p => p.bathrooms >= filters.minBathrooms!);
    }
    if (filters.hasPool) {
      list = list.filter(p => p.has_pool);
    }
    if (filters.hasGarage) {
      list = list.filter(p => p.garage_spaces > 0);
    }
    if (filters.isVaEligible) {
      list = list.filter(p => p.is_va_eligible);
    }
    if (filters.isFixerUpper) {
      list = list.filter(p => p.is_fixer_upper);
    }
  }
  return list;
}

export async function getPropertiesPaginated(options: PropertyQueryFilters & { page?: number; pageSize?: number }) {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.max(1, options.pageSize || 10);
  const all = await getProperties(options);
  const total = all.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const paginated = all.slice(startIndex, startIndex + pageSize);

  return {
    properties: paginated,
    total,
    page,
    pageSize,
    totalPages
  };
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  const supabase = getSupabaseAdmin() || getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
      if (!error && data) return data as Property;
    } catch (e) {
      console.warn('Supabase query error for property ID:', e);
    }
  }
  return runtimeProperties.find(p => p.id === id);
}

export async function getPropertyBySlug(slug: string, options?: { allowUnpublished?: boolean }): Promise<Property | undefined> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('properties').select('*').eq('slug', slug);
      if (!options?.allowUnpublished) {
        query = query.eq('publication_status', 'published').is('deleted_at', null);
      }
      const { data, error } = await query.single();
      if (!error && data) {
        // Increment view count asynchronously
        void supabase.rpc('increment_property_views', { property_id: data.id });
        return data as Property;
      }
    } catch (e) {
      console.warn('Supabase query error:', e);
    }
  }

  const prop = runtimeProperties.find(p => p.slug === slug);
  if (!prop) return undefined;
  if (!options?.allowUnpublished && (prop.publication_status !== 'published' || prop.deleted_at)) {
    return undefined; // Public visitors cannot access draft, archived, or deleted properties
  }

  // Increment local view count
  prop.view_count = (prop.view_count || 0) + 1;
  return prop;
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const all = await getProperties({ includeUnpublished: false });
  return all.filter(p => p.is_featured);
}

// -------------------------------------------------------------
// PROPERTY MANAGEMENT & MUTATION WORKFLOWS
// -------------------------------------------------------------

export async function createProperty(
  data: Partial<Property>, 
  actorEmail: string = 'edgar@yourrealtoredgar.com'
): Promise<{ success: boolean; property: Property; error?: string }> {
  if (!data.title || data.title.trim().length < 3) {
    return { success: false, property: {} as Property, error: 'Property title must be at least 3 characters long.' };
  }
  if (!data.price || data.price <= 0) {
    return { success: false, property: {} as Property, error: 'Asking price must be greater than zero.' };
  }

  const id = data.id || `p${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  let baseSlug = slugify(data.slug || data.title);
  let finalSlug = baseSlug;
  let counter = 1;
  while (runtimeProperties.some(p => p.slug === finalSlug && p.id !== id)) {
    finalSlug = `${baseSlug}-${counter++}`;
  }

  const newProperty: Property = {
    id,
    slug: finalSlug,
    title: data.title.trim(),
    tagline: data.tagline?.trim() || '',
    property_type: data.property_type || 'Single Family',
    status: data.status || 'draft',
    listing_status: data.listing_status || 'for_sale',
    publication_status: data.publication_status || 'draft',
    price: Number(data.price),
    currency: data.currency || 'USD',
    original_price: data.original_price ? Number(data.original_price) : undefined,
    previous_price: data.previous_price ? Number(data.previous_price) : undefined,
    bedrooms: Number(data.bedrooms ?? 3),
    bathrooms: Number(data.bathrooms ?? 2.0),
    square_feet: Number(data.square_feet ?? 1500),
    lot_size_sqft: data.lot_size_sqft ? Number(data.lot_size_sqft) : undefined,
    lot_size_unit: data.lot_size_unit || 'sqft',
    year_built: data.year_built ? Number(data.year_built) : new Date().getFullYear(),
    garage_spaces: Number(data.garage_spaces ?? 2),
    parking_spaces: Number(data.parking_spaces ?? 2),
    has_pool: Boolean(data.has_pool),
    has_spa: Boolean(data.has_spa),
    is_featured: Boolean(data.is_featured),
    is_va_eligible: data.is_va_eligible !== undefined ? Boolean(data.is_va_eligible) : true,
    is_fixer_upper: Boolean(data.is_fixer_upper),
    renovation_status: data.renovation_status || 'updated',
    arv_estimate: data.arv_estimate ? Number(data.arv_estimate) : undefined,
    address_street: data.address_street?.trim() || '123 Main St',
    address_unit: data.address_unit?.trim() || '',
    address_city: data.address_city?.trim() || 'San Diego',
    address_state: data.address_state?.trim() || 'CA',
    address_zip: data.address_zip?.trim() || '92101',
    address_country: data.address_country || 'USA',
    address_visibility: data.address_visibility || 'full',
    neighborhood: data.neighborhood?.trim() || 'Downtown',
    latitude: data.latitude ? Number(data.latitude) : 32.7157,
    longitude: data.longitude ? Number(data.longitude) : -117.1611,
    description: data.description?.trim() || 'Stunning San Diego property.',
    features: Array.isArray(data.features) ? data.features : [],
    amenities: Array.isArray(data.amenities) ? data.amenities : [],
    hoa_fee_monthly: Number(data.hoa_fee_monthly ?? 0),
    hoa_fee_frequency: data.hoa_fee_frequency || 'monthly',
    property_tax_rate: Number(data.property_tax_rate ?? 1.25),
    virtual_tour_url: data.virtual_tour_url?.trim() || '',
    video_url: data.video_url?.trim() || '',
    mls_number: data.mls_number?.trim() || `SD26-${Math.floor(10000 + Math.random() * 90000)}`,
    primary_image: data.primary_image || (data.gallery_images && data.gallery_images[0]) || '/images/properties/north-park-spanish.svg',
    gallery_images: data.gallery_images && data.gallery_images.length > 0 ? data.gallery_images : ['/images/properties/north-park-spanish.svg'],
    media: data.media || [],
    view_count: 0,
    inquiries_count: 0,
    seo_title: data.seo_title || `${data.title} | Edgar Valle Realtor`,
    seo_description: data.seo_description || `Offered at $${Number(data.price).toLocaleString()} in ${data.neighborhood || 'San Diego'}.`,
    og_image: data.og_image || data.primary_image || '/images/branding/og-preview.png',
    is_indexable: data.is_indexable !== undefined ? Boolean(data.is_indexable) : true,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // 1. Try Supabase
  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      const { data: dbData, error } = await adminClient.from('properties').insert(newProperty).select('*').single();
      if (!error && dbData) {
        runtimeProperties.unshift(dbData as Property);
        await logAuditEvent({
          actor_email: actorEmail,
          action: 'create_property',
          entity_type: 'property',
          entity_id: dbData.id,
          details: { title: newProperty.title, price: newProperty.price, status: newProperty.publication_status }
        });
        return { success: true, property: dbData as Property };
      }
    } catch (e) {
      console.warn('Supabase create property error, fallback to runtime:', e);
    }
  }

  // 2. Local fallback
  runtimeProperties.unshift(newProperty);
  await logAuditEvent({
    actor_email: actorEmail,
    action: 'create_property',
    entity_type: 'property',
    entity_id: newProperty.id,
    details: { title: newProperty.title, price: newProperty.price, status: newProperty.publication_status }
  });

  return { success: true, property: newProperty };
}

export async function updateProperty(
  id: string, 
  updates: Partial<Property>, 
  actorEmail: string = 'edgar@yourrealtoredgar.com'
): Promise<{ success: boolean; property?: Property; error?: string }> {
  const existing = runtimeProperties.find(p => p.id === id);
  if (!existing) {
    return { success: false, error: 'Property not found.' };
  }

  // Track price change for previous_price
  let previousPrice = existing.previous_price;
  if (updates.price && Number(updates.price) !== existing.price) {
    previousPrice = existing.price;
    await logAuditEvent({
      actor_email: actorEmail,
      action: 'update_price',
      entity_type: 'property',
      entity_id: id,
      details: { old_price: existing.price, new_price: updates.price, title: existing.title }
    });
  }

  // Handle unique slug updates
  let newSlug = existing.slug;
  if (updates.slug && updates.slug !== existing.slug) {
    const candidateSlug = slugify(updates.slug);
    if (!runtimeProperties.some(p => p.slug === candidateSlug && p.id !== id)) {
      newSlug = candidateSlug;
    }
  }

  const updatedProperty: Property = {
    ...existing,
    ...updates,
    slug: newSlug,
    previous_price: previousPrice,
    updated_at: new Date().toISOString()
  };

  // 1. Try Supabase
  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      const { data: dbData, error } = await adminClient.from('properties').update(updatedProperty).eq('id', id).select('*').single();
      if (!error && dbData) {
        const idx = runtimeProperties.findIndex(p => p.id === id);
        if (idx !== -1) runtimeProperties[idx] = dbData as Property;
        await logAuditEvent({
          actor_email: actorEmail,
          action: 'update_property',
          entity_type: 'property',
          entity_id: id,
          details: { updates, title: updatedProperty.title }
        });
        return { success: true, property: dbData as Property };
      }
    } catch (e) {
      console.warn('Supabase update property error, fallback to runtime:', e);
    }
  }

  // 2. Local fallback
  const idx = runtimeProperties.findIndex(p => p.id === id);
  if (idx !== -1) runtimeProperties[idx] = updatedProperty;

  await logAuditEvent({
    actor_email: actorEmail,
    action: 'update_property',
    entity_type: 'property',
    entity_id: id,
    details: { title: updatedProperty.title, publication_status: updatedProperty.publication_status }
  });

  return { success: true, property: updatedProperty };
}

export async function duplicateProperty(
  id: string, 
  actorEmail: string = 'edgar@yourrealtoredgar.com'
): Promise<{ success: boolean; property?: Property; error?: string }> {
  const source = runtimeProperties.find(p => p.id === id);
  if (!source) {
    return { success: false, error: 'Source listing not found to duplicate.' };
  }

  const newId = `p${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const copySuffix = Math.random().toString(36).substring(2, 6);
  const newTitle = `${source.title} (Draft Copy)`;
  const newSlug = `${source.slug}-copy-${copySuffix}`;

  const cloned: Property = {
    ...source,
    id: newId,
    title: newTitle,
    slug: newSlug,
    publication_status: 'draft',
    status: 'draft',
    view_count: 0,
    inquiries_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  runtimeProperties.unshift(cloned);

  await logAuditEvent({
    actor_email: actorEmail,
    action: 'duplicate_property',
    entity_type: 'property',
    entity_id: newId,
    details: { source_id: id, new_title: newTitle }
  });

  return { success: true, property: cloned };
}

export async function publishProperty(id: string, actorEmail: string = 'edgar@yourrealtoredgar.com'): Promise<boolean> {
  const result = await updateProperty(id, { publication_status: 'published', status: 'active' }, actorEmail);
  if (result.success) {
    await logAuditEvent({
      actor_email: actorEmail,
      action: 'publish_property',
      entity_type: 'property',
      entity_id: id,
      details: { status: 'published' }
    });
    return true;
  }
  return false;
}

export async function unpublishProperty(id: string, actorEmail: string = 'edgar@yourrealtoredgar.com'): Promise<boolean> {
  const result = await updateProperty(id, { publication_status: 'draft', status: 'draft' }, actorEmail);
  if (result.success) {
    await logAuditEvent({
      actor_email: actorEmail,
      action: 'unpublish_property',
      entity_type: 'property',
      entity_id: id,
      details: { status: 'draft' }
    });
    return true;
  }
  return false;
}

export async function archiveProperty(id: string, actorEmail: string = 'edgar@yourrealtoredgar.com'): Promise<boolean> {
  const result = await updateProperty(id, { publication_status: 'archived' }, actorEmail);
  if (result.success) {
    await logAuditEvent({
      actor_email: actorEmail,
      action: 'archive_property',
      entity_type: 'property',
      entity_id: id,
      details: { status: 'archived' }
    });
    return true;
  }
  return false;
}

export async function unarchiveProperty(id: string, actorEmail: string = 'edgar@yourrealtoredgar.com'): Promise<boolean> {
  const result = await updateProperty(id, { publication_status: 'draft' }, actorEmail);
  if (result.success) {
    await logAuditEvent({
      actor_email: actorEmail,
      action: 'unarchive_property',
      entity_type: 'property',
      entity_id: id,
      details: { status: 'draft' }
    });
    return true;
  }
  return false;
}

export async function deleteProperty(
  id: string, 
  softDelete: boolean = true, 
  actorEmail: string = 'edgar@yourrealtoredgar.com'
): Promise<boolean> {
  const prop = runtimeProperties.find(p => p.id === id);
  if (!prop) return false;

  if (softDelete) {
    // Preserve historical data for reporting as required!
    prop.deleted_at = new Date().toISOString();
    prop.publication_status = 'archived';
  } else {
    runtimeProperties = runtimeProperties.filter(p => p.id !== id);
  }

  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      if (softDelete) {
        await adminClient.from('properties').update({ deleted_at: new Date().toISOString(), publication_status: 'archived' }).eq('id', id);
      } else {
        await adminClient.from('properties').delete().eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  }

  await logAuditEvent({
    actor_email: actorEmail,
    action: 'delete_property',
    entity_type: 'property',
    entity_id: id,
    details: { soft_delete: softDelete, title: prop.title }
  });

  return true;
}

// -------------------------------------------------------------
// MEDIA MANAGEMENT WORKFLOWS
// -------------------------------------------------------------

export async function addPropertyMedia(
  propertyId: string, 
  mediaData: Omit<PropertyMedia, 'id' | 'property_id' | 'created_at'>
): Promise<PropertyMedia> {
  const prop = runtimeProperties.find(p => p.id === propertyId);
  const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newMedia: PropertyMedia = {
    id: mediaId,
    property_id: propertyId,
    created_at: new Date().toISOString(),
    ...mediaData
  };

  if (prop) {
    if (!prop.media) prop.media = [];
    if (newMedia.is_primary) {
      prop.media.forEach(m => m.is_primary = false);
      prop.primary_image = newMedia.url;
    }
    prop.media.push(newMedia);
    if (!prop.gallery_images) prop.gallery_images = [];
    prop.gallery_images.push(newMedia.url);
  }

  return newMedia;
}

export async function removePropertyMedia(propertyId: string, mediaId: string): Promise<boolean> {
  const prop = runtimeProperties.find(p => p.id === propertyId);
  if (!prop || !prop.media) return false;

  prop.media = prop.media.filter(m => m.id !== mediaId);
  prop.gallery_images = prop.media.map(m => m.url);
  if (prop.media.length > 0 && !prop.media.some(m => m.is_primary)) {
    prop.media[0].is_primary = true;
    prop.primary_image = prop.media[0].url;
  }
  return true;
}

export async function setCoverMedia(propertyId: string, mediaId: string): Promise<boolean> {
  const prop = runtimeProperties.find(p => p.id === propertyId);
  if (!prop || !prop.media) return false;

  const target = prop.media.find(m => m.id === mediaId);
  if (!target) return false;

  prop.media.forEach(m => m.is_primary = (m.id === mediaId));
  prop.primary_image = target.url;
  return true;
}

export async function reorderPropertyMedia(propertyId: string, mediaIdsInOrder: string[]): Promise<boolean> {
  const prop = runtimeProperties.find(p => p.id === propertyId);
  if (!prop || !prop.media) return false;

  const reordered: PropertyMedia[] = [];
  mediaIdsInOrder.forEach((id, index) => {
    const item = prop.media!.find(m => m.id === id);
    if (item) {
      item.display_order = index + 1;
      reordered.push(item);
    }
  });

  prop.media = reordered;
  prop.gallery_images = reordered.map(m => m.url);
  return true;
}

// -------------------------------------------------------------
// AUDIT LOGGING & ANALYTICS STATS
// -------------------------------------------------------------

export async function getAuditLogs(limit: number = 25): Promise<AuditLog[]> {
  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      const { data, error } = await adminClient.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
      if (!error && data) return data as AuditLog[];
    } catch (e) {
      console.warn('Supabase audit logs fetch error:', e);
    }
  }
  return runtimeAuditLogs.slice(0, limit);
}

export async function logAuditEvent(event: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
  const entry: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
    ...event
  };

  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      await adminClient.from('audit_logs').insert(entry);
    } catch (e) {
      console.warn('Supabase audit log insert error:', e);
    }
  }

  runtimeAuditLogs.unshift(entry);
}

export async function getPropertyStats() {
  const activeList = runtimeProperties.filter(p => !p.deleted_at);
  const total = activeList.length;
  const published = activeList.filter(p => p.publication_status === 'published').length;
  const draft = activeList.filter(p => p.publication_status === 'draft').length;
  const pending = activeList.filter(p => p.listing_status === 'pending').length;
  const archived = activeList.filter(p => p.publication_status === 'archived').length;
  const totalVolume = activeList
    .filter(p => p.publication_status === 'published')
    .reduce((sum, p) => sum + p.price, 0);
  const totalViews = activeList.reduce((sum, p) => sum + (p.view_count || 0), 0);
  const totalInquiries = activeList.reduce((sum, p) => sum + (p.inquiries_count || 0), 0);

  return {
    total,
    published,
    draft,
    pending,
    archived,
    totalVolume,
    totalViews,
    totalInquiries
  };
}

// -------------------------------------------------------------
// OPEN HOUSES, NEIGHBORHOODS, BLOG & LEADS
// -------------------------------------------------------------

export async function getOpenHouses(): Promise<OpenHouse[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('open_houses').select('*, property:properties(*)').eq('is_cancelled', false);
      if (!error && data && data.length > 0) return data as OpenHouse[];
    } catch (e) {
      console.warn('Supabase query error for open houses:', e);
    }
  }
  return INITIAL_OPEN_HOUSES;
}

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  return INITIAL_NEIGHBORHOODS;
}

export async function getNeighborhoodBySlug(slug: string): Promise<Neighborhood | undefined> {
  return INITIAL_NEIGHBORHOODS.find(n => n.slug === slug);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return INITIAL_BLOG_POSTS;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return INITIAL_BLOG_POSTS.find(b => b.slug === slug);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return SITE_SETTINGS;
}

// Leads management
export async function submitLead(leadInput: Omit<Lead, 'id' | 'created_at' | 'status'>): Promise<{ success: boolean; leadId: string }> {
  const newLead: Lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...leadInput,
    status: 'new',
    created_at: new Date().toISOString()
  };

  // If associated with a property, increment property inquiries_count
  if (newLead.property_id) {
    const prop = runtimeProperties.find(p => p.id === newLead.property_id);
    if (prop) prop.inquiries_count = (prop.inquiries_count || 0) + 1;
  }

  // 1. Try Supabase persistence first
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('leads').insert({
        full_name: newLead.full_name,
        email: newLead.email,
        phone: newLead.phone,
        lead_type: newLead.lead_type,
        message: newLead.message,
        preferred_contact_method: newLead.preferred_contact_method,
        property_id: newLead.property_id || null,
        property_address: newLead.property_address,
        estimated_budget: newLead.estimated_budget,
        timeframe: newLead.timeframe,
        is_preapproved: newLead.is_preapproved,
        language_preference: newLead.language_preference,
        status: 'new',
        ip_address: newLead.ip_address,
        user_agent: newLead.user_agent
      }).select('id').single();

      if (!error && data) {
        runtimeLeads.unshift({ ...newLead, id: data.id });
        return { success: true, leadId: data.id };
      }
    } catch (e) {
      console.warn('Supabase lead insert failed, persisting to store fallback:', e);
    }
  }

  // 2. Persist to local runtime store
  runtimeLeads.unshift(newLead);
  return { success: true, leadId: newLead.id };
}

export async function getAllLeads(): Promise<Lead[]> {
  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      const { data, error } = await adminClient.from('leads').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Lead[];
    } catch (e) {
      console.warn('Supabase admin leads fetch error:', e);
    }
  }
  return runtimeLeads;
}

export async function getLeadById(id: string): Promise<Lead | undefined> {
  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      const { data, error } = await adminClient.from('leads').select('*').eq('id', id).single();
      if (!error && data) return data as Lead;
    } catch (e) {
      console.warn('Supabase getLeadById fallback:', e);
    }
  }
  return runtimeLeads.find(l => l.id === id);
}

export async function updateLeadStatus(
  leadId: string, 
  status: Lead['status'], 
  adminNotes?: string,
  actorEmail: string = 'edgar@yourrealtoredgar.com'
): Promise<boolean> {
  return updateLead(leadId, { status, admin_notes: adminNotes }, actorEmail);
}

export async function updateLead(
  leadId: string, 
  updates: Partial<Lead>, 
  actorEmail: string = 'edgar@yourrealtoredgar.com'
): Promise<boolean> {
  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      await adminClient.from('leads').update({
        ...updates,
        updated_at: new Date().toISOString()
      }).eq('id', leadId);
    } catch (e) {
      console.warn('Supabase lead update error:', e);
    }
  }

  const localLead = runtimeLeads.find(l => l.id === leadId);
  if (localLead) {
    Object.assign(localLead, updates, { updated_at: new Date().toISOString() });

    await logAuditEvent({
      actor_email: actorEmail,
      action: 'update_lead',
      entity_type: 'lead',
      entity_id: leadId,
      details: updates
    });

    return true;
  }
  return false;
}

export async function addLeadNote(
  leadId: string, 
  note: string, 
  authorEmail: string = 'edgar@yourrealtoredgar.com'
): Promise<{ success: boolean; note?: LeadNote }> {
  const newNote: LeadNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    lead_id: leadId,
    author_email: authorEmail,
    note: note.trim(),
    created_at: new Date().toISOString()
  };

  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      await adminClient.from('lead_notes').insert(newNote);
    } catch (e) {
      console.warn('Supabase lead note insert error:', e);
    }
  }

  const lead = runtimeLeads.find(l => l.id === leadId);
  if (lead) {
    if (!lead.notes) lead.notes = [];
    lead.notes.unshift(newNote);

    await logAuditEvent({
      actor_email: authorEmail,
      action: 'add_lead_note',
      entity_type: 'lead',
      entity_id: leadId,
      details: { note_id: newNote.id }
    });

    return { success: true, note: newNote };
  }

  return { success: false };
}

export async function getLeadNotes(leadId: string): Promise<LeadNote[]> {
  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      const { data, error } = await adminClient.from('lead_notes').select('*').eq('lead_id', leadId).order('created_at', { ascending: false });
      if (!error && data) return data as LeadNote[];
    } catch (e) {
      console.warn('Supabase getLeadNotes fallback:', e);
    }
  }

  const lead = runtimeLeads.find(l => l.id === leadId);
  return lead?.notes || [];
}

export async function deleteLead(leadId: string, actorEmail: string = 'edgar@yourrealtoredgar.com'): Promise<boolean> {
  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      await adminClient.from('leads').delete().eq('id', leadId);
    } catch (e) {
      console.warn('Supabase delete lead error:', e);
    }
  }

  const idx = runtimeLeads.findIndex(l => l.id === leadId);
  if (idx !== -1) {
    runtimeLeads.splice(idx, 1);
    await logAuditEvent({
      actor_email: actorEmail,
      action: 'delete_lead',
      entity_type: 'lead',
      entity_id: leadId
    });
    return true;
  }
  return false;
}
