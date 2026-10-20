const fs = require('fs');
const path = require('path');

const files = [
  '20261018000001_initial_schema.sql',
  '20261018000002_rls_policies.sql',
  '20261019000004_property_cms_extensions.sql',
  '20261019000005_analytics_and_crm_bi.sql',
  '20261019000006_security_privacy_and_compliance.sql',
  '20261018000003_seed_data.sql'
];

let fullSql = '-- =====================================================================\n';
fullSql += '-- EDGAR VALLE REAL ESTATE PLATFORM — COMPLETE SUPABASE DATABASE SETUP\n';
fullSql += '-- Run this entire file in Supabase Dashboard -> SQL Editor -> New Query\n';
fullSql += '-- =====================================================================\n\n';

for (const file of files) {
  const filePath = path.join(process.cwd(), 'supabase', 'migrations', file);
  fullSql += '\n-- >>>>>>>>>>>>>> MIGRATION: ' + file + ' <<<<<<<<<<<<<<\n';
  fullSql += fs.readFileSync(filePath, 'utf-8') + '\n';
}

const outputPath1 = path.join(process.cwd(), 'supabase', 'complete_setup.sql');
const outputPath2 = path.join(process.cwd(), 'supabase', 'setup_database.sql');
fs.writeFileSync(outputPath1, fullSql, 'utf-8');
fs.writeFileSync(outputPath2, fullSql, 'utf-8');
console.log('Successfully generated complete_setup.sql & setup_database.sql, total size:', (fullSql.length / 1024).toFixed(1), 'KB');
