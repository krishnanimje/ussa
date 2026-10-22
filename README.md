# Brandon Urzua — Official Website & Creative Portfolio
> Premium Personal Brand Platform • Instagram Reference: [@brandonurzua21](https://www.instagram.com/brandonurzua21/)

A production-grade, full-stack personal brand website, creative portfolio, editorial journal, and brand collaboration platform built for **Brandon Urzua**. Designed with high-fashion editorial polish, responsive typography, persistent data management, anti-spam validation, and a private admin dashboard.

---

## 🌟 Brand Discovery & Architectural Truth

In accordance with Phase 1 Brand Discovery & Anti-Fabrication Principles:
- **Instagram Reference Account:** Verified at [`https://www.instagram.com/brandonurzua21/`](https://www.instagram.com/brandonurzua21/).
- **Verified Public Facts:** Active Instagram handle `@brandonurzua21`, community/celebratory public posts, creative aesthetic.
- **Architectural Integrity:** Private analytics, unverified pricing, and fake metrics are strictly avoided. The platform establishes an editorial foundation with an active Admin Portal (`/admin`) for 1-click updates of official media assets, bio copy, and rate cards.

---

## ⚡ Architecture & Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Cinzel serif & Plus Jakarta Sans typography.
- **Full-Stack Backend:** Node.js Express server mounting Vite in development and serving compiled assets in production.
- **Database & Persistence:** Relational document schema with atomic writes (`data/brand-store.json`) covering:
  - `profiles`: Bio, avatar, headline, verified facts tracker, social links.
  - `content_items`: Filterable gallery (Visual Arts, Editorial, Lifestyle, Brand Collabs, Motion).
  - `services`: Creative Direction, Brand Partnerships, Commercial Production.
  - `inquiries`: Brand briefs, budget tiers, client validation, status tracker.
  - `articles`: Editorial journal essays and dispatches.
  - `site_settings`: SEO title, meta tags, OpenGraph, canonical URLs.
- **Authentication & Security:** HMAC-SHA256 signed session tokens, protected admin routes, IP rate limiting, bot honeypots.
- **Technical SEO:** Valid JSON-LD structured data (`Person` & `WebSite`), dynamic `sitemap.xml`, and `robots.txt`.

---

## 🔐 Admin Dashboard Access

- **Path:** `/admin` (or click the shield/lock icon in navigation or footer)
- **Default Email:** `admin@brandonurzua.com`
- **Default Password:** `brandon2026`
- **Features:**
  - Inquiries Inbox: review brand briefs, update status (`new`, `in_review`, `replied`, `archived`), write private internal notes.
  - Portfolio CMS: upload high-res photography (`/api/upload`), assign categories, link directly to Instagram posts.
  - Services CMS: customize deliverables, ideal client profiles, and pricing guidance.
  - Journal CMS: author essays in Markdown, manage publication status.
  - Profile & SEO: update bio, location, headline, title tags, and meta descriptions.

---

## 🧪 Testing & Verification

Run the unit test suite via Node's native test runner:
```bash
./node_modules/.bin/tsx --test src/utils/brand-logic.test.ts
```

Compile and lint the application:
```bash
npm run lint
npm run build
```

---

## 🚀 Deployment

- **Dev Mode:** `npm run dev` (`tsx server.ts`)
- **Production Build:** `npm run build`
- **Production Start:** `npm run start` (`node server.ts` on port 3000)
