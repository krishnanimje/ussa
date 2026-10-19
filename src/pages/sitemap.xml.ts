import type { APIRoute } from 'astro';
import { getProperties, getNeighborhoods, getBlogPosts } from '../lib/store';

export const prerender = false;

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
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/accessibility',
    '/disclosures'
  ];

  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static pages
  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${siteUrl}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page === '' || page === '/properties' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  }

  // Properties
  for (const prop of properties) {
    xml += `
  <url>
    <loc>${siteUrl}/properties/${prop.slug}</loc>
    <lastmod>${prop.created_at}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  }

  // Neighborhoods
  for (const n of neighborhoods) {
    xml += `
  <url>
    <loc>${siteUrl}/neighborhoods/${n.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Blog posts
  for (const post of posts) {
    xml += `
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${post.published_at}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  xml += `\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
