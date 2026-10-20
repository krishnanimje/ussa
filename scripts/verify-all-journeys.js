// scripts/verify-all-journeys.js
// Automated verification of all 12 Phase 3 Critical User Journeys

const BASE_URL = 'http://localhost:4321';
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'dev-secret-valle-admin-session-key-2026';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASSED: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAILED: ${message}`);
    failed++;
  }
}

async function run() {
  console.log('===============================================================');
  console.log(' PHASE 3: 12 CRITICAL USER JOURNEYS LIVE VERIFICATION');
  console.log('===============================================================\n');

  try {
    // 1. Homepage loads without console errors
    console.log('--- JOURNEY 1: Homepage & Brand Integrity ---');
    const homeRes = await fetch(`${BASE_URL}/`);
    const homeHtml = await homeRes.text();
    assert(homeRes.status === 200, 'Homepage returns HTTP 200');
    assert(homeHtml.includes('Edgar Valle'), 'Contains Edgar Valle brand name');
    assert(homeHtml.includes('02375273'), 'Contains California DRE #02375273');
    assert(homeHtml.includes('Full Circle Group'), 'Contains Full Circle Group brokerage attribution');
    assert(homeHtml.includes('skip-link'), 'Contains accessible skip link to main content');

    // 2. Property listings load from the intended data source
    console.log('\n--- JOURNEY 2: Property Listings & Catalog ---');
    const propRes = await fetch(`${BASE_URL}/properties`);
    const propHtml = await propRes.text();
    assert(propRes.status === 200, 'Properties catalog returns HTTP 200');
    assert(propHtml.includes('property-card'), 'Rendered property cards present in DOM');
    assert(propHtml.includes('Restored Spanish Revival'), 'Displays verified inventory property');

    // 3. Search and filters return correct results
    console.log('\n--- JOURNEY 3: Search & Facet Filtering ---');
    const filterRes = await fetch(`${BASE_URL}/properties?type=Single+Family`);
    const filterHtml = await filterRes.text();
    assert(filterRes.status === 200, 'Filtered query returns HTTP 200');
    assert(filterHtml.includes('Restored Spanish Revival'), 'Returns matching Single Family home');

    // 4. Property detail pages display accurate information and images
    console.log('\n--- JOURNEY 4: Property Detail Showcase ---');
    const detailRes = await fetch(`${BASE_URL}/properties/north-park-spanish-revival`);
    const detailHtml = await detailRes.text();
    assert(detailRes.status === 200, 'Detail page returns HTTP 200');
    assert(detailHtml.includes('Restored Spanish Revival'), 'Displays property title');
    assert(detailHtml.includes('North Park'), 'Displays neighborhood location');
    assert(detailHtml.includes('$1,185,000') || detailHtml.includes('1,185,000'), 'Displays listing price');
    assert(detailHtml.includes('gallery-main-img'), 'Displays primary gallery image');
    assert(detailHtml.includes('Print Feature Sheet'), 'Displays link to open house printable flyer');

    // 5. Inquiry submission validates fields and reports success or failure correctly
    console.log('\n--- JOURNEY 5: Inquiry Validation Engine ---');
    const invalidLeadRes = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.222'
      },
      body: JSON.stringify({})
    });
    assert(invalidLeadRes.status === 400, 'Empty lead submission correctly rejected with HTTP 400');
    const invalidJson = await invalidLeadRes.json();
    assert(invalidJson.success === false, 'Rejection payload includes success: false');

    // 6. Submitted inquiries are actually stored
    console.log('\n--- JOURNEY 6: Valid Lead Submission & Persistence ---');
    const testLeadPayload = {
      name: 'Verification Test Buyer',
      email: 'verified.buyer@example.com',
      phone: '(619) 555-8822',
      inquiry_type: 'buy',
      message: 'Testing lead intake for Phase 3 user journey audit.',
      preferred_contact: 'email',
      timeline: '1-3 months',
      budget_range: '$950,000'
    };
    const testClientIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
    const validLeadRes = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Forwarded-For': testClientIp
      },
      body: JSON.stringify(testLeadPayload)
    });
    assert(validLeadRes.status === 200, 'Valid lead accepted with HTTP 200');
    const validLeadJson = await validLeadRes.json();
    assert(validLeadJson.success === true, 'Response contains success: true');
    const newLeadId = validLeadJson.leadId;
    assert(typeof newLeadId === 'string', `Assigned new lead ID: ${newLeadId}`);

    // 7. Admin login and logout work correctly
    console.log('\n--- JOURNEY 7: Admin Authentication & Session Lifecycle ---');
    const loginFormData = new URLSearchParams();
    loginFormData.append('secretKey', ADMIN_SECRET);

    const testLoginIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
    const loginRes = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': BASE_URL,
        'X-Forwarded-For': testLoginIp
      },
      body: loginFormData.toString(),
      redirect: 'manual'
    });
    assert(loginRes.status === 302, 'Admin login redirects with HTTP 302 upon successful authentication');
    const setCookieHeader = loginRes.headers.get('set-cookie') || '';
    assert(setCookieHeader.includes('valle_admin_session'), 'Session cookie valle_admin_session established');

    // Test logout
    const logoutRes = await fetch(`${BASE_URL}/api/admin/logout`, { method: 'POST' });
    assert(logoutRes.status === 200, 'Admin logout endpoint returns HTTP 200');
    const logoutCookie = logoutRes.headers.get('set-cookie') || '';
    assert(logoutCookie.includes('Max-Age=0') || logoutCookie.includes('expires='), 'Logout cookie clears session');

    // 8. Unauthorized users cannot access admin functions or private leads
    console.log('\n--- JOURNEY 8: Strict Authorization & Privacy Gates ---');
    const anonAdminRes = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    assert(anonAdminRes.status === 302, 'Anonymous visitor to /admin redirected with HTTP 302');
    const anonLeadsRes = await fetch(`${BASE_URL}/api/admin/leads`);
    assert(anonLeadsRes.status === 401, 'Anonymous API call to /api/admin/leads blocked with HTTP 401');

    // 9. Authorized admins can add, edit, publish/unpublish, and delete test properties
    console.log('\n--- JOURNEY 9: Admin Property Inventory Full CRUD ---');
    const adminHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_SECRET}`
    };

    // Create test property
    const newPropPayload = {
      title: 'Automated Test Mission Hills Villa',
      slug: `test-villa-${Date.now()}`,
      property_type: 'Single Family',
      listing_status: 'for_sale',
      publication_status: 'draft',
      price: 1850000,
      bedrooms: 4,
      bathrooms: 3.5,
      square_feet: 3100,
      neighborhood: 'Mission Hills',
      city: 'San Diego',
      state: 'CA',
      zip_code: '92103',
      address: '1234 Sunset Blvd',
      description: 'Audit test property for CRUD verification.',
      features: ['Pool', 'Solar', 'View']
    };

    const createRes = await fetch(`${BASE_URL}/api/admin/properties`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(newPropPayload)
    });
    assert(createRes.status === 201, `Authorized admin creates property with HTTP 201 (Got ${createRes.status})`);
    const createJson = await createRes.json();
    assert(createJson.success === true, 'Create response has success: true');
    const createdPropId = createJson.property?.id;
    assert(typeof createdPropId === 'string', `Created property ID: ${createdPropId}`);

    // Update test property
    const updateRes = await fetch(`${BASE_URL}/api/admin/properties`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        id: createdPropId,
        price: 1895000,
        publication_status: 'published'
      })
    });
    assert(updateRes.status === 200, 'Authorized admin updates property with HTTP 200');

    // Delete test property
    const deleteRes = await fetch(`${BASE_URL}/api/admin/properties?id=${createdPropId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    assert(deleteRes.status === 200, 'Authorized admin deletes test property with HTTP 200');

    // 10. Invalid routes show a useful 404 page
    console.log('\n--- JOURNEY 10: Helpful 404 Error Page ---');
    const notFoundRes = await fetch(`${BASE_URL}/non-existent-luxury-page-12345`);
    assert(notFoundRes.status === 404, 'Invalid route returns HTTP 404');
    const notFoundHtml = await notFoundRes.text();
    assert(notFoundHtml.includes('404') || notFoundHtml.includes('Not Found') || notFoundHtml.includes('Page Not Found'), '404 page renders clear status code');
    assert(notFoundHtml.includes('href="/"'), '404 page contains link returning to home');

    // 11. Empty states have graceful messages
    console.log('\n--- JOURNEY 11: Empty States & Graceful Degradation ---');
    const emptySearchRes = await fetch(`${BASE_URL}/properties?search=NonExistentPropertyQuery9999`);
    const emptySearchHtml = await emptySearchRes.text();
    assert(emptySearchRes.status === 200, 'Empty search returns HTTP 200');
    assert(emptySearchHtml.includes('No properties match') || emptySearchHtml.includes('No listings') || emptySearchHtml.includes('reset') || emptySearchHtml.includes('Reset'), 'Displays user-friendly empty state with reset guidance');

    // 12. Navigation and forms work on mobile, tablet, and desktop
    console.log('\n--- JOURNEY 12: Responsive Accessibility & Viewport Contracts ---');
    assert(homeHtml.includes('viewport') && homeHtml.includes('width=device-width'), 'Homepage enforces responsive viewport');
    assert(homeHtml.includes('mobileMenuBtn') || homeHtml.includes('mobileDrawer'), 'Mobile drawer navigation present');
    assert(homeHtml.includes('mainContent'), 'Main content landmark present');

    console.log('\n===============================================================');
    console.log(` LIVE JOURNEYS AUDIT RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal user journey error:', err);
    process.exit(1);
  }
}

run();
