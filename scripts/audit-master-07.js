// Comprehensive Master Prompt 07 Full Project Audit Script
// Tests every public page, sitemap entry, admin route, error code, API endpoint, broken links, and images.

const BASE_URL = 'http://localhost:4321';

async function runAudit() {
  console.log('===============================================================');
  console.log(' MASTER PROMPT 07 — FULL PROJECT AUDIT & VERIFICATION SUITE');
  console.log('===============================================================\n');

  let passedChecks = 0;
  let failedChecks = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASSED: ${message}`);
      passedChecks++;
    } else {
      console.error(`  ✗ FAILED: ${message}`);
      failedChecks++;
    }
  }

  // --- SECTION 1: SITEMAP & PUBLIC ROUTES CRAWL ---
  console.log('\n--- 1. CRAWLING SITEMAP & PUBLIC ROUTES ---');
  let sitemapUrls = [];
  try {
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    assert(sitemapRes.status === 200, `Fetch /sitemap.xml (Status ${sitemapRes.status})`);
    const xml = await sitemapRes.text();
    const locMatches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
    sitemapUrls = locMatches.map(m => m.replace(/<\/?loc>/g, '').replace('https://edgarvalle.com', ''));
    console.log(`  Found ${sitemapUrls.length} indexable URLs in sitemap.xml`);
  } catch (err) {
    assert(false, `Failed to fetch sitemap: ${err.message}`);
  }

  const discoveredLinks = new Set();
  const discoveredImages = new Set();

  for (const path of sitemapUrls) {
    const url = `${BASE_URL}${path || '/'}`;
    try {
      const res = await fetch(url);
      const isOk = res.status === 200;
      assert(isOk, `Route ${path || '/'} returns HTTP 200 (Got ${res.status})`);
      
      const html = await res.text();
      // Extract links
      const linkMatches = html.match(/href="([^"#][^"]*)"/g) || [];
      for (const m of linkMatches) {
        const href = m.replace(/^href="/, '').replace(/"$/, '');
        if (href.startsWith('/') && !href.startsWith('//')) {
          discoveredLinks.add(href);
        }
      }
      // Extract images
      const imgMatches = html.match(/src="([^"]+)"/g) || [];
      for (const m of imgMatches) {
        const src = m.replace(/^src="/, '').replace(/"$/, '');
        if (src.startsWith('/') && !src.startsWith('//')) {
          discoveredImages.add(src);
        }
      }
    } catch (err) {
      assert(false, `Route ${path} threw error: ${err.message}`);
    }
  }

  // --- SECTION 2: VERIFY ALL DISCOVERED INTERNAL LINKS ---
  console.log(`\n--- 2. VERIFYING ${discoveredLinks.size} DISCOVERED INTERNAL LINKS ---`);
  let deadLinks = 0;
  for (const link of discoveredLinks) {
    // Skip tel, mailto, javascript
    if (link.startsWith('tel:') || link.startsWith('mailto:') || link.startsWith('javascript:')) continue;
    try {
      const res = await fetch(`${BASE_URL}${link}`);
      // Status should be 200, or 3xx redirect, or 401/403 for protected admin links
      const acceptable = res.status === 200 || (res.status >= 300 && res.status < 400) || (link.startsWith('/admin') && (res.status === 302 || res.status === 403 || res.status === 200));
      if (!acceptable) {
        deadLinks++;
        console.error(`  ✗ Dead Link: ${link} returned HTTP ${res.status}`);
      }
    } catch (err) {
      deadLinks++;
      console.error(`  ✗ Link error ${link}: ${err.message}`);
    }
  }
  assert(deadLinks === 0, `All ${discoveredLinks.size} internal links are valid with zero dead links (Dead: ${deadLinks})`);

  // --- SECTION 3: VERIFY ALL DISCOVERED IMAGES & STATIC ASSETS ---
  console.log(`\n--- 3. VERIFYING ${discoveredImages.size} DISCOVERED STATIC ASSETS & IMAGES ---`);
  let deadImages = 0;
  for (const img of discoveredImages) {
    try {
      const res = await fetch(`${BASE_URL}${img}`);
      if (res.status !== 200) {
        deadImages++;
        console.error(`  ✗ Dead Image: ${img} returned HTTP ${res.status}`);
      }
    } catch (err) {
      deadImages++;
      console.error(`  ✗ Image error ${img}: ${err.message}`);
    }
  }
  assert(deadImages === 0, `All ${discoveredImages.size} images/assets resolved successfully with HTTP 200 (Dead: ${deadImages})`);

  // Verify core branding assets explicitly
  const coreAssets = ['/favicon.svg', '/robots.txt', '/sitemap.xml'];
  for (const asset of coreAssets) {
    const res = await fetch(`${BASE_URL}${asset}`);
    assert(res.status === 200, `Core asset ${asset} returns HTTP 200`);
  }

  // --- SECTION 4: HTTP STATUS AND ERROR RESPONSES ---
  console.log('\n--- 4. HTTP STATUS AND ERROR CODE RESPONSES ---');
  const errorStatuses = [403, 404, 429, 500, 502, 503, 504, 505];
  for (const code of errorStatuses) {
    const res = await fetch(`${BASE_URL}/${code}`);
    assert(res.status === code, `Page /${code} accurately returns HTTP ${code} (Got ${res.status})`);
  }

  // Test random nonexistent URL
  const randomRes = await fetch(`${BASE_URL}/nonexistent-property-${Date.now()}`);
  assert(randomRes.status === 404, `Random unknown URL returns HTTP 404 (Got ${randomRes.status})`);

  // --- SECTION 5: SECURITY, ANONYMOUS ACCESS & AUTH ENFORCEMENT ---
  console.log('\n--- 5. SECURITY, RLS & AUTHORIZATION ENFORCEMENT ---');
  
  // Unauthenticated access to admin pages should redirect to login or return 403/302
  const adminRoutes = [
    '/admin',
    '/admin/properties',
    '/admin/leads',
    '/admin/analytics',
    '/admin/audit-logs',
    '/admin/settings',
    '/admin/media'
  ];
  for (const route of adminRoutes) {
    const res = await fetch(`${BASE_URL}${route}`, { redirect: 'manual' });
    // Should be redirect to login (302) or forbidden (403)
    const isProtected = res.status === 302 || res.status === 403 || res.status === 401;
    assert(isProtected, `Anonymous access to ${route} blocked with HTTP ${res.status}`);
  }

  // Admin APIs without auth token should return 401 Unauthorized
  const adminApis = [
    '/api/admin/leads',
    '/api/admin/properties',
    '/api/admin/bi/metrics',
    '/api/admin/audit-logs'
  ];
  for (const api of adminApis) {
    const res = await fetch(`${BASE_URL}${api}`);
    assert(res.status === 401 || res.status === 403, `Anonymous call to ${api} blocked with HTTP ${res.status}`);
  }

  // Cache-Control headers on private endpoints
  const privateRes = await fetch(`${BASE_URL}/admin/login`);
  const privateCache = privateRes.headers.get('cache-control') || '';
  assert(privateCache.includes('no-store') || privateCache.includes('private'), `Admin page has private Cache-Control (${privateCache})`);

  // --- SECTION 6: PUBLIC FORMS & CRM WORKFLOWS ---
  console.log('\n--- 6. FORM WORKFLOWS & CRM INTAKE ---');
  
  // 1. Invalid Lead Submission (Missing required fields)
  const invalidLeadRes = await fetch(`${BASE_URL}/api/leads`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Forwarded-For': '198.51.100.9'
    },
    body: JSON.stringify({ name: '' })
  });
  assert(invalidLeadRes.status === 400, `Empty lead submission rejected with HTTP 400 (Got ${invalidLeadRes.status})`);

  // 2. Valid Lead Submission (Sanitization & Honeypot test)
  const validLeadPayload = {
    name: 'Master Prompt 07 Test Client',
    email: 'test.mp07@example.com',
    phone: '(619) 555-0144',
    inquiry_type: 'buy',
    message: 'Testing complete project audit lead submission workflow.',
    preferred_contact: 'email',
    timeline: '1-3 months',
    budget_range: '$1,000,000 - $1,500,000',
    honeypot: '' // empty honeypot
  };
  const validLeadRes = await fetch(`${BASE_URL}/api/leads`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Forwarded-For': '198.51.100.10'
    },
    body: JSON.stringify(validLeadPayload)
  });
  assert(validLeadRes.status === 200 || validLeadRes.status === 201, `Valid lead submission accepted with HTTP ${validLeadRes.status}`);

  // 3. Spambot Honeypot Detection
  const botPayload = { ...validLeadPayload, honeypot: 'http://spam-link.ru' };
  const botRes = await fetch(`${BASE_URL}/api/leads`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Forwarded-For': '198.51.100.11'
    },
    body: JSON.stringify(botPayload)
  });
  // Should reject spam or silently discard (400 or 422)
  assert(botRes.status === 400 || botRes.status === 422, `Spambot with populated honeypot rejected with HTTP ${botRes.status}`);

  // 4. Analytics Event Tracking
  const trackRes = await fetch(`${BASE_URL}/api/analytics/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: 'page_view',
      session_id: 'test-session-mp07',
      page_path: '/properties',
      properties: { test: true }
    })
  });
  assert(trackRes.status === 200 || trackRes.status === 204, `Analytics tracking accepted with HTTP ${trackRes.status}`);

  // --- FINAL AUDIT SUMMARY ---
  console.log('\n===============================================================');
  console.log(` AUDIT COMPLETE: ${passedChecks} PASSED, ${failedChecks} FAILED`);
  console.log('===============================================================');

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runAudit();
