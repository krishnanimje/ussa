// Data repository layer with Supabase integration and resilient fallback
import { getSupabase, getSupabaseAdmin } from './supabase';
import type { 
  Property, 
  OpenHouse, 
  Neighborhood, 
  BlogPost, 
  SiteSettings, 
  Lead
} from './types';

// Seed data constants representing Edgar Valle's San Diego listings & specialties
export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'p0000000-0000-0000-0000-000000000001',
    slug: 'north-park-spanish-revival',
    title: 'Restored Spanish Revival with Courtyard & ADU Potential',
    tagline: 'Timeless San Diego character with modern bespoke renovations in vibrant North Park',
    property_type: 'Single Family',
    status: 'open_house',
    price: 1185000,
    original_price: 1225000,
    bedrooms: 3,
    bathrooms: 2.0,
    square_feet: 1740,
    lot_size_sqft: 5200,
    year_built: 1932,
    garage_spaces: 2,
    has_pool: false,
    is_featured: true,
    is_va_eligible: true,
    is_fixer_upper: false,
    address_street: '3428 Herman Ave',
    address_city: 'San Diego',
    address_state: 'CA',
    address_zip: '92104',
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
    hoa_fee_monthly: 0,
    property_tax_rate: 1.22,
    mls_number: 'SD26-90412',
    primary_image: '/images/properties/north-park-spanish.svg',
    gallery_images: [
      '/images/properties/north-park-spanish.svg',
      '/images/properties/interior-living.svg',
      '/images/properties/kitchen-luxury.svg',
      '/images/properties/courtyard-patio.svg'
    ],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'p0000000-0000-0000-0000-000000000002',
    slug: 'pacific-beach-coastal-condo',
    title: 'Modern Coastal Condo with Private Sunset Balcony',
    tagline: 'Blocks from Sail Bay and the Pacific surf with resort-style amenities',
    property_type: 'Condo',
    status: 'active',
    price: 895000,
    bedrooms: 2,
    bathrooms: 2.0,
    square_feet: 1150,
    year_built: 2018,
    garage_spaces: 2,
    has_pool: true,
    is_featured: true,
    is_va_eligible: true,
    is_fixer_upper: false,
    address_street: '1245 Pacific Beach Dr #3B',
    address_city: 'San Diego',
    address_state: 'CA',
    address_zip: '92109',
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
    hoa_fee_monthly: 420,
    property_tax_rate: 1.18,
    mls_number: 'SD26-88104',
    primary_image: '/images/properties/pacific-beach-condo.svg',
    gallery_images: [
      '/images/properties/pacific-beach-condo.svg',
      '/images/properties/interior-living.svg',
      '/images/properties/pool-resort.svg'
    ],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'p0000000-0000-0000-0000-000000000003',
    slug: 'eastlake-greens-chula-vista-pool-home',
    title: 'Luxury Chula Vista Estate with Heated Pool & 3-Car Garage',
    tagline: 'Suburban paradise with resort backyard, custom rock waterfall pool, and owned solar',
    property_type: 'Single Family',
    status: 'active',
    price: 975000,
    bedrooms: 4,
    bathrooms: 3.0,
    square_feet: 2580,
    lot_size_sqft: 7850,
    year_built: 2004,
    garage_spaces: 3,
    has_pool: true,
    is_featured: true,
    is_va_eligible: true,
    is_fixer_upper: false,
    address_street: '2184 Greensview Dr',
    address_city: 'Chula Vista',
    address_state: 'CA',
    address_zip: '91915',
    neighborhood: 'Chula Vista',
    latitude: 32.6394,
    longitude: -116.9421,
    description: 'A true entertainer paradise in Eastlake Greens! This spacious 4-bedroom executive home features an open concept floor plan, dramatic high vaulted ceilings, and a backyard oasis that rivals a five-star resort. Enjoy your pebble-finish heated pool with elevated spa and stone waterfall, covered outdoor kitchen with built-in BBQ, and full synthetic turf lawn. Fully owned 9.8kW solar system dramatically reduces electric bills.',
    features: [
      'Custom Heated Pool & Spa',
      '3-Car Tandem Garage',
      'Owned 9.8kW Solar Panels',
      'Outdoor Kitchen with Built-in Grill',
      'Vaulted Ceilings',
      'Top-Rated Eastlake Schools',
      'Downstairs Bedroom & Full Bath'
    ],
    hoa_fee_monthly: 115,
    property_tax_rate: 1.28,
    mls_number: 'CV26-44219',
    primary_image: '/images/properties/chula-vista-pool.svg',
    gallery_images: [
      '/images/properties/chula-vista-pool.svg',
      '/images/properties/pool-resort.svg',
      '/images/properties/kitchen-luxury.svg'
    ],
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'p0000000-0000-0000-0000-000000000004',
    slug: 'oceanside-va-friendly-turnkey-ranch',
    title: 'Turnkey Oceanside Single-Story Near Camp Pendleton',
    tagline: 'Zero-down VA loan approved, spacious RV parking, and expansive private yard',
    property_type: 'Single Family',
    status: 'active',
    price: 765000,
    original_price: 780000,
    bedrooms: 3,
    bathrooms: 2.0,
    square_feet: 1520,
    lot_size_sqft: 6800,
    year_built: 1986,
    garage_spaces: 2,
    has_pool: false,
    is_featured: true,
    is_va_eligible: true,
    is_fixer_upper: false,
    address_street: '4120 Calle Ariane',
    address_city: 'Oceanside',
    address_state: 'CA',
    address_zip: '92057',
    neighborhood: 'Oceanside',
    latitude: 33.2281,
    longitude: -117.3195,
    description: 'Tailored for our active military families and first-time buyers! Located just 12 minutes to Camp Pendleton Main Gate and San Luis Rey bike trail to the beach. Completely remodeled with new dual-pane vinyl windows, energy-efficient HVAC with smart thermostat, fresh interior/exterior paint, and brand new shaker kitchen with stainless appliance package. Gated side yard provides dedicated RV/boat parking with no HOA or Mello-Roos.',
    features: [
      '100% VA Loan Approved',
      '12 Min to Camp Pendleton',
      'Dedicated RV / Boat Parking',
      'No HOA & No Mello-Roos',
      'Brand New Kitchen & Appliances',
      'Large Fenced Backyard',
      'Single Story Living'
    ],
    hoa_fee_monthly: 0,
    property_tax_rate: 1.15,
    mls_number: 'OC26-31902',
    primary_image: '/images/properties/oceanside-ranch.svg',
    gallery_images: [
      '/images/properties/oceanside-ranch.svg',
      '/images/properties/interior-living.svg',
      '/images/properties/courtyard-patio.svg'
    ],
    created_at: new Date(Date.now() - 9 * 86400000).toISOString()
  },
  {
    id: 'p0000000-0000-0000-0000-000000000005',
    slug: 'clairemont-mesa-fixer-investor-opportunity',
    title: 'Prime Clairemont Fixer-Upper with Massive ARV Spread',
    tagline: 'High-upside investment opportunity on a flat 8,500 sq ft canyon-adjacent lot',
    property_type: 'Fixer-Upper',
    status: 'active',
    price: 699000,
    bedrooms: 3,
    bathrooms: 1.5,
    square_feet: 1380,
    lot_size_sqft: 8500,
    year_built: 1961,
    garage_spaces: 2,
    has_pool: false,
    is_featured: false,
    is_va_eligible: false,
    is_fixer_upper: true,
    arv_estimate: 985000,
    address_street: '4912 Mount Alifan Dr',
    address_city: 'San Diego',
    address_state: 'CA',
    address_zip: '92111',
    neighborhood: 'Clairemont',
    latitude: 32.8198,
    longitude: -117.1852,
    description: 'Investor special & fix-and-flip goldmine! Edgar Valle exclusive opportunity with solid bones and incredible upside. Property needs cosmetic rehab, kitchen/bath overhaul, and floor plan opening. Comps in the immediate half-mile radius for remodeled homes are commanding $975K - $1.05M. Expansive 8,500 sq ft flat lot allows for a simple 300 sq ft master suite expansion plus detached 1,000 sq ft ADU. Cash or hard money preferred.',
    features: [
      'Fix & Flip Potential',
      'Estimated ARV $985,000+',
      '8,500 Sq Ft Flat Lot',
      'Canyon-Adjacent Setting',
      'Zoned for SB9 / ADU Expansion',
      'Original Mid-Century Hardwoods',
      'High Investor Equity Spread'
    ],
    hoa_fee_monthly: 0,
    property_tax_rate: 1.20,
    mls_number: 'SD26-11984',
    primary_image: '/images/properties/clairemont-fixer.svg',
    gallery_images: [
      '/images/properties/clairemont-fixer.svg',
      '/images/properties/interior-living.svg'
    ],
    created_at: new Date(Date.now() - 11 * 86400000).toISOString()
  },
  {
    id: 'p0000000-0000-0000-0000-000000000006',
    slug: 'san-carlos-cowles-mountain-starter-home',
    title: 'Sunlit San Carlos Starter Home with Mountain Views',
    tagline: 'First-time homebuyer friendly with scenic trail access and mature fruit trees',
    property_type: 'Single Family',
    status: 'pending',
    price: 749000,
    bedrooms: 3,
    bathrooms: 2.0,
    square_feet: 1410,
    lot_size_sqft: 6200,
    year_built: 1974,
    garage_spaces: 2,
    has_pool: false,
    is_featured: false,
    is_va_eligible: true,
    is_fixer_upper: false,
    address_street: '7815 Lake Adlon Dr',
    address_city: 'San Diego',
    address_state: 'CA',
    address_zip: '92119',
    neighborhood: 'San Carlos',
    latitude: 32.8021,
    longitude: -117.0392,
    description: 'Under contract in 6 days! This delightful single-level home offers panoramic morning views of Cowles Mountain. Featuring an updated kitchen with solid maple cabinets, remodeled guest bath, double-pane low-E windows, and a shaded pergola patio surrounded by producing Meyer lemon and Haas avocado trees. Ideal for first-time buyers looking for peaceful suburban stability with quick access to Mission Trails Regional Park.',
    features: [
      'Cowles Mountain Views',
      'Walk to Mission Trails Park',
      'Under Contract in 6 Days',
      'Producing Avocado & Citrus Trees',
      'Dual Pane Windows',
      'Quiet Cul-de-Sac Street'
    ],
    hoa_fee_monthly: 0,
    property_tax_rate: 1.19,
    mls_number: 'SD26-77312',
    primary_image: '/images/properties/san-carlos-home.svg',
    gallery_images: [
      '/images/properties/san-carlos-home.svg',
      '/images/properties/interior-living.svg'
    ],
    created_at: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'p0000000-0000-0000-0000-000000000007',
    slug: 'la-jolla-village-contemporary-townhome',
    title: 'Architectural Contemporary Townhome Near Windansea',
    tagline: 'Steps to the La Jolla shoreline with private rooftop deck and ocean breezes',
    property_type: 'Townhome',
    status: 'active',
    price: 1650000,
    bedrooms: 3,
    bathrooms: 2.5,
    square_feet: 1980,
    year_built: 2016,
    garage_spaces: 2,
    has_pool: false,
    is_featured: true,
    is_va_eligible: true,
    is_fixer_upper: false,
    address_street: '7435 Draper Ave #2',
    address_city: 'La Jolla',
    address_state: 'CA',
    address_zip: '92037',
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
    hoa_fee_monthly: 310,
    property_tax_rate: 1.16,
    mls_number: 'LJ26-99214',
    primary_image: '/images/properties/la-jolla-townhome.svg',
    gallery_images: [
      '/images/properties/la-jolla-townhome.svg',
      '/images/properties/kitchen-luxury.svg',
      '/images/properties/courtyard-patio.svg'
    ],
    created_at: new Date(Date.now() - 18 * 86400000).toISOString()
  },
  {
    id: 'p0000000-0000-0000-0000-000000000008',
    slug: 'golden-hill-multi-family-duplex',
    title: 'Income Generating Golden Hill Duplex with Downtown Skyline Views',
    tagline: 'Two detached residences on one lot with high cash-flow potential',
    property_type: 'Multi-Family',
    status: 'active',
    price: 1350000,
    bedrooms: 4,
    bathrooms: 3.0,
    square_feet: 2240,
    lot_size_sqft: 5500,
    year_built: 1928,
    garage_spaces: 2,
    has_pool: false,
    is_featured: false,
    is_va_eligible: true,
    is_fixer_upper: false,
    address_street: '2418 B Street',
    address_city: 'San Diego',
    address_state: 'CA',
    address_zip: '92102',
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
    hoa_fee_monthly: 0,
    property_tax_rate: 1.21,
    mls_number: 'SD26-62019',
    primary_image: '/images/properties/golden-hill-duplex.svg',
    gallery_images: [
      '/images/properties/golden-hill-duplex.svg',
      '/images/properties/interior-living.svg'
    ],
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  }
];

export const INITIAL_OPEN_HOUSES: OpenHouse[] = [
  {
    id: 'oh000000-0000-0000-0000-000000000001',
    property_id: 'p0000000-0000-0000-0000-000000000001',
    property: INITIAL_PROPERTIES[0],
    start_time: '2026-10-24T13:00:00-07:00',
    end_time: '2026-10-24T16:00:00-07:00',
    host_name: 'Edgar Valle',
    refreshments_provided: true,
    special_instructions: 'Saturday Open House: Hosted personally by Edgar Valle. Espresso bar and artisan pastries served in the courtyard. All buyers and brokers welcome!',
    is_cancelled: false
  },
  {
    id: 'oh000000-0000-0000-0000-000000000002',
    property_id: 'p0000000-0000-0000-0000-000000000001',
    property: INITIAL_PROPERTIES[0],
    start_time: '2026-10-25T13:00:00-07:00',
    end_time: '2026-10-25T16:00:00-07:00',
    host_name: 'Edgar Valle',
    refreshments_provided: true,
    special_instructions: 'Sunday Twilight Tour: Sunset refreshments and property walkthrough. Ask Edgar about the pre-plumbed ADU plans & construction estimates.',
    is_cancelled: false
  },
  {
    id: 'oh000000-0000-0000-0000-000000000003',
    property_id: 'p0000000-0000-0000-0000-000000000003',
    property: INITIAL_PROPERTIES[2],
    start_time: '2026-10-24T12:00:00-07:00',
    end_time: '2026-10-24T15:00:00-07:00',
    host_name: 'Edgar Valle',
    refreshments_provided: true,
    special_instructions: 'Eastlake Greens Pool Tour: Tour this immaculate backyard oasis. Cold drinks and poolside refreshments provided.',
    is_cancelled: false
  }
];

export const INITIAL_NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'n0000000-0000-0000-0000-000000000001',
    slug: 'north-park',
    name: 'North Park',
    tagline: 'Historic Charm Meets Urban Energy',
    summary: 'Known for its tree-lined streets of 1920s Craftsman bungalows, craft breweries, art galleries, and vibrant dining along University Ave and 30th Street. A top choice for buyers seeking urban walkability and historic architecture.',
    median_home_price: 1120000,
    vibe: 'Eclectic, Walkable, Historic & Trendy',
    commute_downtown_mins: 10,
    highlights: [
      'Top Walk Score in San Diego',
      'Historic Craftsman & Spanish Revival Architecture',
      'World-Class Craft Beer & Coffee Culture',
      'Bordering Balboa Park and Morley Field'
    ],
    hero_image: '/images/neighborhoods/north-park.svg'
  },
  {
    id: 'n0000000-0000-0000-0000-000000000002',
    slug: 'pacific-beach',
    name: 'Pacific Beach',
    tagline: 'Iconic California Beach Lifestyle',
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
    id: 'n0000000-0000-0000-0000-000000000003',
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
    id: 'n0000000-0000-0000-0000-000000000004',
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
    id: 'n0000000-0000-0000-0000-000000000005',
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
  languages: ['English', 'Spanish']
};

// In-memory runtime leads store (persists during process runtime; synced to Supabase when active)
const runtimeLeads: Lead[] = [
  {
    id: 'l0000000-0000-0000-0000-000000000001',
    full_name: 'Carlos & Sofia Mendez',
    email: 'carlos.mendez@example.com',
    phone: '(619) 555-7821',
    lead_type: 'first_time_buyer',
    message: 'We are looking for a 3-bedroom home in Chula Vista or Eastlake with a backyard. Pre-approved up to $950K.',
    preferred_contact_method: 'phone',
    estimated_budget: '$850k - $950k',
    timeframe: '1-3 months',
    is_preapproved: true,
    language_preference: 'es',
    status: 'new',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'l0000000-0000-0000-0000-000000000002',
    full_name: 'Sgt. Marcus Reynolds',
    email: 'reynolds.marcus@example.com',
    phone: '(760) 555-3419',
    lead_type: 'va_buyer',
    message: 'Stationed at Camp Pendleton. Relocating family and looking for a VA-eligible single family home in Oceanside.',
    preferred_contact_method: 'text',
    estimated_budget: '$750k - $800k',
    timeframe: 'Immediately',
    is_preapproved: true,
    language_preference: 'en',
    status: 'contacted',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

// Data access functions
export async function getProperties(filters?: {
  neighborhood?: string;
  propertyType?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  hasPool?: boolean;
  hasGarage?: boolean;
  isVaEligible?: boolean;
  isFixerUpper?: boolean;
}): Promise<Property[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('properties').select('*');
      if (filters?.neighborhood && filters.neighborhood !== 'all') {
        query = query.eq('neighborhood', filters.neighborhood);
      }
      if (filters?.propertyType && filters.propertyType !== 'all') {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
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
  let list = [...INITIAL_PROPERTIES];
  if (filters) {
    if (filters.neighborhood && filters.neighborhood !== 'all') {
      list = list.filter(p => p.neighborhood.toLowerCase() === filters.neighborhood!.toLowerCase());
    }
    if (filters.propertyType && filters.propertyType !== 'all') {
      list = list.filter(p => p.property_type === filters.propertyType);
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter(p => p.status === filters.status);
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

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('properties').select('*').eq('slug', slug).single();
      if (!error && data) return data as Property;
    } catch (e) {
      console.warn('Supabase query error:', e);
    }
  }
  return INITIAL_PROPERTIES.find(p => p.slug === slug);
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const all = await getProperties();
  return all.filter(p => p.is_featured);
}

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
        property_id: newLead.property_id,
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

export async function updateLeadStatus(leadId: string, status: Lead['status'], adminNotes?: string): Promise<boolean> {
  const adminClient = getSupabaseAdmin();
  if (adminClient) {
    try {
      await adminClient.from('leads').update({ status, admin_notes: adminNotes }).eq('id', leadId);
    } catch (e) {
      console.warn('Supabase lead update error:', e);
    }
  }

  const localLead = runtimeLeads.find(l => l.id === leadId);
  if (localLead) {
    localLead.status = status;
    if (adminNotes !== undefined) localLead.admin_notes = adminNotes;
    return true;
  }
  return false;
}
