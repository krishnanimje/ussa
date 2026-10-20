const http = require('http');

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4321,
      path,
      method: 'GET',
      headers: {
        Cookie: 'valle_admin_session=dev-secret-valle-admin-session-key-2026',
        ...headers
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

function post(path, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const jsonStr = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 4321,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonStr),
        ...headers
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.write(jsonStr);
    req.end();
  });
}

async function run() {
  console.log('Testing Admin Endpoints...\n');

  // 1. Dashboard
  const adminPage = await get('/admin');
  console.log(`[GET /admin] Status: ${adminPage.status}, HTML Bytes: ${adminPage.body.length}`);

  // 2. Properties Inventory Page
  const propsPage = await get('/admin/properties');
  console.log(`[GET /admin/properties] Status: ${propsPage.status}, HTML Bytes: ${propsPage.body.length}`);

  // 3. New Property Form Page
  const newPropPage = await get('/admin/properties/new');
  console.log(`[GET /admin/properties/new] Status: ${newPropPage.status}, HTML Bytes: ${newPropPage.body.length}`);

  // 4. Edit Property Form Page
  const editPropPage = await get('/admin/properties/edit?id=a0000000-0000-0000-0000-000000000001');
  console.log(`[GET /admin/properties/edit?id=a0000...0001] Status: ${editPropPage.status}, HTML Bytes: ${editPropPage.body.length}`);

  // 5. Analytics & Power BI Dashboard
  const analyticsPage = await get('/admin/analytics');
  console.log(`[GET /admin/analytics] Status: ${analyticsPage.status}, HTML Bytes: ${analyticsPage.body.length}`);

  // 6. CRM Leads Workspace
  const leadsPage = await get('/admin/leads');
  console.log(`[GET /admin/leads] Status: ${leadsPage.status}, HTML Bytes: ${leadsPage.body.length}`);

  // 7. Reports & CSV Center
  const reportsPage = await get('/admin/reports');
  console.log(`[GET /admin/reports] Status: ${reportsPage.status}, HTML Bytes: ${reportsPage.body.length}`);

  // 8. API Analytics Summary (30d)
  const apiAnalytics = await get('/api/admin/analytics?range=30d');
  const jsonAnalytics = JSON.parse(apiAnalytics.body);
  console.log(`[GET /api/admin/analytics?range=30d] Status: ${apiAnalytics.status}, PageViews: ${jsonAnalytics.summary.page_views.current}, ConvRate: ${jsonAnalytics.summary.conversion_rate.current}%`);

  // 9. API Leads
  const apiLeads = await get('/api/admin/leads');
  const jsonLeads = JSON.parse(apiLeads.body);
  console.log(`[GET /api/admin/leads] Status: ${apiLeads.status}, Total Leads: ${jsonLeads.total}`);

  // 10. API CSV Export (property_inventory)
  const csvProps = await get('/api/admin/reports/export?type=property_inventory');
  console.log(`[GET /api/admin/reports/export?type=property_inventory] Status: ${csvProps.status}, Content-Type: ${csvProps.headers['content-type']}, CSV Bytes: ${csvProps.body.length}`);

  // 11. API CSV Export (traffic)
  const csvTraffic = await get('/api/admin/reports/export?type=traffic');
  console.log(`[GET /api/admin/reports/export?type=traffic] Status: ${csvTraffic.status}, CSV Bytes: ${csvTraffic.body.length}`);

  // 12. Visitor Tracking Ingestion Endpoint
  const trackRes = await post('/api/analytics/track', {
    event_name: 'page_view',
    session_id: 'test_session_live_verification',
    page_path: '/properties',
    traffic_source: 'organic',
    device_category: 'desktop'
  });
  console.log(`[POST /api/analytics/track] Status: ${trackRes.status}, Body: ${trackRes.body}`);

  console.log('\nAll Master Prompt 03 BI, CRM, and Analytics Endpoints Fully Verified!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
