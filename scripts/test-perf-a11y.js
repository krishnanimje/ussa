/**
 * Live Performance, Caching, Responsiveness and Accessibility (WCAG 2.2 AA) Verification
 */
const BASE_URL = process.env.TEST_URL || 'http://localhost:4321';

async function runAudit() {
  console.log('--- STARTING PERFORMANCE, ANIMATION, RESPONSIVENESS & ACCESSIBILITY AUDIT ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Public Marketing Page Cache-Control & Performance
    const homeRes = await fetch(`${BASE_URL}/`);
    assert(homeRes.status === 200, 'Homepage returns 200 OK');
    const homeCache = homeRes.headers.get('Cache-Control') || '';
    assert(homeCache.includes('public') && homeCache.includes('max-age=300'), `Public homepage has stale-while-revalidate caching (${homeCache})`);

    const homeHtml = await homeRes.text();
    assert(homeHtml.includes('rel="preconnect" href="https://fonts.googleapis.com"'), 'Google Fonts preconnect present in <head>');
    assert(homeHtml.includes('fonts.gstatic.com'), 'Google Fonts gstatic preconnect present');
    assert(homeHtml.includes('class="skip-link"') && homeHtml.includes('href="#mainContent"'), 'Skip to main content link present for keyboard users');
    assert(homeHtml.includes('class="site-header"') && homeHtml.includes('role="banner"'), 'Semantic <header> with role="banner" landmark present');
    assert(homeHtml.includes('id="mainContent"'), 'Semantic <main id="mainContent"> landmark present');
    assert(homeHtml.includes('role="contentinfo"'), 'Semantic <footer> with role="contentinfo" landmark present');
    assert(homeHtml.includes('hero-stagger-1') && homeHtml.includes('hero-stagger-2'), 'Hero entrance animation classes present');
    assert(homeHtml.includes('reveal-on-scroll'), 'Scroll-triggered section reveals present');

    // 2. Mobile Navigation ARIA & Dialog Accessibility
    assert(homeHtml.includes('id="mobileMenuBtn"'), 'Mobile menu toggle button present');
    assert(homeHtml.includes('aria-expanded="false"'), 'Mobile menu button has aria-expanded="false" by default');
    assert(homeHtml.includes('aria-controls="mobileDrawer"'), 'Mobile menu button references mobileDrawer');
    assert(homeHtml.includes('id="mobileDrawer"') && homeHtml.includes('role="dialog"') && homeHtml.includes('aria-modal="true"'), 'Mobile drawer is an accessible modal dialog');

    // 3. Public Static Endpoint Caching (stale-while-revalidate)
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const sitemapCache = sitemapRes.headers.get('Cache-Control') || '';
    assert(sitemapCache.includes('public') && sitemapCache.includes('stale-while-revalidate'), `Public sitemap has public cache headers with stale-while-revalidate (${sitemapCache})`);

    // 4. Private Response Isolation (Do not cache private responses publicly)
    const adminLoginRes = await fetch(`${BASE_URL}/admin/login`);
    const adminCache = adminLoginRes.headers.get('Cache-Control') || '';
    assert(adminCache.includes('private') && adminCache.includes('no-store'), `Admin route strictly enforces private no-store (${adminCache})`);

    const leadsApiRes = await fetch(`${BASE_URL}/api/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    const leadsCache = leadsApiRes.headers.get('Cache-Control') || '';
    assert(leadsCache.includes('private') && leadsCache.includes('no-store'), `API lead submission enforces private no-store (${leadsCache})`);

    // 5. Property Detail Page Performance & Lightbox Accessibility
    const propRes = await fetch(`${BASE_URL}/properties/north-park-spanish-revival`);
    assert(propRes.status === 200, 'Property detail page returns 200 OK');
    const propHtml = await propRes.text();
    assert(propHtml.includes('id="mainGalleryImg"'), 'Primary hero image frame present');
    assert(propHtml.includes('loading="eager"') && propHtml.includes('fetchpriority="high"'), 'Hero property image has loading="eager" and fetchpriority="high"');
    assert(propHtml.includes('id="lightboxModal"') && propHtml.includes('role="dialog"') && propHtml.includes('aria-modal="true"'), 'Property photo lightbox has role="dialog" and aria-modal="true"');
    assert(propHtml.includes('Print Feature Sheet (PDF)'), 'Flyer print action available on detail page');

    // 6. Spanish Vertical Responsiveness & Landmark Verification
    const esVaRes = await fetch(`${BASE_URL}/es/prestamos-va`);
    assert(esVaRes.status === 200, 'Spanish VA loans page returns 200 OK');
    const esVaHtml = await esVaRes.text();
    assert(esVaHtml.includes('lang="es"'), 'Spanish page has lang="es"');
    assert(esVaHtml.includes('role="banner"') && esVaHtml.includes('role="contentinfo"'), 'Spanish page inherits header and footer landmarks');

    console.log('\n======================================================');
    console.log(`PERFORMANCE & ACCESSIBILITY AUDIT: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Audit failed with error:', err);
    process.exit(1);
  }
}

runAudit();
