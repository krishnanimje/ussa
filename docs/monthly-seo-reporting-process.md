# Standard Operating Procedure: Monthly SEO Reporting Process
**Edgar Valle | Realtor® • Full Circle Group • CA DRE #02375273**
**Target Market:** San Diego County, California

---

## 1. Objective & Ethical Foundation

The purpose of this Monthly SEO Reporting SOP is to maintain a consistent, data-backed feedback loop tracking organic search visibility, local map pack prominence, technical crawl health, and lead conversions for Edgar Valle Real Estate.

### Ethical Disclaimer:
> **Notice to Stakeholders:** Search engine algorithms operate autonomously based on hundreds of dynamic variables. We never guarantee first-page ranking or instantaneous indexation for any specific search query. Our strategy relies strictly on continuous technical health, rigorous search intent satisfaction, high-value local content, and verified professional authority.

---

## 2. Monthly Reporting Schedule & Data Sources

Perform this audit during the **first week of every calendar month** covering the preceding full month (e.g., Audit on November 3rd for October 1st–31st data).

### Core Data Sources:
1. **Google Search Console (GSC):** Organic clicks, impressions, average CTR, average position, indexing status, and mobile usability.
2. **Google Analytics 4 (GA4):** Sessions, organic landing page traffic, visitor-to-lead conversion rates, and engagement duration.
3. **Google Business Profile Performance (GBP):** Calls, website clicks, direction requests, and message inquiries.
4. **Internal Admin BI Dashboard (`/admin`):** Verified CRM lead submissions, property view analytics, and consultation forms.

---

## 3. Step-by-Step Monthly Audit Workflow

### Step 1: Google Search Console Performance Review
1. Navigate to **Search Console > Performance > Search Results**.
2. Select Date Range: **Last 28 days** (compare to previous period).
3. Record aggregate metrics:
   - **Total Clicks:** Goal: Consistent month-over-month growth.
   - **Total Impressions:** Indicator of expanding keyword reach.
   - **Average CTR:** Target: > 3.0% for branded and local terms.
   - **Average Position:** Track movement across core San Diego queries.
4. **Identify "Striking Distance" Keywords:**
   - Filter for queries ranking in positions **4 through 15** with high impression counts.
   - These represent prime opportunities for quick on-page content enhancement or internal linking from related blog posts.

### Step 2: Indexation & Crawl Health Audit
1. Navigate to **Search Console > Indexing > Pages**.
2. Check the count of **Indexed vs. Not Indexed** pages.
3. Investigate any flagged issues:
   - *Duplicate without user-selected canonical:* Verify `rel="canonical"` is resolving properly.
   - *Crawled - currently not indexed:* Inspect page content depth and search intent relevance.
   - *Soft 404:* Ensure removed listings return standard 404 status codes, not 200 OK blank templates.
   - *Server error (5xx):* Check server logs and Supabase connection latency.
4. Inspect `/sitemap.xml`: Verify last read date is within the last 7 days with status "Success".

### Step 3: Google Business Profile (Local Map Pack) Review
1. Open **GBP Manager > Performance**.
2. Record local engagement actions:
   - **Phone Calls Generated:** Direct mobile click-to-calls to `(619) 555-0198`.
   - **Website Clicks:** Visitors routed to `https://edgarvalle.com`.
   - **Direction Requests:** Navigations initiated to San Diego office locations.
   - **Map vs. Search Views:** Ratio of users discovering Edgar via Google Maps vs. desktop web search.

### Step 4: Organic Lead Conversion Analysis (GA4 & CRM)
1. In GA4, filter **User Acquisition** by `Session default channel group == "Organic Search"`.
2. Cross-reference lead conversions with the internal CRM:
   - First-Time Homebuyer consultation requests.
   - VA Loan eligibility submissions.
   - Home valuation requests from potential sellers.
   - Bilingual / Spanish form submissions (`/es/*`).
3. Calculate **Visitor-to-Lead Conversion Rate:**
   $$\text{Conversion Rate} = \left(\frac{\text{Organic Leads}}{\text{Organic Sessions}}\right) \times 100\%$$
   - Target benchmark: **1.8% to 3.5%** for high-intent local real estate websites.

### Step 5: Core Web Vitals & Page Experience Monitoring
1. In GSC, check **Experience > Core Web Vitals**:
   - Verify 100% of URLs remain in the "Good" bucket for both Mobile and Desktop.
   - Ensure LCP <= 2.5s, INP <= 200ms, and CLS <= 0.1.

---

## 4. Standardized Monthly SEO Report Template

Use the following markdown template when summarizing monthly findings for Edgar Valle:

```markdown
# Monthly SEO & Organic Performance Report: [Month Year]
**Client:** Edgar Valle | Realtor (Full Circle Group • DRE #02375273)
**Reporting Period:** [Start Date] - [End Date]

## 1. Executive Summary
- [1-2 sentences summarizing major wins, traffic trajectories, and lead volume]

## 2. Key Performance Indicators (KPIs)

| Metric | Current Month | Previous Month | % Change |
| :--- | :---: | :---: | :---: |
| Organic Clicks (GSC) | [Value] | [Value] | [%] |
| Organic Impressions (GSC) | [Value] | [Value] | [%] |
| Average Organic CTR | [Value]% | [Value]% | [Pts] |
| Average Ranking Position | [Value] | [Value] | [+/-] |
| GBP Direct Phone Calls | [Value] | [Value] | [%] |
| GBP Website Visits | [Value] | [Value] | [%] |
| Total Organic Leads Generated | [Value] | [Value] | [%] |
| Visitor-to-Lead Conversion Rate | [Value]% | [Value]% | [Pts] |

## 3. Top Performing Search Queries
1. [Keyword 1] — Position: [X] • Clicks: [X] • Impressions: [X]
2. [Keyword 2] — Position: [X] • Clicks: [X] • Impressions: [X]
3. [Keyword 3] — Position: [X] • Clicks: [X] • Impressions: [X]
4. [Keyword 4] — Position: [X] • Clicks: [X] • Impressions: [X]
5. [Keyword 5] — Position: [X] • Clicks: [X] • Impressions: [X]

## 4. Technical SEO & Crawl Status
- Indexed Pages: [Count]
- Excluded Pages (Drafts / Facets / Admin): [Count] (Working as intended)
- Soft 404 Errors: 0
- Mobile Usability Issues: 0
- Core Web Vitals Status: 100% "Good"

## 5. Completed Initiatives This Month
- [Initiative 1, e.g., Published North Park Craftsman guide and updated median pricing]
- [Initiative 2, e.g., Embedded 4K video walkthrough tour schema on 3 active listings]
- [Initiative 3, e.g., Added reciprocal Spanish hreflang tags for first-time homebuyer page]

## 6. Action Items & Next Month Focus
1. [Target 1, e.g., Optimize metadata for striking distance query 'Oceanside VA homes']
2. [Target 2, e.g., Host and publish recap of San Diego first-time buyer seminar]
3. [Target 3, e.g., Request 3 post-closing reviews on Google Business Profile]
```

---

## 5. Quarterly Content Refresh Protocol

Search engines prioritize fresh, temporally accurate real estate data. Every 90 days:
1. **Update Median Home Prices:** Refresh neighborhood guide stats (North Park, PB, Chula Vista, Oceanside, La Jolla) in `src/lib/store.ts`.
2. **Update Mortgage & Interest Rates:** Review mortgage calculator defaults in `src/lib/mortgage.ts` to match prevailing market rates.
3. **Audit Active vs. Sold Listings:** Ensure sold properties are clearly designated with `SoldOut` schema and removed from prominent active listing feeds while maintaining SEO index equity.
