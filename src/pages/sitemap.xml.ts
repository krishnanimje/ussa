import type { APIRoute } from 'astro';
import { getProperties, getNeighborhoods, getBlogPosts } from '../lib/store';

export const prerender = false;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const siteUrl = 'https://edgarvalle.com';
  const properties = await getProperties();
  const neighborhoods = await getNeighborhoods();
  const posts = await getBlogPosts();

  const staticPages = [
    '',
    '/about',
    '/properties',
    '/buy',
    '/sell',
    '/first-time-homebuyer',
    '/va-loans',
    '/fix-and-flip',
    '/open-houses',
    '/neighborhoods',
    '/testimonials',
    '/blog',
    '/faq',
    '/contact',
    '/es',
    '/es/comprar',
    '/es/vender',
    '/es/primeros-compradores',
    '/es/contacto',
    '/es/prestamos-va',
    '/es/inversionistas',
    '/es/casas-abiertas',
    '/es/sobre-mi',
    '/es/preguntas-frecuentes',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/accessibility',
    '/disclosures'
  ];

  // Bilingual paired pages mapping
  const languagePairs: Record<string, { en: string; es: string }> = {
    '': { en: '', es: '/es' },
    '/es': { en: '', es: '/es' },
    '/buy': { en: '/buy', es: '/es/comprar' },
    '/es/comprar': { en: '/buy', es: '/es/comprar' },
    '/sell': { en: '/sell', es: '/es/vender' },
    '/es/vender': { en: '/sell', es: '/es/vender' },
    '/first-time-homebuyer': { en: '/first-time-homebuyer', es: '/es/primeros-compradores' },
    '/es/primeros-compradores': { en: '/first-time-homebuyer', es: '/es/primeros-compradores' },
    '/contact': { en: '/contact', es: '/es/contacto' },
    '/es/contacto': { en: '/contact', es: '/es/contacto' },
    '/va-loans': { en: '/va-loans', es: '/es/prestamos-va' },
    '/es/prestamos-va': { en: '/va-loans', es: '/es/prestamos-va' },
    '/fix-and-flip': { en: '/fix-and-flip', es: '/es/inversionistas' },
    '/es/inversionistas': { en: '/fix-and-flip', es: '/es/inversionistas' },
    '/open-houses': { en: '/open-houses', es: '/es/casas-abiertas' },
    '/es/casas-abiertas': { en: '/open-houses', es: '/es/casas-abiertas' },
    '/about': { en: '/about', es: '/es/sobre-mi' },
    '/es/sobre-mi': { en: '/about', es: '/es/sobre-mi' },
    '/faq': { en: '/faq', es: '/es/preguntas-frecuentes' },
    '/es/preguntas-frecuentes': { en: '/faq', es: '/es/preguntas-frecuentes' }
  };

  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  // Static pages
  for (const page of staticPages) {
    const pair = languagePairs[page];
    let alternates = '';
    if (pair) {
      alternates = `
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${pair.en}" />
    <xhtml:link rel="alternate" hreflang="es" href="${siteUrl}${pair.es}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${pair.en}" />`;
    }

    xml += `
  <url>
    <loc>${siteUrl}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page === '' || page === '/properties' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>${alternates}
  </url>`;
  }

  // Properties (Only published, non-deleted, and indexable listings)
  const eligibleProperties = properties.filter(p => 
    p.publication_status === 'published' && 
    !p.deleted_at && 
    p.is_indexable !== false
  );
  for (const prop of eligibleProperties) {
    const propImage = prop.primary_image 
      ? (prop.primary_image.startsWith('http') ? prop.primary_image : `${siteUrl}${prop.primary_image}`)
      : null;

    let imageNode = '';
    if (propImage) {
      imageNode = `
    <image:image>
      <image:loc>${escapeXml(propImage)}</image:loc>
      <image:title>${escapeXml(prop.seo_title || prop.title)}</image:title>
    </image:image>`;
    }

    xml += `
  <url>
    <loc>${siteUrl}/properties/${prop.slug}</loc>
    <lastmod>${prop.updated_at || prop.created_at}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>${imageNode}
  </url>`;
  }

  // Neighborhoods
  for (const n of neighborhoods) {
    const hoodImage = n.hero_image 
      ? (n.hero_image.startsWith('http') ? n.hero_image : `${siteUrl}${n.hero_image}`)
      : null;

    let imageNode = '';
    if (hoodImage) {
      imageNode = `
    <image:image>
      <image:loc>${escapeXml(hoodImage)}</image:loc>
      <image:title>${escapeXml(`${n.name} San Diego Community Guide`)}</image:title>
    </image:image>`;
    }

    xml += `
  <url>
    <loc>${siteUrl}/neighborhoods/${n.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageNode}
  </url>`;
  }

  // Blog posts
  for (const post of posts) {
    const blogImage = post.cover_image 
      ? (post.cover_image.startsWith('http') ? post.cover_image : `${siteUrl}${post.cover_image}`)
      : null;

    let imageNode = '';
    if (blogImage) {
      imageNode = `
    <image:image>
      <image:loc>${escapeXml(blogImage)}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
    </image:image>`;
    }

    xml += `
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${post.published_at}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${imageNode}
  </url>`;
  }

  xml += `\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
};
