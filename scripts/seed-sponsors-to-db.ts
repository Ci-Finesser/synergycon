#!/usr/bin/env node
/**
 * Seed Sponsors to Database (Truncate & Insert)
 * 
 * This script:
 * 1. Truncates (deletes all) existing sponsors from the database
 * 2. Inserts the new sponsors from the constants file
 * 
 * Usage:
 *   node --import tsx scripts/seed-sponsors-to-db.ts
 *   # or
 *   pnpm run db:seed:sponsors
 * 
 * Options:
 *   --dry-run    Show what would be done without making changes
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { SPONSORS_DATA } from '../lib/constants/data/sponsors.js'

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

interface SponsorFromFile {
  id: string
  name: string
  logo_url: string | null
  website?: string | null
  website_url?: string | null
  description: string | null
  bio?: string | null
  tier: string
  category?: string
  sub_category?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  featured?: boolean
  display_order?: number
  status?: string
  created_at?: string
  updated_at?: string
  application_id?: string | null
  user_id?: string | null
}

/**
 * Map constants data to database schema
 */
function mapToDbSchema(sponsor: SponsorFromFile): Record<string, unknown> {
  return {
    name: sponsor.name,
    logo_url: sponsor.logo_url,
    description: sponsor.description,
    bio: sponsor.bio,
    tier: sponsor.tier,
    category: sponsor.category,
    sub_category: sponsor.sub_category,
    contact_email: sponsor.contact_email,
    contact_phone: sponsor.contact_phone,
    featured: sponsor.featured ?? false,
    display_order: sponsor.display_order ?? 0,
    status: sponsor.status ?? 'live',
  }
}

async function main() {
  console.log('🎯 Sponsor Database Sync Script')
  console.log(isDryRun ? '   [DRY RUN MODE]' : '')
  console.log('')
  
  // Load sponsors from constants file
  console.log('📄 Loading sponsors from constants file...')
  const sponsors = SPONSORS_DATA as unknown as SponsorFromFile[]
  console.log(`   Found ${sponsors.length} sponsors in constants file`)
  
  // Count by tier
  const tierCounts = sponsors.reduce((acc, s) => {
    acc[s.tier] = (acc[s.tier] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  for (const [tier, count] of Object.entries(tierCounts)) {
    console.log(`   - ${tier}: ${count}`)
  }
  
  // Check current database state
  console.log('')
  console.log('📊 Checking current database state...')
  const { data: existing, error: countError } = await supabase
    .from('sponsors')
    .select('id, name, tier')
  
  if (countError) {
    if (countError.message.includes('does not exist') || countError.message.includes('schema cache')) {
      console.log('   ⚠️  Sponsors table does not exist yet')
      console.log('   Run migrations first: pnpm migrate')
      process.exit(1)
    }
    console.error('❌ Error fetching current sponsors:', countError.message)
    process.exit(1)
  }
  
  console.log(`   Current sponsors in database: ${existing?.length || 0}`)
  
  // Show comparison
  if (existing && existing.length > 0) {
    const dbTierCounts = existing.reduce((acc, s) => {
      acc[s.tier] = (acc[s.tier] || 0) + 1
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
    
    // Show name comparison
    console.log('')
    console.log('📝 Sponsors in file:')
    for (const sponsor of sponsors) {
      const inDb = existing.find(e => e.name === sponsor.name)
      const marker = inDb ? '✓' : '+'
      console.log(`   ${marker} ${sponsor.name} (${sponsor.tier})`)
    }
    
    const fileNames = new Set(sponsors.map(s => s.name))
    const onlyInDb = existing.filter(e => !fileNames.has(e.name))
    if (onlyInDb.length > 0) {
      console.log('')
      console.log('⚠️  Only in database (will be deleted):')
      for (const sponsor of onlyInDb) {
        console.log(`   - ${sponsor.name} (${sponsor.tier})`)
      }
    }
  }
  
  if (isDryRun) {
    console.log('')
    console.log('🔍 Dry run complete. Sponsors that would be inserted:')
    for (const sponsor of sponsors.slice(0, 5)) {
      console.log(`   - ${sponsor.name} (${sponsor.tier})`)
    }
    if (sponsors.length > 5) {
      console.log(`   ... and ${sponsors.length - 5} more`)
    }
    console.log('')
    console.log('Run without --dry-run to execute.')
    return
  }
  
  // Truncate existing data
  console.log('')
  console.log('🗑️  Truncating sponsors table...')
  const { error: deleteError, count: deleteCount } = await supabase
    .from('sponsors')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all (trick to delete everything)
    .select('*', { count: 'exact' })
  
  if (deleteError) {
    console.error('❌ Error truncating sponsors:', deleteError.message)
    process.exit(1)
  }
  console.log(`   ✅ Deleted ${deleteCount || existing?.length || 0} existing records`)
  
  // Insert new sponsors in batches
  console.log('')
  console.log('📥 Inserting new sponsors...')
  
  const BATCH_SIZE = 50
  let inserted = 0
  
  for (let i = 0; i < sponsors.length; i += BATCH_SIZE) {
    const batch = sponsors.slice(i, i + BATCH_SIZE).map(mapToDbSchema)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    
    const { error: insertError } = await supabase
      .from('sponsors')
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
    .from('sponsors')
    .select('id')
  
  if (finalError) {
    console.error('❌ Error verifying:', finalError.message)
  } else {
    console.log(`   Sponsors in database: ${finalData?.length || 0}`)
  }
  
  // Summary
  console.log('')
  console.log('📊 Summary')
  console.log(`   Deleted:  ${deleteCount || existing?.length || 0} records`)
  console.log(`   Inserted: ${inserted} records`)
  console.log(`   Final:    ${finalData?.length || 0} records in database`)
  
  console.log('')
  console.log('✅ Sponsor database sync complete!')
}

main().catch(console.error)
