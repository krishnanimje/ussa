// Automated End-to-End User Journey Test Runner
// Validates all flows from app.e2e.ts and Master Prompts against the live server

const BASE_URL = 'http://localhost:4321';

async function runE2E() {
  console.log('===============================================================');
  console.log(' AUTOMATED END-TO-END USER JOURNEY VERIFICATION');
  console.log('===============================================================\n');

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

  try {
    // Flow 1: Home page branding, DRE, broker, and nav
    console.log('--- FLOW 1: Homepage Credentials & Navigation ---');
    const homeRes = await fetch(`${BASE_URL}/`);
    const homeHtml = await homeRes.text();
    assert(homeRes.status === 200, 'Homepage returns HTTP 200');
    assert(homeHtml.includes('02375273'), 'Homepage displays California DRE #02375273');
    assert(homeHtml.includes('Full Circle Group'), 'Homepage displays Full Circle Group brokerage');
    assert(homeHtml.includes('href="/properties"'), 'Navigation contains link to /properties');
    assert(homeHtml.includes('href="/va-loans"'), 'Navigation contains link to /va-loans');
    assert(homeHtml.includes('href="/es"'), 'Language switcher contains link to Spanish /es');

    // Flow 2: Properties Catalog & Filters
    console.log('\n--- FLOW 2: Property Listings & Facets ---');
    const propRes = await fetch(`${BASE_URL}/properties`);
    const propHtml = await propRes.text();
    assert(propRes.status === 200, 'Properties catalog returns HTTP 200');
    assert(propHtml.includes('property-card') || propHtml.includes('property-grid'), 'Property cards are rendered');
    assert(propHtml.includes('Restored Spanish Revival'), 'Includes featured property title');

    // Flow 3: Property Detail & Interactive Amortization Calculator
    console.log('\n--- FLOW 3: Property Detail Showcase & Mortgage Calculator ---');
    const detailRes = await fetch(`${BASE_URL}/properties/north-park-spanish-revival`);
    const detailHtml = await detailRes.text();
    assert(detailRes.status === 200, 'Detail page returns HTTP 200');
    assert(detailHtml.includes('Restored Spanish Revival'), 'Detail page displays property title');
    assert(detailHtml.includes('calculator') || detailHtml.includes('calc-form') || detailHtml.includes('mortgage'), 'Mortgage calculator is embedded');
    assert(detailHtml.includes('SingleFamilyResidence'), 'Contains SingleFamilyResidence JSON-LD schema');

    // Flow 4: Lead Form Intake & Validation
    console.log('\n--- FLOW 4: Lead Capture Submission & CRM Flow ---');
    const leadPayload = {
      name: 'E2E Test Buyer',
      email: 'e2e.buyer@example.com',
      phone: '(619) 555-9012',
      inquiry_type: 'buy',
      message: 'Looking for a 3-bedroom home near Balboa Park.',
      preferred_contact: 'phone',
      timeline: 'immediate',
      budget_range: '$1,200,000'
    };
    const leadRes = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.55'
      },
      body: JSON.stringify(leadPayload)
    });
    assert(leadRes.status === 200, `Lead submission processed with HTTP 200 (Got ${leadRes.status})`);
    const leadJson = await leadRes.json();
    assert(leadJson.success === true, 'Lead submission response has success: true');
    assert(typeof leadJson.leadId === 'string', `Received assigned lead ID: ${leadJson.leadId}`);

    // Flow 5: Spanish Route & Multilingual Mirror
    console.log('\n--- FLOW 5: Spanish Counterpart Flow ---');
    const esRes = await fetch(`${BASE_URL}/es`);
    const esHtml = await esRes.text();
    assert(esRes.status === 200, 'Spanish homepage returns HTTP 200');
    assert(esHtml.includes('lang="es"'), 'Spanish page sets html lang="es"');
    assert(esHtml.includes('inmobiliaria') || esHtml.includes('Bienes Raíces'), 'Spanish page contains localized real estate copy');

    // Flow 6: Weekend Open Houses
    console.log('\n--- FLOW 6: Open House Schedule & RSVP ---');
    const ohRes = await fetch(`${BASE_URL}/open-houses`);
    const ohHtml = await ohRes.text();
    assert(ohRes.status === 200, 'Open houses page returns HTTP 200');
    assert(ohHtml.includes('San Diego Open Houses'), 'Displays open houses header');

    // Flow 7: Admin Protection Gate
    console.log('\n--- FLOW 7: Admin Security Gate ---');
    const adminRes = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    assert(adminRes.status === 302 || adminRes.status === 403, `Admin area redirects anonymous visitor with HTTP ${adminRes.status}`);

    // Flow 8: Infrastructure Health Probe
    console.log('\n--- FLOW 8: Health Probe (/api/health) ---');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert(healthRes.status === 200, 'Healthcheck probe returns HTTP 200');
    const healthJson = await healthRes.json();
    assert(healthJson.status === 'healthy', 'Healthcheck status is healthy');
    assert(typeof healthJson.uptimeSeconds === 'number', `Server uptime: ${healthJson.uptimeSeconds}s`);

    console.log('\n===============================================================');
    console.log(` E2E RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal E2E error:', err);
    process.exit(1);
  }
}

runE2E();
