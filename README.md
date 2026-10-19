# Edgar Valle | Realtor — San Diego Real Estate Platform, CMS & Business Intelligence

[![Astro](https://img.shields.io/badge/Astro-5.18-BC52EE.svg?style=flat&logo=astro)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20RLS-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com)
[![Vitest](https://img.shields.io/badge/Vitest-51%20Tests%20Passing-6E9F18.svg?style=flat&logo=vitest)](https://vitest.dev)
[![Power BI](https://img.shields.io/badge/Analytics-Power%20BI%20Engine-F2C811.svg?style=flat)](https://edgarvalle.com/admin/analytics)
[![SEO](https://img.shields.io/badge/SEO-7--Workstream%20Compliant-00C49F.svg?style=flat)](https://edgarvalle.com/sitemap.xml)

A complete, enterprise-grade real estate web application, property CMS, Business Intelligence CRM, and technical SEO architecture built for **Edgar Valle | Realtor** ([Full Circle Group](https://edgarvalle.com), **California DRE #02375273**) serving the San Diego, California real estate market.

Instagram: [@yourrealtoredgar](https://www.instagram.com/yourrealtoredgar/) • Direct: `(619) 555-0198` • Email: `edgar@yourrealtoredgar.com`

---

## 🌟 Architecture & System Scope

The platform integrates four comprehensive core tiers:

### 1. Public Marketing & Client Advisory Website (Master Prompt 01)
- **Verified Branding**: Edgar Valle, Full Circle Group, California DRE #02375273, San Diego County market.
- **Niche Specialties**:
  - **First-Time Homebuyers** (`/first-time-homebuyer` & `/es/primeros-compradores`): Low-down-payment navigation (FHA 3.5%, Conventional 3%), CalHFA grant assistance, credit repair, and 6-step roadmap.
  - **VA Military Loans** (`/va-loans`): Stationed across Camp Pendleton, Naval Base San Diego (32nd St), Naval Base Coronado, and MCAS Miramar. 0% down, $0 PMI, and San Diego BAH optimization.
  - **Fix-and-Flip & Investors** (`/fix-and-flip`): 70% underwriting rule ($MAO = [ARV \times 70\%] - \text{Rehab}$), off-market deal sourcing, and California SB9 ADU lot expansion.
- **Bilingual Service**: Full Spanish-language mirror (`/es/`, `/es/comprar`, `/es/vender`, `/es/contacto`).
- **Interactive Tools**: Real-time Mortgage Calculator (`/buy`) with VA funding fee calculations, property tax, HOA, and amortization schedules.
- **Community Guides**: Deep-dive neighborhood spotlights for North Park, La Jolla, Chula Vista, Mission Hills, Pacific Beach, and Downtown San Diego.
- **Regulatory Compliance**: Equal Housing Opportunity badge, DRE disclosures, Privacy Policy, Terms of Service, Cookie Policy, Accessibility Statement, and Brokerage Disclosures.

### 2. Protected Admin Dashboard & Property CMS (Master Prompt 02)
- **Inventory Management** (`/admin/properties`):
  - Searchable and filterable table displaying thumbnails, property IDs, asking prices & currencies, city/neighborhood display visibility, beds/baths, square footage, lot size with explicit units, listing status, publication status, created/updated dates, and analytics.
- **7-Tab Add/Edit Property Form** (`/admin/properties/new` & `/admin/properties/edit`):
  1. *Identity*: Title, automatic slug generation, property ID, property type, description, listing status, publication status.
  2. *Pricing*: Asking price, currency (`USD`, `MXN`, `EUR`), automated previous price comparison, verified HOA fees & frequency, and additional costs.
  3. *Location*: Street address, unit, city, state, ZIP, country, neighborhood, latitude & longitude, public address visibility toggle (`full` vs `neighborhood_only`), and map preview.
  4. *Property Details*: Beds, baths, sqft, lot size & unit, year built, parking spaces, garage, pool, spa, verified amenities checklist, and renovation status.
  5. *Media Manager*: Multi-photo dropzone with upload progress bar, one-click **Set Cover Image**, inline **Alt Text** editor for SEO/accessibility, reordering controls, and video tour link.
  6. *Open Houses*: Date, start time, end time, timezone, RSVP link, and automatic expiration of past events.
  7. *SEO & Social*: SEO title, meta description, Open Graph social-sharing image, search indexability toggle (`is_indexable`), and live Google SERP preview.
- **Workflows**:
  - Create Drafts without public exposure.
  - Authenticated **Admin Preview Mode** (`/properties/[slug]?preview=true`) with floating banner and 1-click **Publish Now** toggle.
  - **Duplicate Listing**: Generates draft clone with unique slug and reset analytics.
  - **Soft Deletion**: Preserves historical records for commission and reporting compliance while purging from active public search.
  - **Automatic Sitemap Exclusion**: Excludes drafts, archived, soft-deleted, and `is_indexable: false` listings from `/sitemap.xml`.

### 3. Business Intelligence, Power BI Analytics & CRM (Master Prompt 03)
- **Power BI Executive Dashboard** (`/admin/analytics`):
  - Global Date Range Filters: `Today`, `Yesterday`, `Last 7 Days`, `Last 30 Days`, `Last 90 Days`, and `Custom Range`.
  - 11 Power BI Executive KPIs with previous-period delta percentage and trend indicators.
  - Interactive SVG Charts: Traffic Trend Line Chart, Traffic-Source Breakdown, Lead Conversion Funnel (*Visitors &rarr; Views &rarr; Inquiries &rarr; Qualified &rarr; Appts &rarr; Closed*), CRM Status Distribution, and Device Categories (Mobile vs Desktop vs Tablet).
  - Most Viewed Properties ranking table and Top Landing Pages matrix.
  - **Accessible Table Alternative Toggle**: One-click toggle switching between visual charts and screen-reader accessible HTML data tables with full ARIA labeling.
  - **Metric Definitions & Disclosures Modal**: Transparent explanation of telemetry variances caused by ad blockers, Safari ITP, and DNT.
- **Privacy-Conscious Visitor Tracking** (`<AnalyticsTracker />` & `/api/analytics/track`):
  - Zero PII: strict server-side scrubbing of emails, phone numbers, and auth tokens.
  - Respects Do-Not-Track (`navigator.doNotTrack === '1'`).
  - High-performance non-blocking beacon dispatch via `navigator.sendBeacon()`.
- **CRM Workspace** (`/admin/leads`):
  - 8 Lifecycle Statuses: `New`, `Contacted`, `Qualified`, `Appointment Scheduled`, `In Progress`, `Converted`, `Lost`, and `Spam`.
  - Follow-up date reminders (*Overdue*, *Due Today*, *Upcoming*).
  - Direct Property Association links.
  - Slide-Over Lead Drawer with contact profile, UTM campaign tags, inline status changer, and **Confidential Internal Notes Thread** with author and timestamp audit trail.
- **Reports & CSV Export Center** (`/admin/reports` & `/api/admin/reports/export`):
  - **Spreadsheet Formula Injection Defense**: Sanitizes cells starting with formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) by prepending an apostrophe `'`, preventing macro/DDE attacks in Excel and Google Sheets.
  - 8 Authorized Reports: Property Inventory, Daily Traffic, Property Views vs. Inquiries, CRM Leads by Date, Conversion Funnel, Traffic Sources, Listing Performance, and Open House Inquiries.
- **Google Search Console Integration** (`src/lib/gsc.ts`):
  - Real configuration check; transparent status card with zero hallucinated ranking metrics when not configured.

### 4. Complete Seven-Workstream SEO Implementation (Master Prompt 04)
- **1. On-Page SEO**:
  - Unique titles and meta descriptions tailored to San Diego real estate intent.
  - Strict single H1 and clean H2/H3 semantic hierarchy across all pages.
  - Reusable `<Breadcrumbs />` component with Schema.org `BreadcrumbList` microdata.
  - Contextual internal linking between niche programs, neighborhood guides, and listings.
  - Full bidirectional `hreflang` alternates (`en`, `es`, `x-default`) on paired pages with matching `lang` attribute.
  - Open Graph and Twitter summary/large image cards.
- **2. Technical SEO**:
  - Dynamic, standards-compliant XML sitemap (`/sitemap.xml`) with `xmlns:xhtml` (hreflang alternates) and `xmlns:image` (high-res property imagery).
  - Excludes drafts, private `/admin/`, API endpoints, and non-indexable properties from the sitemap.
  - Hardened `robots.txt` blocking admin, APIs, and facet crawl bloat (`?search=*`, `?filter=*`, `?preview=*`).
  - Canonical 301 redirects (`/listings` &rarr; `/properties`, `/fthb` &rarr; `/first-time-homebuyer`, `/military` &rarr; `/va-loans`).
  - Strict `noindex, nofollow` on `/admin/*`, error pages (`404`, `500`), and draft listing previews.
- **3. Local SEO**:
  - Genuine San Diego County service-area targeting (North Park, La Jolla, Chula Vista, Mission Hills, Pacific Beach, Downtown). Zero doorway pages or fabricated addresses.
  - Verified Google Business Profile (GBP) optimization SOP with strict NAP consistency matching California DRE records.
- **4. Image and Video SEO**:
  - Responsive WebP images with explicit `width` and `height` to eliminate Cumulative Layout Shift (CLS).
  - Eager loading (`loading="eager" fetchpriority="high"`) for above-the-fold hero images; lazy loading for below-the-fold media.
  - 16:9 video embeds with Schema.org `VideoObject` structured data and transcripts.
- **5. Performance SEO**:
  - Core Web Vitals optimization targets: LCP &le; 2.5s, INP &le; 200ms, CLS &le; 0.1.
  - Zero heavy client-side JavaScript frameworks; native server-rendered Astro with CSS tokens.
- **6. Structured Data SEO**:
  - Fully validated JSON-LD schemas: `RealEstateAgent` (matching DRE #02375273 and Full Circle Group), `SingleFamilyResidence`/`Apartment`, `BreadcrumbList`, `Article`, `VideoObject`, `FAQPage`.
  - Zero fabricated reviews or aggregate star ratings.
- **7. Off-Page & Authority SEO**:
  - Tier-1 regulatory citation playbook (California DRE, SDAR, CAR, NAR).
  - Local authority link building, community sponsorship, and educational PR strategy.

---

## 🛠️ Technology Stack

- **Framework**: [Astro 5](https://astro.build) with **TypeScript strict mode** (`astro/tsconfigs/strict`).
- **Rendering & Server**: Modern hybrid SSR with `@astrojs/node` standalone adapter.
- **Styling**: Curated **Vanilla CSS design system** using design tokens (`tokens.css`, `global.css`, `admin.css`), CSS grid, flexbox, micro-animations, and responsive breakpoints. **Zero bloated UI frameworks or Next.js dependencies.**
- **Database & Storage**: [Supabase](https://supabase.com) PostgreSQL with **Row Level Security (RLS)**, storage bucket policies, automated audit triggers, and input sanitization (`validation.ts`). Includes a zero-downtime runtime repository fallback for development.
- **Testing**: [Vitest](https://vitest.dev) (44 automated tests across 7 test suites).

---

## 📁 Directory Structure

```text
├── .env.example                               # Environment variables template
├── astro.config.mjs                           # Astro configuration with Node adapter
├── package.json                               # Dependencies & scripts
├── tsconfig.json                              # Strict TypeScript compiler options
├── vitest.config.ts                           # Vitest test configuration
├── supabase/
│   └── migrations/
│       ├── 20261018000001_initial_schema.sql  # Properties, media, leads, open houses
│       ├── 20261018000002_rls_policies.sql    # Row Level Security policies
│       ├── 20261018000003_seed_data.sql       # Initial San Diego listings and articles
│       ├── 20261019000004_property_cms_extensions.sql # CMS extensions, storage, audit logs
│       └── 20261019000005_analytics_and_crm_bi.sql    # Analytics events, CRM statuses, rollups
├── public/
│   ├── favicon.svg                            # Monogram vector favicon
│   ├── site.webmanifest                       # PWA manifest
│   ├── robots.txt                             # SEO crawler instructions
│   ├── images/                                # Vector branding, properties, and hero graphics
│   └── uploads/                               # Local media upload fallback directory
├── scripts/
│   └── test-admin.cjs                         # End-to-end admin HTTP verification script
└── src/
    ├── components/
    │   ├── Header.astro, Footer.astro, SeoHead.astro
    │   ├── PropertyCard.astro, MortgageCalculator.astro
    │   ├── AnalyticsTracker.astro             # Visitor telemetry beacon
    │   └── admin/
    │       └── PropertyForm.astro             # 7-tab Add/Edit listing form
    ├── layouts/
    │   ├── Layout.astro                       # Public base layout
    │   └── AdminLayout.astro                  # Protected admin layout with sidebar
    ├── lib/
    │   ├── store.ts                           # Domain repository with Supabase fallback
    │   ├── types.ts                           # Strict TypeScript interfaces
    │   ├── analytics.ts                       # Privacy tracker & Power BI engine
    │   ├── csv.ts                             # RFC 4180 CSV builder with formula defense
    │   ├── gsc.ts                             # Google Search Console integration
    │   ├── mortgage.ts                        # Financial calculation algorithms
    │   ├── validation.ts                      # Input sanitization and schema validators
    │   └── auth.ts                            # Session token verification
    ├── pages/
    │   ├── index.astro, buy.astro, sell.astro, about.astro, contact.astro
    │   ├── first-time-homebuyer.astro, va-loans.astro, fix-and-flip.astro
    │   ├── open-houses.astro, testimonials.astro, faq.astro
    │   ├── es/                                # Native Spanish routes
    │   ├── properties/                        # Catalog & dynamic [slug].astro with preview
    │   ├── neighborhoods/                     # San Diego community guides
    │   ├── admin/
    │   │   ├── index.astro                    # Executive Dashboard
    │   │   ├── login.astro                    # Session authentication
    │   │   ├── analytics.astro                # Power BI BI & Analytics
    │   │   ├── leads.astro                    # Full CRM Workspace
    │   │   ├── properties.astro               # Property inventory table
    │   │   ├── reports.astro                  # Reports & CSV export center
    │   │   ├── settings.astro                 # Brokerage configuration
    │   │   └── properties/                    # new.astro and edit.astro
    │   └── api/
    │       ├── leads.ts, valuation.ts
    │       ├── analytics/track.ts             # Visitor beacon receiver
    │       └── admin/                         # Properties, duplicate, status, media, audit, leads, export
    └── tests/
        ├── validation.test.ts, auth.test.ts, mortgage.test.ts
        ├── filter.test.ts, seo.test.ts, cms.test.ts, bi-crm.test.ts
```

---

## 🚀 Getting Started

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/edgar-valle-real-estate.git
cd edgar-valle-real-estate

# Install dependencies
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your environment variables:
```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ADMIN_SECRET_KEY=edgar-valle-admin-session-secure-key-2026
SITE_URL=http://localhost:4321

# Optional: Google Search Console API
GSC_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GSC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GSC_SITE_URL=https://edgarvalle.com
```

### 3. Database Migrations (Supabase)
Execute the migrations sequentially in your Supabase SQL Editor:
1. `supabase/migrations/20261018000001_initial_schema.sql`
2. `supabase/migrations/20261018000002_rls_policies.sql`
3. `supabase/migrations/20261018000003_seed_data.sql`
4. `supabase/migrations/20261019000004_property_cms_extensions.sql`
5. `supabase/migrations/20261019000005_analytics_and_crm_bi.sql`

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:4321](http://localhost:4321) in your browser.

---

## 🧪 Testing & Verification

### Run the Vitest Test Suite (51 Tests)
```bash
npm test
```
```bash
✓ src/tests/validation.test.ts (4 tests)
✓ src/tests/auth.test.ts (5 tests)
✓ src/tests/mortgage.test.ts (4 tests)
✓ src/tests/filter.test.ts (5 tests)
✓ src/tests/seo.test.ts (11 tests)
✓ src/tests/cms.test.ts (9 tests)
✓ src/tests/bi-crm.test.ts (13 tests)

Test Files  7 passed (7)
     Tests  51 passed (51)
```

### Run Astro Diagnostic Check
```bash
npx astro check
# Result (86 files): 0 errors, 0 warnings, 0 hints
```

### Run Production Build
```bash
npm run build
# Compiles complete server bundle in ~5.2s
```

### End-to-End Live HTTP Route & SEO Verifications
With the dev server running, execute automated health checks across all routes, API endpoints, sitemaps, robots rules, and canonicals:
```bash
# 1. Admin endpoints, CSV exports, CRM lead drawer, and analytics telemetry:
node scripts/test-admin.cjs

# 2. Live HTTP canonicals, hreflang alternates, XML sitemap, and robots headers:
node scripts/test-endpoints.js
```

---

## 📚 Technical Documentation & Strategy Guides

Comprehensive operational documentation and playbooks are located in [`docs/`](./docs/):

1. **[Keyword Research & Mapping Matrix](docs/keyword-research-and-mapping.md)**: Target search queries, search intent, search volume estimates, and URL mapping across San Diego buyers, sellers, military relocations, fix-and-flip investors, and Spanish speakers.
2. **[Google Business Profile & Local SEO Guide](docs/local-seo-and-gbp-guide.md)**: Service-area business (SAB) verification protocol, NAP consistency rules, review acquisition scripts, Apple Business Connect, and Bing Places synchronization.
3. **[Off-Page Authority Strategy](docs/off-page-authority-strategy.md)**: Regulatory citation checklist (California DRE, SDAR, CAR, NAR), high-authority directory profiles, guest contributions, and educational PR outreach.
4. **[Technical SEO Audit Report](docs/technical-seo-audit-report.md)**: In-depth audit of HTTP status codes, metadata coverage, canonical tags, schema validation, and Core Web Vitals targets.
5. **[Monthly SEO Reporting SOP](docs/monthly-seo-reporting-process.md)**: Standard operating procedure and monthly reporting template for tracking organic impressions, keyword rankings, qualified lead conversions, and GBP phone calls.

---

## 🔒 Security & Data Privacy

1. **Row Level Security (RLS)**: Public visitors can only view properties where `publication_status = 'published' AND deleted_at IS NULL`. Leads and audit logs can only be read by authenticated administrators.
2. **Spreadsheet Formula Injection Defense**: All CSV cells starting with formula operators (`=`, `+`, `-`, `@`, `\t`, `\r`) are automatically escaped with a leading single quote `'` in [`src/lib/csv.ts`](file:///c:/ussa/src/lib/csv.ts).
3. **No Service-Role Key Leaks**: The Supabase service-role key is never imported into client-side components; all administrative actions route through authenticated server-side endpoints.
4. **Privacy-Conscious Telemetry**: Analytics events exclude names, emails, phone numbers, and authentication tokens via `scrubPII()`. Respects browser Do-Not-Track settings.
5. **Soft Deletions**: Historical sales and performance data remain preserved for brokerage and commission reporting compliance.

---

## 📜 Regulatory Disclosures

- **DRE License**: California Department of Real Estate License **#02375273**.
- **Brokerage**: Affiliated with **Full Circle Group**.
- **Equal Housing Opportunity**: Pledged to the letter and spirit of U.S. policy for the achievement of equal housing opportunity throughout the nation.
