// Live Security, OWASP Headers, and Status Code Verification Script
import http from 'node:http';

const BASE_URL = 'http://localhost:4321';

function fetchUrl(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runSecurityAudit() {
  console.log('--- STARTING LIVE SECURITY & OWASP VERIFICATION ---\n');
  let passCount = 0;
  let failCount = 0;

  function assert(label, condition) {
    if (condition) {
      console.log(`[PASS] ${label}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${label}`);
      failCount++;
    }
  }

  try {
    // 1. Security Headers on Homepage
    const home = await fetchUrl('/');
    assert('Homepage returns 200 OK', home.status === 200);
    assert('CSP header present', Boolean(home.headers['content-security-policy']));
    assert('X-Content-Type-Options: nosniff present', home.headers['x-content-type-options'] === 'nosniff');
    assert('X-Frame-Options: DENY present', home.headers['x-frame-options'] === 'DENY');
    assert('Strict-Transport-Security present', Boolean(home.headers['strict-transport-security']));
    assert('Referrer-Policy: strict-origin-when-cross-origin present', home.headers['referrer-policy'] === 'strict-origin-when-cross-origin');
    assert('Permissions-Policy present', Boolean(home.headers['permissions-policy']));
    assert('Cookie Consent Banner HTML present', home.body.includes('valleCookieBanner'));

    // 2. Unauthenticated Admin Protection
    const adminReq = await fetchUrl('/admin');
    assert('Unauthenticated /admin redirects (302) to /admin/login', adminReq.status === 302 && adminReq.headers.location === '/admin/login');

    const adminApiReq = await fetchUrl('/api/admin/leads');
    assert('Unauthenticated /api/admin/leads returns 401 Unauthorized', adminApiReq.status === 401);

    // 3. Branded HTTP Error Pages & Status Code Accuracy
    const err403 = await fetchUrl('/403');
    assert('HTTP 403 page returns status 403', err403.status === 403);
    assert('HTTP 403 does not leak stack trace', !err403.body.includes('Error:') && !err403.body.includes('at Function.') && !err403.body.includes('stack:'));

    const err404 = await fetchUrl('/404');
    assert('HTTP 404 page returns status 404', err404.status === 404);

    const err429 = await fetchUrl('/429');
    assert('HTTP 429 page returns status 429', err429.status === 429);

    const err500 = await fetchUrl('/500');
    assert('HTTP 500 page returns status 500', err500.status === 500);

    const err502 = await fetchUrl('/502');
    assert('HTTP 502 page returns status 502', err502.status === 502);

    const err503 = await fetchUrl('/503');
    assert('HTTP 503 page returns status 503', err503.status === 503);

    const err504 = await fetchUrl('/504');
    assert('HTTP 504 page returns status 504', err504.status === 504);

    const err505 = await fetchUrl('/505');
    assert('HTTP 505 page returns status 505', err505.status === 505);

    // 4. Server-Side Logout Execution
    const logout = await fetchUrl('/admin/logout');
    assert('/admin/logout redirects to login (302)', logout.status === 302);
    const setCookie = logout.headers['set-cookie'];
    const hasExpiredCookie = Array.isArray(setCookie) 
      ? setCookie.some(c => c.includes('Max-Age=0')) 
      : (setCookie && setCookie.includes('Max-Age=0'));
    assert('/admin/logout invalidates session via Set-Cookie Max-Age=0', Boolean(hasExpiredCookie));

    // 5. Anti-Spam Honeypot Verification on /api/leads
    const spamSubmission = await fetchUrl('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Spam Bot',
        email: 'spambot@example.com',
        phone: '6195550198',
        leadType: 'general_contact',
        _hp: 'http://malicious-spam.ru' // Honeypot filled
      })
    });
    assert('Honeypot-filled submission returns 400 Bad Request', spamSubmission.status === 400);
    assert('Spam error message returned', spamSubmission.body.includes('Automated spam submission detected'));

    // 6. California DRE Disclosures Page
    const disclosures = await fetchUrl('/disclosures');
    assert('/disclosures returns 200 OK', disclosures.status === 200);
    assert('Disclosures include California DRE #02375273', disclosures.body.includes('02375273'));
    assert('Disclosures include Full Circle Group brokerage', disclosures.body.includes('Full Circle Group'));
    assert('Disclosures include Fair Housing Act statement', disclosures.body.includes('Fair Housing Act'));
    assert('Disclosures include TILA-RESPA / Regulation Z', disclosures.body.includes('Regulation Z'));

    console.log(`\n========================================`);
    console.log(`LIVE AUDIT COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
    console.log(`========================================\n`);

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runSecurityAudit();
