# Iron Passport – SEO Audit

## Summary

Technical SEO audit and implementation for Iron Passport, an AI-powered gym finder for travelers. The site is built with Next.js 16 (App Router, static export).

---

## Issues Fixed

### 1. robots.txt (NEW)
- **File**: `public/robots.txt`
- Added `Allow: /` for all crawlers
- Added `Disallow: /admin/` to block admin dashboard
- Added `Disallow: /*?*` to prevent query-param duplicate indexing
- Added `Sitemap:` directive pointing to production sitemap

### 2. XML Sitemap (NEW)
- **File**: `public/sitemap.xml`
- Static sitemap with homepage entry
- Ready to expand with city/gym pages when real routes are added

### 3. Metadata & Canonical Tags (FIXED)
- **File**: `src/app/layout.js`, `src/lib/seo.js`
- Replaced generic "Create Next App" title/description with Iron Passport branding
- Added `metadataBase` for correct canonical URL resolution
- Added canonical `<link>` via `alternates.canonical`
- Created `buildMetadata()` utility for consistent metadata across pages

### 4. Open Graph & Twitter Cards (NEW)
- **File**: `src/lib/seo.js`
- Full Open Graph metadata (title, description, url, siteName, type, images)
- Twitter `summary_large_image` card support
- Fallback OG image path configured (`/og-image.png`)

### 5. Structured Data / JSON-LD (NEW)
- **File**: `src/app/page.js`, `src/lib/seo.js`
- `WebSite` schema with SearchAction
- `Organization` schema
- `FAQPage` schema with 5 real FAQs about Iron Passport
- Utility functions for `ExerciseGym`, `ItemList` (city), and `BreadcrumbList` schemas
- Ready to attach to city/gym pages when those routes are created

### 6. Admin Page noindex (NEW)
- **File**: `src/app/admin/layout.js`
- Admin dashboard marked with `robots: { index: false, follow: false }`

### 7. Duplicate Content Prevention (FIXED)
- `robots.txt` blocks `/*?*` pattern to prevent query-param variations from being indexed
- Canonical tags on every page point to the clean URL

### 8. Semantic HTML (IMPROVED)
- Wrapped nav in `<header>` element
- Changed main content container from `<div>` to `<main>`
- Added `aria-label="Main navigation"` to `<nav>`
- Added `aria-label` and `aria-hidden` attributes for accessibility
- H1 already correctly used on homepage (verified: single H1, proper hierarchy)

### 9. Footer with Internal Links (NEW)
- **File**: `src/app/components/IronPassport.jsx`
- Added `<footer>` with three columns: Brand, Features, Popular Searches
- Internal links to Gym Finder, Destination Discovery, Gym Compare, Gym Passport
- Popular city search links (New York, Las Vegas, Miami, Bali)
- Copyright notice

### 10. Core Web Vitals Improvements (IMPROVED)
- **Font loading**: Replaced render-blocking `@import url(...)` in `<style>` with `<link rel="stylesheet">` + `<link rel="preconnect">`
- **Font display**: Added `display: "swap"` to Geist/Geist_Mono font declarations to prevent FOIT
- **globals.css**: Removed unused light-mode CSS vars, added `img { max-width: 100%; height: auto; }` for layout stability
- **Theme color**: Added `<meta name="theme-color">` for mobile browser chrome

### 11. Server-Side Content for Crawlers (NEW)
- **File**: `src/app/layout.js`
- Added `<noscript>` block with core SEO content (H1, feature descriptions) so crawlers that don't execute JavaScript can still index key content

### 12. Web App Manifest (NEW)
- **File**: `public/manifest.json`
- PWA-ready manifest with app name, description, theme colors, and icon

---

## Architecture Context

Iron Passport is currently a **single-page application** with client-side routing via React state (`mode` variable). There are only two actual URL routes:
- `/` – Main app (all features: finder, discovery, passport, compare)
- `/admin/` – Admin dashboard (noindexed)

All navigation between features (Gym Finder, Discovery, Passport, Compare) happens client-side without URL changes. This means:
- Search engines primarily see the homepage content
- City/gym results are dynamically generated and not crawlable as separate pages
- The sitemap currently only contains the homepage

---

## Remaining Risks & Recommendations

### High Priority

1. **Create dedicated URL routes for features**
   - `/finder/` – Gym Finder
   - `/discover/` – Destination Discovery
   - `/compare/` – Gym Compare
   - `/passport/` – Gym Passport
   - This would make each feature independently indexable and linkable

2. **Create city pages** (e.g., `/cities/new-york/`, `/cities/las-vegas/`)
   - Pre-render pages for seeded cities with gym data from Supabase
   - Each page gets its own metadata, canonical, and structured data
   - Expand sitemap dynamically with all city URLs

3. **Create gym detail pages** (e.g., `/gyms/equinox-soho/`)
   - Individual gym pages with `ExerciseGym` schema
   - Link from city pages for internal linking

4. **OG image asset**
   - Create an actual `/public/og-image.png` (1200x630px) for social sharing
   - Also create `/public/apple-touch-icon.png` and `/public/icon-512.png`

5. **Remove static export limitation** (`output: "export"`)
   - Switch to server-rendered or ISR to enable dynamic sitemaps, dynamic metadata, and API routes
   - This unlocks `sitemap.ts` and `robots.ts` in the App Router for dynamic generation

### Medium Priority

6. **Vercel deployment SEO**
   - Ensure preview deployments have `<meta name="robots" content="noindex">` (Vercel does this automatically for non-production URLs)
   - Verify canonical tags point to production domain, not `*.vercel.app`
   - Set up custom domain in Vercel project settings

7. **Google Search Console**
   - Add site verification meta tag or DNS TXT record
   - Submit sitemap URL
   - Monitor coverage and indexing

8. **Internal linking strategy**
   - When city pages exist, cross-link between related cities
   - Add "Related destinations" sections
   - Link gym pages from comparison results

9. **Image optimization**
   - Consider removing `images: { unoptimized: true }` when moving off static export
   - Add lazy loading attributes when images are introduced

### Low Priority

10. **Breadcrumb schema activation**
    - `breadcrumbSchema()` utility is ready in `src/lib/seo.js`
    - Attach when multi-level routes (e.g., `/cities/new-york/equinox-soho/`) are created

11. **Comparison page schema**
    - When gym comparisons have their own URLs, add structured data for the comparison results

12. **Editorial / blog content**
    - Add a `/blog/` or `/guides/` section for long-tail SEO
    - City guides, "best gym for powerlifting in X", seasonal travel content
    - Each post gets its own `Article` schema

---

## Files Changed

| File | Change |
|------|--------|
| `public/robots.txt` | NEW – crawl directives + sitemap reference |
| `public/sitemap.xml` | NEW – static XML sitemap |
| `public/manifest.json` | NEW – web app manifest |
| `src/lib/seo.js` | NEW – metadata builder, JSON-LD schema utilities |
| `src/app/layout.js` | UPDATED – metadata, canonical, OG, Twitter, font swap, noscript fallback |
| `src/app/page.js` | UPDATED – JSON-LD structured data (WebSite, Organization, FAQ) |
| `src/app/globals.css` | UPDATED – dark theme defaults, image stability |
| `src/app/admin/layout.js` | NEW – noindex metadata for admin |
| `src/app/components/IronPassport.jsx` | UPDATED – semantic HTML, font preload, footer, internal links |
