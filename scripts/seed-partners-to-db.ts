#!/usr/bin/env node
/**
 * Seed Partners to Database (Truncate & Insert)
 * 
 * This script:
 * 1. Truncates (deletes all) existing partners from the database
 * 2. Inserts the new partners from the constants file
 * 
 * Usage:
 *   node --import tsx scripts/seed-partners-to-db.ts
 *   # or
 *   pnpm run db:seed:partners
 * 
 * Options:
 *   --dry-run    Show what would be done without making changes
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { PARTNERS_DATA, type PartnerData } from '../lib/constants/data/partners.js'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')

/**
 * Map constants data to database schema
 */
function mapToDbSchema(partner: PartnerData): Record<string, unknown> {
  return {
    name: partner.name,
    logo_url: partner.logo_url,
    website: partner.website,
    description: partner.description,
    bio: partner.bio,
    tier: partner.tier,
    category: partner.category,
    sub_category: partner.sub_category,
    contact_email: partner.contact_email,
    featured: partner.featured,
    display_order: partner.display_order,
    status: partner.status,
  }
}

async function main() {
  console.log('🤝 Partner Database Sync Script')
  console.log(isDryRun ? '   [DRY RUN MODE]' : '')
  console.log('')
  
  // Load partners from constants file
  console.log('📄 Loading partners from constants file...')
  const partners = PARTNERS_DATA as PartnerData[]
  console.log(`   Found ${partners.length} partners in constants file`)
  
  // Count by tier
  const tierCounts = partners.reduce((acc, p) => {
    acc[p.tier] = (acc[p.tier] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  for (const [tier, count] of Object.entries(tierCounts)) {
    console.log(`   - ${tier}: ${count}`)
  }
  
  // Check current database state
  console.log('')
  console.log('📊 Checking current database state...')
  const { data: existing, error: countError } = await supabase
    .from('partners')
    .select('id, name, tier')
  
  if (countError) {
    if (countError.message.includes('does not exist') || countError.message.includes('schema cache')) {
      console.log('   ⚠️  Partners table does not exist yet')
      console.log('   Run migrations first: pnpm migrate')
      process.exit(1)
    }
    console.error('❌ Error fetching current partners:', countError.message)
    process.exit(1)
  }
  
  console.log(`   Current partners in database: ${existing?.length || 0}`)
  
  // Show comparison
  if (existing && existing.length > 0) {
    const dbTierCounts = existing.reduce((acc, p) => {
      acc[p.tier] = (acc[p.tier] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('')
    console.log('📋 Comparison:')
    console.log('   Tier            | DB   | File')
    console.log('   ----------------|------|------')
    const allTiers = new Set([...Object.keys(tierCounts), ...Object.keys(dbTierCounts)])
    for (const tier of allTiers) {
      const dbCount = dbTierCounts[tier] || 0
      const fileCount = tierCounts[tier] || 0
      const marker = dbCount !== fileCount ? ' ←' : ''
      console.log(`   ${tier.padEnd(15)} | ${String(dbCount).padStart(4)} | ${String(fileCount).padStart(4)}${marker}`)
    }
  }
  
  if (isDryRun) {
    console.log('')
    console.log('🔍 Dry run complete. Partners that would be inserted:')
    for (const partner of partners.slice(0, 5)) {
      console.log(`   - ${partner.name} (${partner.tier})`)
    }
    if (partners.length > 5) {
      console.log(`   ... and ${partners.length - 5} more`)
    }
    console.log('')
    console.log('Run without --dry-run to execute.')
    return
  }
  
  // Truncate existing data
  console.log('')
  console.log('🗑️  Truncating partners table...')
  const { error: deleteError, count: deleteCount } = await supabase
    .from('partners')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all (trick to delete everything)
    .select('*', { count: 'exact' })
    .then(response => response)
  
  if (deleteError) {
    console.error('❌ Error truncating partners:', deleteError.message)
    process.exit(1)
  }
  console.log(`   ✅ Deleted ${deleteCount || existing?.length || 0} existing records`)
  
  // Insert new partners in batches
  console.log('')
  console.log('📥 Inserting new partners...')
  
  const BATCH_SIZE = 50
  let inserted = 0
  
  for (let i = 0; i < partners.length; i += BATCH_SIZE) {
    const batch = partners.slice(i, i + BATCH_SIZE).map(mapToDbSchema)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    
    const { error: insertError } = await supabase
      .from('partners')
      .insert(batch)
    
    if (insertError) {
      console.error(`❌ Error inserting batch ${batchNum}:`, insertError.message)
      process.exit(1)
    }
    
    inserted += batch.length
    console.log(`   ✅ Inserted batch ${batchNum} (${batch.length} records)`)
  }
  
  // Verify insertion
  console.log('')
  console.log('🔍 Verifying insertion...')
  const { data: finalData, error: finalError } = await supabase
    .from('partners')
    .select('id')
  
  if (finalError) {
    console.error('❌ Error verifying:', finalError.message)
  } else {
    console.log(`   Partners in database: ${finalData?.length || 0}`)
  }
  
  // Summary
  console.log('')
  console.log('📊 Summary')
  console.log(`   Deleted:  ${deleteCount || existing?.length || 0} records`)
  console.log(`   Inserted: ${inserted} records`)
  console.log(`   Final:    ${finalData?.length || 0} records in database`)
  
  console.log('')
  console.log('✅ Partner database sync complete!')
}

main().catch(console.error)
