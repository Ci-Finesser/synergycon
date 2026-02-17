#!/usr/bin/env node
/**
 * Seed Speakers to Database (Truncate & Insert)
 * 
 * This script:
 * 1. Truncates (deletes all) existing speakers from the database
 * 2. Inserts the new speakers from the constants file
 * 
 * Usage:
 *   node --import tsx scripts/seed-speakers-to-db.ts
 *   # or
 *   pnpm run db:seed:speakers
 * 
 * Options:
 *   --dry-run    Show what would be done without making changes
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SPEAKERS_FILE = path.join(__dirname, '..', 'lib', 'constants', 'data', 'speakers.ts')

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')

interface SpeakerData {
  id: string
  name: string
  title: string | null
  bio: string | null
  image_url: string | null
  company: string | null
  linkedin_url: string | null
  twitter_url: string | null
  featured: boolean
  display_order: number
  topic: string
  instagram_url: string | null
  website_url: string | null
  event_day: number
  tags: string
  status: string
  application_id: string | null
  user_id: string | null
  position: number
  speaker_role: string
  confirmed: boolean
}

/**
 * Extract SPEAKERS_DATA array from TypeScript file
 */
function extractSpeakersData(): SpeakerData[] {
  if (!fs.existsSync(SPEAKERS_FILE)) {
    console.error(`❌ Speakers file not found: ${SPEAKERS_FILE}`)
    process.exit(1)
  }
  
  const content = fs.readFileSync(SPEAKERS_FILE, 'utf-8')
  
  // Find the SPEAKERS_DATA array
  const startMarker = 'export const SPEAKERS_DATA = '
  const startIdx = content.indexOf(startMarker)
  if (startIdx === -1) {
    console.error('❌ Could not find SPEAKERS_DATA in file')
    process.exit(1)
  }
  
  // Find the opening bracket
  const bracketStart = content.indexOf('[', startIdx)
  if (bracketStart === -1) {
    console.error('❌ Could not find array start')
    process.exit(1)
  }
  
  // Find matching closing bracket
  let depth = 0
  let bracketEnd = -1
  for (let i = bracketStart; i < content.length; i++) {
    if (content[i] === '[') depth++
    else if (content[i] === ']') {
      depth--
      if (depth === 0) {
        bracketEnd = i
        break
      }
    }
  }
  
  if (bracketEnd === -1) {
    console.error('❌ Could not find array end')
    process.exit(1)
  }
  
  const arrayContent = content.substring(bracketStart, bracketEnd + 1)
  
  try {
    return JSON.parse(arrayContent)
  } catch (e) {
    console.error('❌ Could not parse SPEAKERS_DATA:', e)
    process.exit(1)
  }
}

/**
 * Map constants data to database schema
 */
function mapToDbSchema(speaker: SpeakerData): Record<string, any> {
  return {
    id: speaker.id,
    name: speaker.name,
    title: speaker.title,
    bio: speaker.bio,
    image_url: speaker.image_url,
    company: speaker.company,
    linkedin_url: speaker.linkedin_url,
    twitter_url: speaker.twitter_url,
    instagram_url: speaker.instagram_url,
    website_url: speaker.website_url,
    featured: speaker.featured,
    display_order: speaker.display_order,
    topic: speaker.topic,
    event_day: speaker.event_day,
    tags: speaker.tags,
    status: speaker.status,
    application_id: speaker.application_id,
    user_id: speaker.user_id,
    position: speaker.position,
    speaker_role: speaker.speaker_role,
    confirmed: speaker.confirmed,
    // Let DB handle created_at and updated_at
  }
}

async function main() {
  console.log('🗣️  Speaker Database Sync Script')
  console.log('='.repeat(60))
  
  if (isDryRun) {
    console.log('📋 DRY RUN MODE - No changes will be made\n')
  }
  
  // Step 1: Load speakers from constants file
  console.log('\n📄 Loading speakers from constants file...')
  const speakers = extractSpeakersData()
  console.log(`   Found ${speakers.length} speakers in constants file`)
  
  // Group by type for summary
  const specialGuests = speakers.filter(s => 
    s.speaker_role.toLowerCase().includes('special guest')
  )
  const regularSpeakers = speakers.filter(s => 
    s.speaker_role.toLowerCase().includes('speaker') &&
    !s.speaker_role.toLowerCase().includes('special guest')
  )
  const guests = speakers.filter(s => 
    s.speaker_role.toLowerCase() === 'guest'
  )
  
  console.log(`   - Special Guests: ${specialGuests.length}`)
  console.log(`   - Speakers: ${regularSpeakers.length}`)
  console.log(`   - Guests: ${guests.length}`)
  
  if (isDryRun) {
    console.log('\n📋 Would truncate speakers table and insert:')
    speakers.slice(0, 5).forEach(s => {
      console.log(`   • ${s.name} (${s.speaker_role})`)
    })
    if (speakers.length > 5) {
      console.log(`   ... and ${speakers.length - 5} more`)
    }
    console.log('\n📋 Dry run complete. Use without --dry-run to execute.')
    return
  }
  
  // Step 2: Get current count
  console.log('\n📊 Checking current database state...')
  const { count: existingCount, error: countError } = await supabase
    .from('speakers')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error(`   ❌ Error checking database: ${countError.message}`)
    process.exit(1)
  }
  
  console.log(`   Current speakers in database: ${existingCount || 0}`)
  
  // Step 3: Truncate (delete all) existing speakers
  console.log('\n🗑️  Truncating speakers table...')
  const { error: deleteError } = await supabase
    .from('speakers')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all (neq to impossible value)
  
  if (deleteError) {
    console.error(`   ❌ Error truncating table: ${deleteError.message}`)
    process.exit(1)
  }
  
  console.log(`   ✅ Deleted ${existingCount || 0} existing records`)
  
  // Step 4: Insert new speakers
  console.log('\n📥 Inserting new speakers...')
  
  const dbRecords = speakers.map(mapToDbSchema)
  
  // Insert in batches of 50 to avoid payload limits
  const BATCH_SIZE = 50
  let insertedCount = 0
  let failedCount = 0
  
  for (let i = 0; i < dbRecords.length; i += BATCH_SIZE) {
    const batch = dbRecords.slice(i, i + BATCH_SIZE)
    
    const { error: insertError } = await supabase
      .from('speakers')
      .insert(batch)
    
    if (insertError) {
      console.error(`   ❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}: ${insertError.message}`)
      failedCount += batch.length
    } else {
      insertedCount += batch.length
      console.log(`   ✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records)`)
    }
  }
  
  // Step 5: Verify
  console.log('\n🔍 Verifying insertion...')
  const { count: newCount, error: verifyError } = await supabase
    .from('speakers')
    .select('*', { count: 'exact', head: true })
  
  if (verifyError) {
    console.error(`   ❌ Error verifying: ${verifyError.message}`)
  } else {
    console.log(`   Speakers in database: ${newCount}`)
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary')
  console.log(`   Deleted:  ${existingCount || 0} records`)
  console.log(`   Inserted: ${insertedCount} records`)
  if (failedCount > 0) {
    console.log(`   Failed:   ${failedCount} records`)
  }
  console.log(`   Final:    ${newCount} records in database`)
  
  if (insertedCount === speakers.length) {
    console.log('\n✅ Speaker database sync complete!')
  } else {
    console.log('\n⚠️  Some records may not have been inserted. Check errors above.')
  }
}

main().catch(console.error)
