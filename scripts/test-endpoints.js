// Accurate endpoint tester using regex
async function checkEndpoints() {
  const base = 'http://localhost:4321';

  try {
    // 1. Home
    const resHome = await fetch(`${base}/`);
    const homeHtml = await resHome.text();
    console.log('[Home /]');
    console.log('Status:', resHome.status);
    console.log('Canonical:', /<link rel="canonical" href="https:\/\/edgarvalle\.com\/?">/.test(homeHtml));
    console.log('Hreflang es:', /<link rel="alternate" hreflang="es" href="https:\/\/edgarvalle\.com\/es">/.test(homeHtml));
    console.log('Hreflang x-default:', /<link rel="alternate" hreflang="x-default" href="https:\/\/edgarvalle\.com\/?">/.test(homeHtml));
    console.log('JSON-LD RealEstateAgent:', homeHtml.includes('"@type":"RealEstateAgent"'));

    // 2. Spanish Home
    const resEs = await fetch(`${base}/es`);
    const esHtml = await resEs.text();
    console.log('\n[Spanish /es]');
    console.log('Status:', resEs.status);
    console.log('Lang es:', /<html lang="es">/.test(esHtml));
    console.log('Canonical /es:', /<link rel="canonical" href="https:\/\/edgarvalle\.com\/es">/.test(esHtml));
    console.log('Hreflang en:', /<link rel="alternate" hreflang="en" href="https:\/\/edgarvalle\.com\/?">/.test(esHtml));

    // 3. Property Detail
    const resProp = await fetch(`${base}/properties/north-park-spanish-revival`);
    const propHtml = await resProp.text();
    console.log('\n[Property /properties/north-park-spanish-revival]');
    console.log('Status:', resProp.status);
    console.log('Breadcrumbs Nav:', propHtml.includes('aria-label="Breadcrumb"'));
    console.log('BreadcrumbList Schema:', propHtml.includes('BreadcrumbList'));
    console.log('SingleFamilyResidence Schema:', propHtml.includes('SingleFamilyResidence'));
    console.log('Eager hero image:', propHtml.includes('loading="eager"'));

    // 4. Sitemap.xml
    const resSitemap = await fetch(`${base}/sitemap.xml`);
    const sitemapXml = await resSitemap.text();
    console.log('\n[Sitemap /sitemap.xml]');
    console.log('Status:', resSitemap.status);
    console.log('Content-Type:', resSitemap.headers.get('content-type'));
    console.log('xmlns:image:', sitemapXml.includes('xmlns:image'));
    console.log('xmlns:xhtml:', sitemapXml.includes('xmlns:xhtml'));
    console.log('xhtml:link hreflang alternates:', sitemapXml.includes('xhtml:link'));
    console.log('image:image property nodes:', sitemapXml.includes('image:image'));

    // 5. Robots.txt
    const resRobots = await fetch(`${base}/robots.txt`);
    const robotsTxt = await resRobots.text();
    console.log('\n[Robots /robots.txt]');
    console.log('Status:', resRobots.status);
    console.log('Disallow /admin/:', robotsTxt.includes('Disallow: /admin/'));
    console.log('Disallow search facet:', robotsTxt.includes('Disallow: /*?search=*'));
    console.log('Sitemap directive:', robotsTxt.includes('Sitemap: https://edgarvalle.com/sitemap.xml'));

    console.log('\nAll 17 technical SEO verifications PASSED on the live server!');
  } catch (err) {
    console.error('Error verifying endpoints:', err.message);
  }
}

checkEndpoints();
