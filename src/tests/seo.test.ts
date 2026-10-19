import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { 
  generateSeoMetadata, 
  generateAgentJsonLd, 
  generatePropertyJsonLd,
  generateArticleJsonLd,
  generateVideoJsonLd,
  generateBreadcrumbJsonLd, 
  generateFaqJsonLd 
} from '../lib/seo';
import { GET as getSitemap } from '../pages/sitemap.xml';
import type { Property } from '../lib/types';

describe('SEO & Schema.org Structured Data', () => {
  it('generates accurate metadata defaults and custom titles', () => {
    const defaultMeta = generateSeoMetadata();
    expect(defaultMeta.title).toContain('Edgar Valle');
    expect(defaultMeta.description).toContain('San Diego');
    expect(defaultMeta.siteName).toBe('Edgar Valle Real Estate');

    const customMeta = generateSeoMetadata({
      title: 'North Park Spanish Revival',
      description: 'Stunning 3-bed restored Spanish home.',
      canonicalUrl: '/properties/north-park-spanish-revival'
    });
    expect(customMeta.title).toBe('North Park Spanish Revival | Edgar Valle Realtor');
    expect(customMeta.canonicalUrl).toBe('https://edgarvalle.com/properties/north-park-spanish-revival');
  });

  it('generates valid RealEstateAgent JSON-LD with verified DRE #02375273', () => {
    const jsonStr = generateAgentJsonLd();
    const parsed = JSON.parse(jsonStr);

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('RealEstateAgent');
    expect(parsed.name).toBe('Edgar Valle');
    expect(parsed.identifier.value).toBe('02375273');
    expect(parsed.worksFor.name).toBe('Full Circle Group');
    expect(parsed.sameAs).toContain('https://www.instagram.com/yourrealtoredgar/');
    expect(parsed.knowsLanguage).toEqual(expect.arrayContaining(['en', 'es']));
    // Crucial: No fabricated reviews or rating stars
    expect(parsed.aggregateRating).toBeUndefined();
    expect(parsed.review).toBeUndefined();
  });

  it('generates valid Property JSON-LD and respects custom SEO title and description', () => {
    const testProp: Property = {
      id: 'prop-test-01',
      slug: 'pacific-beach-coastal-condo',
      title: 'Pacific Beach Coastal Retreat',
      seo_title: 'Pacific Beach Luxury Condo 2 Bed | Edgar Valle',
      seo_description: 'Custom curated meta description for PB condo near Crystal Pier.',
      property_type: 'Condo',
      status: 'active',
      price: 1250000,
      bedrooms: 2,
      bathrooms: 2,
      square_feet: 1200,
      garage_spaces: 1,
      has_pool: true,
      is_featured: true,
      is_va_eligible: true,
      is_fixer_upper: false,
      address_street: '820 Hornblend St',
      address_city: 'San Diego',
      address_state: 'CA',
      address_zip: '92109',
      neighborhood: 'Pacific Beach',
      description: 'Modern beach condo steps from Sail Bay and ocean boardwalk.',
      features: ['Central AC', 'Private Balcony', 'Gated Parking'],
      video_url: 'https://www.youtube.com/embed/sample123',
      primary_image: '/images/properties/pb-condo.svg',
      publication_status: 'published',
      created_at: '2026-10-18T10:00:00.000Z'
    };

    const schema = JSON.parse(generatePropertyJsonLd(testProp));
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Apartment');
    expect(schema.name).toBe('Pacific Beach Luxury Condo 2 Bed | Edgar Valle');
    expect(schema.description).toBe('Custom curated meta description for PB condo near Crystal Pier.');
    expect(schema.url).toBe('https://edgarvalle.com/properties/pacific-beach-coastal-condo');
    expect(schema.offers.price).toBe(1250000);
    expect(schema.offers.priceCurrency).toBe('USD');
    expect(schema.video).toBeDefined();
    expect(schema.video['@type']).toBe('VideoObject');
    expect(schema.video.embedUrl).toBe('https://www.youtube.com/embed/sample123');
    // Ensure no invented ratings
    expect(schema.aggregateRating).toBeUndefined();
  });

  it('generates valid Article JSON-LD for market intelligence blog posts', () => {
    const post = {
      title: 'San Diego VA Loan Limit Myth vs Reality',
      excerpt: 'How military home buyers leverage 0% down in San Diego.',
      slug: 'va-loan-limits-san-diego',
      published_at: '2026-10-15T08:00:00Z',
      cover_image: '/images/blog/va-loan-guide.svg',
      author_name: 'Edgar Valle'
    };

    const parsed = JSON.parse(generateArticleJsonLd(post));
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('Article');
    expect(parsed.headline).toBe(post.title);
    expect(parsed.author.name).toBe('Edgar Valle');
    expect(parsed.publisher.name).toBe('Edgar Valle Real Estate');
    expect(parsed.url).toBe('https://edgarvalle.com/blog/va-loan-limits-san-diego');
  });

  it('generates valid VideoObject JSON-LD for walkthrough media', () => {
    const video = {
      name: 'North Park Spanish Revival Home Tour',
      description: 'Exclusive 4K virtual walkthrough tour with Edgar Valle.',
      thumbnailUrl: 'https://edgarvalle.com/images/properties/north-park-spanish.svg',
      uploadDate: '2026-10-17T12:00:00Z',
      embedUrl: 'https://www.youtube.com/embed/test'
    };

    const parsed = JSON.parse(generateVideoJsonLd(video));
    expect(parsed['@type']).toBe('VideoObject');
    expect(parsed.name).toBe(video.name);
    expect(parsed.embedUrl).toBe(video.embedUrl);
  });

  it('generates valid BreadcrumbList JSON-LD', () => {
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Properties', url: '/properties' },
      { name: 'Spanish Revival', url: '/properties/spanish-revival' }
    ];
    const parsed = JSON.parse(generateBreadcrumbJsonLd(breadcrumbs));

    expect(parsed['@type']).toBe('BreadcrumbList');
    expect(parsed.itemListElement).toHaveLength(3);
    expect(parsed.itemListElement[0].position).toBe(1);
    expect(parsed.itemListElement[2].name).toBe('Spanish Revival');
  });

  it('generates valid FAQPage JSON-LD', () => {
    const faqs = [
      { question: 'What is the VA loan limit in San Diego?', answer: 'For veterans with full entitlement, statutory limits have been eliminated.' },
      { question: 'Hablamos español?', answer: 'Sí, ofrecemos asesoría completa en español.' }
    ];
    const parsed = JSON.parse(generateFaqJsonLd(faqs));

    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity).toHaveLength(2);
    expect(parsed.mainEntity[0].name).toBe('What is the VA loan limit in San Diego?');
    expect(parsed.mainEntity[1].acceptedAnswer.text).toBe('Sí, ofrecemos asesoría completa en español.');
  });
});

describe('Technical SEO, Sitemap & Robots Validation', () => {
  it('generates a compliant sitemap.xml with xhtml hreflangs and Google image extensions', async () => {
    const response = await getSitemap({} as any);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/xml');
    expect(response.headers.get('Cache-Control')).toContain('max-age=3600');

    const xml = await response.text();
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');

    // Bilingual alternate links
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="en" href="https://edgarvalle.com"');
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="es" href="https://edgarvalle.com/es"');
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://edgarvalle.com"');

    // Google Image nodes
    expect(xml).toContain('<image:image>');
    expect(xml).toContain('<image:loc>');
    expect(xml).toContain('<image:title>');

    // Static core pages included
    expect(xml).toContain('<loc>https://edgarvalle.com/properties</loc>');
    expect(xml).toContain('<loc>https://edgarvalle.com/va-loans</loc>');
    expect(xml).toContain('<loc>https://edgarvalle.com/first-time-homebuyer</loc>');
    expect(xml).toContain('<loc>https://edgarvalle.com/es</loc>');
  });

  it('validates robots.txt rules against unauthorized crawling and search facet duplicate loops', () => {
    const robotsPath = path.resolve(process.cwd(), 'public/robots.txt');
    expect(fs.existsSync(robotsPath)).toBe(true);

    const content = fs.readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('User-agent: *');
    expect(content).toContain('Disallow: /admin/');
    expect(content).toContain('Disallow: /api/');
    expect(content).toContain('Disallow: /*?search=*');
    expect(content).toContain('Disallow: /*?filter=*');
    expect(content).toContain('Disallow: /*?preview=*');
    expect(content).toContain('Sitemap: https://edgarvalle.com/sitemap.xml');
  });

  it('validates canonical 301 redirect configuration in public/_redirects', () => {
    const redirectsPath = path.resolve(process.cwd(), 'public/_redirects');
    expect(fs.existsSync(redirectsPath)).toBe(true);

    const content = fs.readFileSync(redirectsPath, 'utf-8');
    expect(content).toContain('/listings');
    expect(content).toContain('/properties');
    expect(content).toContain('/military');
    expect(content).toContain('/va-loans');
    expect(content).toContain('/fthb');
    expect(content).toContain('/first-time-homebuyer');
  });

  it('verifies critical indexable routes exist in the filesystem without soft 404s', () => {
    const pagesDir = path.resolve(process.cwd(), 'src/pages');
    const essentialRoutes = [
      'index.astro',
      'buy.astro',
      'sell.astro',
      'first-time-homebuyer.astro',
      'va-loans.astro',
      'fix-and-flip.astro',
      'open-houses.astro',
      'about.astro',
      'contact.astro',
      'faq.astro',
      'testimonials.astro',
      'es/index.astro',
      'es/comprar.astro',
      'es/vender.astro',
      'es/primeros-compradores.astro',
      'es/contacto.astro',
      '404.astro'
    ];

    for (const route of essentialRoutes) {
      const filePath = path.join(pagesDir, route);
      expect(fs.existsSync(filePath), `Route file ${route} must exist`).toBe(true);
    }
  });
});
