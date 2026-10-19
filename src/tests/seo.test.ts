import { describe, it, expect } from 'vitest';
import { generateSeoMetadata, generateAgentJsonLd, generateBreadcrumbJsonLd, generateFaqJsonLd } from '../lib/seo';

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
