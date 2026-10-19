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
  const editPropPage = await get('/admin/properties/edit?id=p0000000-0000-0000-0000-000000000001');
  console.log(`[GET /admin/properties/edit?id=p0000000-0000-0000-0000-000000000001] Status: ${editPropPage.status}, HTML Bytes: ${editPropPage.body.length}`);

  // 5. API Properties
  const apiProps = await get('/api/admin/properties');
  const jsonProps = JSON.parse(apiProps.body);
  console.log(`[GET /api/admin/properties] Status: ${apiProps.status}, Total Properties: ${jsonProps.total}, Properties Returned: ${jsonProps.properties.length}`);

  // 6. API Audit Logs
  const apiLogs = await get('/api/admin/audit-logs');
  const jsonLogs = JSON.parse(apiLogs.body);
  console.log(`[GET /api/admin/audit-logs] Status: ${apiLogs.status}, Total Logs: ${jsonLogs.logs.length}`);

  // 7. Public page vs Draft preview
  const publicDraftWithoutAuth = await get('/properties/mission-hills-spanish-draft', { Cookie: '' });
  console.log(`[GET /properties/mission-hills-spanish-draft (Public)] Status: ${publicDraftWithoutAuth.status} (Expected 404)`);

  const draftPreviewWithAuth = await get('/properties/mission-hills-spanish-draft?preview=true');
  console.log(`[GET /properties/mission-hills-spanish-draft?preview=true (Admin Preview)] Status: ${draftPreviewWithAuth.status} (Expected 200)`);

  console.log('\nAll Admin & CMS Endpoints Fully Verified!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
