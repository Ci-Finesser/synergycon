#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('🔍 Verifying database schema...\n');

  // Check verify_schema_integrity function
  const { data: schemaResult, error: schemaError } = await supabase.rpc('verify_schema_integrity');
  if (schemaError) {
    console.log('❌ Schema verification error:', schemaError.message);
  } else {
    console.log('📋 Schema Verification Results:');
    schemaResult.forEach(row => {
      const icon = row.status === 'PASS' ? '✅' : row.status === 'WARN' ? '⚠️' : '❌';
      console.log(`  ${icon} ${row.check_name}: ${row.status} - ${row.details}`);
    });
  }

  // Check dashboard stats function
  const { data: dashData, error: dashError } = await supabase.rpc('get_dashboard_stats');
  if (dashError) {
    console.log('\n❌ Dashboard stats error:', dashError.message);
  } else {
    console.log('\n📊 Dashboard Stats:');
    console.log(JSON.stringify(dashData, null, 2));
  }

  // List tables
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name');
  
  if (!tablesError && tables) {
    console.log('\n📁 Tables in database:');
    console.log(tables.map(t => `  - ${t.table_name}`).join('\n'));
  }
}

verify().catch(console.error);
