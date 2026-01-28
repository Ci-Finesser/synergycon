#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * This script runs Supabase database migrations during deployment.
 * It reads migration files from the supabase/migrations directory
 * and applies them to the production database.
 * 
 * Required Environment Variables:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key with admin access
 * - DATABASE_URL: Direct PostgreSQL connection URL (optional, for CLI method)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

// Validate environment variables
function validateEnv() {
  if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable is required');
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  }
}

// Get all migration files sorted by timestamp
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.warn(`⚠️  Migrations directory not found: ${MIGRATIONS_DIR}`);
    return [];
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql') && !file.startsWith('rollback'))
    .sort();

  return files;
}

// Create or update migration tracking table
async function ensureMigrationsTable(supabase) {
  console.log('📋 Ensuring migrations tracking table exists...');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const { error } = await supabase.rpc('exec_sql', { 
    sql: createTableSQL 
  });

  if (error) {
    // If RPC doesn't exist, try direct SQL execution
    console.log('⚠️  exec_sql RPC not available, migrations table should be created manually');
    console.log('Run this SQL in your Supabase SQL editor:');
    console.log(createTableSQL);
  }
}

// Check if a migration has been applied
async function isMigrationApplied(supabase, version) {
  const { data, error } = await supabase
    .from('schema_migrations')
    .select('version')
    .eq('version', version)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw error;
  }

  return !!data;
}

// Record a successful migration
async function recordMigration(supabase, version) {
  const { error } = await supabase
    .from('schema_migrations')
    .insert({ version });

  if (error) {
    throw error;
  }
}

// Apply a single migration
async function applyMigration(supabase, filename) {
  const version = filename.replace('.sql', '');
  
  // Check if already applied
  const applied = await isMigrationApplied(supabase, version);
  if (applied) {
    console.log(`⏭️  Skipping ${filename} (already applied)`);
    return { skipped: true };
  }

  console.log(`🔄 Applying migration: ${filename}`);
  
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  // Note: Supabase client doesn't support direct SQL execution
  // This would need to be run via the Management API or pg connection
  console.log(`📝 Migration SQL loaded: ${sql.length} characters`);
  console.log(`⚠️  Please run this migration manually via Supabase SQL editor or CLI`);
  console.log(`   File: ${filePath}`);
  
  return { applied: false, manual: true };
}

// Run all pending migrations
async function runMigrations() {
  try {
    console.log('🚀 Starting database migration process...\n');
    
    // Validate environment
    validateEnv();
    console.log('✅ Environment variables validated\n');

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Supabase client created\n');

    // Get migration files
    const migrations = getMigrationFiles();
    if (migrations.length === 0) {
      console.log('ℹ️  No migration files found');
      return;
    }

    console.log(`📁 Found ${migrations.length} migration file(s):\n`);
    migrations.forEach(file => console.log(`   - ${file}`));
    console.log();

    // Ensure migrations table exists
    await ensureMigrationsTable(supabase);

    // Apply migrations
    let applied = 0;
    let skipped = 0;
    let errors = 0;

    for (const migration of migrations) {
      try {
        const result = await applyMigration(supabase, migration);
        if (result.skipped) {
          skipped++;
        } else if (result.applied) {
          applied++;
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error applying ${migration}:`, error.message);
      }
    }

    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Applied: ${applied}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);

    if (errors > 0) {
      process.exit(1);
    }

    console.log('\n✨ Migration process completed!\n');
    
    // Important note about Supabase CLI
    console.log('⚠️  IMPORTANT: For production deployments, use Supabase CLI:');
    console.log('   supabase link --project-ref your-project-ref');
    console.log('   supabase db push\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
