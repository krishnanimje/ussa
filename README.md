# Edgar Valle | Realtor — San Diego Real Estate Platform

[![Astro](https://img.shields.io/badge/Astro-5.18-BC52EE.svg?style=flat&logo=astro)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20RLS-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com)
[![Vitest](https://img.shields.io/badge/Vitest-Unit%20Tests%20Passing-6E9F18.svg?style=flat&logo=vitest)](https://vitest.dev)

A complete, production-ready real estate web application built for **Edgar Valle | Realtor** ([Full Circle Group](https://edgarvalle.com), **California DRE #02375273**) serving the San Diego, California market.

Instagram: [@yourrealtoredgar](https://www.instagram.com/yourrealtoredgar/) • Direct: `(619) 555-0198`

---

## 🌟 Core Brand Specialties

1. **First-Time Homebuyers** — Low-down-payment navigation (FHA 3.5%, Conventional 3%), CalHFA grant assistance, credit optimization, and a 6-step roadmap.
2. **VA Military Home Loans** — Serving active duty service members and veterans stationed across **Camp Pendleton (Oceanside)**, **Naval Base San Diego (32nd Street)**, **Naval Base Coronado**, and **MCAS Miramar**. 0% down payment, $0 private mortgage insurance (PMI), and maximizing San Diego Basic Allowance for Housing (BAH).
3. **Fix-and-Flip & Real Estate Investors** — Mathematical underwriting using the **70% rule** ($MAO = [ARV \times 70\%] - \text{Rehab}$), off-market deal sourcing, contractor estimates, and California SB9 / ADU lot-expansion opportunities.
4. **Bilingual Advisory ("Hablamos Español")** — Complete native Spanish-language representation, contract translations, and family consultations.

---

## 🛠️ Technology Stack

- **Framework**: [Astro 5](https://astro.build) with **TypeScript strict mode** (`astro/tsconfigs/strict`).
- **Rendering & Server**: Modern hybrid SSR with `@astrojs/node` standalone adapter for server-side endpoints and protected admin routing.
- **Styling**: Modern, responsive **Vanilla CSS design system** utilizing design tokens (`tokens.css`, `global.css`, `admin.css`), CSS grid, flexbox, native animations, and responsive breakpoints. **Zero bloated UI frameworks or Next.js dependencies.**
- **Database & Security**: [Supabase](https://supabase.com) PostgreSQL with **Row Level Security (RLS)**, automated audit logs, and strict input validation/sanitization (`validation.ts`). Includes a zero-downtime persistent mock repository for development when remote keys are pending.
- **Testing**: [Vitest](https://vitest.dev) for unit testing of financial calculations, lead validation, and search filtering.

---

## 📁 Directory Structure

```text
├── .env.example                       # Environment variables template
├── astro.config.mjs                   # Astro configuration with Node adapter
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # Strict TypeScript compiler options
├── vitest.config.ts                   # Vitest unit test runner config
├── supabase/
│   └── migrations/
│       ├── 20261018000001_initial_schema.sql  # Tables, constraints, and indexes
│       ├── 20261018000002_rls_policies.sql    # Row Level Security policies
│       └── 20261018000003_seed_data.sql       # 12+ San Diego listings, neighborhoods, and posts
├── public/
│   ├── favicon.svg                    # Vector monogram favicon
│   ├── site.webmanifest               # PWA web manifest
│   ├── robots.txt                     # SEO robots configuration
│   └── images/
│       ├── branding/                  # Logo, wordmark, portrait vectors
│       ├── properties/                # Architectural property illustrations
│       ├── neighborhoods/             # Community hero graphics
│       └── blog/                      # Editorial blog covers
└── src/
    ├── components/                    # Header, Footer, PropertyCard, MortgageCalculator, etc.
    ├── layouts/                       # Layout.astro (Public), AdminLayout.astro (Protected)
    ├── lib/                           # Store, Supabase client, Validation, Mortgage, SEO helpers
    ├── pages/                         # All public pages, Spanish routes, Admin portal, API endpoints
    └── tests/                         # Vitest unit test suites
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v20.x` or higher
- npm `v10.x` or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/edgar-valle-real-estate.git
cd edgar-valle-real-estate

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the template and configure your secrets:
```bash
cp .env.example .env
```
Populate your environment variables in `.env`:
```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ADMIN_SECRET_KEY=your-secure-admin-passphrase-here
SITE_URL=http://localhost:4321
```

### 4. Database Setup (Supabase)
Run the SQL migrations located in `supabase/migrations/` sequentially in your Supabase SQL Editor:
1. `20261018000001_initial_schema.sql` (Profiles, properties, media, leads, open houses, settings)
2. `20261018000002_rls_policies.sql` (Enables RLS on all tables; secures leads from public access)
3. `20261018000003_seed_data.sql` (Populates authentic San Diego properties and initial articles)

### 5. Running Locally
```bash
# Start local development server
npm run dev
```
Open [http://localhost:4321](http://localhost:4321) in your browser.

---

## 🧪 Testing

Execute automated unit tests for mortgage calculations, lead validation, and search filters:
```bash
npm run test
```

---

## 🔒 Security & Data Privacy (RLS)

- **Leads Confidentiality**: The `leads` table has strict Row Level Security. Public anonymous users can **only insert** new inquiries. Public users **cannot read, update, or delete** any lead data.
- **Admin Authentication**: All `/admin` routes verify the session cookie on the server before rendering. Secret keys remain strictly server-side and are never bundled into client scripts.
- **Input Sanitization**: All incoming form payloads are sanitized to prevent script injection and XSS attacks.

---

## 📜 Legal & Regulatory Disclosures

- **DRE License**: California Department of Real Estate License **#02375273**.
- **Brokerage**: Affiliated with **Full Circle Group**.
- **Fair Housing**: Adheres to the federal Fair Housing Act and California Fair Employment and Housing Act (FEHA). **Equal Housing Opportunity**.
