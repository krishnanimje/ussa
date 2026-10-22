import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import cookieParser from 'cookie-parser';
import { apiRouter } from './server/api.js';
import { getDb } from './server/db.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.PROD === 'true' ||
  process.argv.includes('--production') ||
  (!process.argv.includes('--dev') && fs.existsSync(path.resolve(process.cwd(), 'dist/index.html')));

// Security headers
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Body and Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health Check Endpoints (for Docker, Render, Railway, Kubernetes, AWS)
app.get(['/healthz', '/api/health'], (_req, res) => {
  res.status(200).json({
    status: 'ok',
    mode: isProduction ? 'production' : 'development',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Static uploads directory
const publicDir = path.resolve(process.cwd(), 'public');
app.use('/uploads', express.static(path.join(publicDir, 'uploads')));
app.use(express.static(publicDir));

// API router
app.use('/api', apiRouter);

// Technical SEO: robots.txt
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://brandonurzua.com/sitemap.xml
`);
});

// Technical SEO: dynamic sitemap.xml
app.get('/sitemap.xml', (_req, res) => {
  const db = getDb();
  const baseUrl = 'https://brandonurzua.com';
  const now = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/properties', priority: '0.9', changefreq: 'daily' },
    { url: '/services', priority: '0.8', changefreq: 'monthly' },
    { url: '/valuation', priority: '0.8', changefreq: 'monthly' },
    { url: '/calculator', priority: '0.7', changefreq: 'monthly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/journal', priority: '0.8', changefreq: 'weekly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
  ];

  const listingUrls = db.listings
    .filter((l) => l.published)
    .map((l) => ({
      url: `/properties/${l.slug}`,
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: l.updated_at ? l.updated_at.split('T')[0] : now,
    }));

  const articleUrls = db.articles
    .filter((a) => a.status === 'published')
    .map((a) => ({
      url: `/journal/${a.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: a.updated_at ? a.updated_at.split('T')[0] : now,
    }));

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
${listingUrls
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
${articleUrls
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(sitemapXml);
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    // Long-term immutable caching for hashed assets
    app.use(
      '/assets',
      express.static(path.join(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );
    // Standard static serving for other files (favicons, icons, etc.)
    app.use(
      express.static(distPath, {
        maxAge: '1h',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          }
        },
      })
    );
    // SPA fallback: always serve index.html without caching
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });

  const handleShutdown = (signal: string) => {
    console.log(`[${signal}] Initiating graceful shutdown...`);
    server.close(() => {
      console.log('HTTP server closed. Exiting process.');
      process.exit(0);
    });
    // Force exit if close takes too long
    setTimeout(() => {
      console.error('Graceful shutdown timed out. Forcefully terminating.');
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
