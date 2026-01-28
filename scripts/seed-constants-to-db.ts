/**
 * Seed Constants to Database
 * 
 * This script reads the edited constants files from lib/constants/data/
 * and upserts them back into the Supabase database.
 * 
 * Usage:
 *   npx tsx scripts/seed-constants-to-db.ts
 *   # or
 *   pnpm run db:seed
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
const CONSTANTS_DIR = path.join(__dirname, '..', 'lib', 'constants', 'data')

// ============================================================================
// Data Seeders
// ============================================================================

interface SeedConfig {
  filename: string
  tableName: string
  dataKey: string
  primaryKey?: string
}

const SEED_CONFIGS: SeedConfig[] = [
  { filename: 'ticket-types.ts', tableName: 'ticket_types', dataKey: 'TICKET_TYPES_DATA', primaryKey: 'ticket_id' },
  { filename: 'special-guests.ts', tableName: 'special_guests', dataKey: 'SPECIAL_GUESTS_DATA', primaryKey: 'id' },
  { filename: 'speakers.ts', tableName: 'speakers', dataKey: 'SPEAKERS_DATA', primaryKey: 'id' },
  { filename: 'sponsors.ts', tableName: 'sponsors', dataKey: 'SPONSORS_DATA', primaryKey: 'id' },
  { filename: 'partners.ts', tableName: 'partners', dataKey: 'PARTNERS_DATA', primaryKey: 'id' },
  { filename: 'schedule.ts', tableName: 'schedule_items', dataKey: 'SCHEDULE_ITEMS_DATA', primaryKey: 'id' },
  { filename: 'faqs.ts', tableName: 'faqs', dataKey: 'FAQS_DATA', primaryKey: 'id' },
  { filename: 'gallery.ts', tableName: 'gallery_items', dataKey: 'GALLERY_ITEMS_DATA', primaryKey: 'id' },
]

function extractDataFromFile(filePath: string, dataKey: string): any[] {
  if (!fs.existsSync(filePath)) {
    return []
  }
  
  const content = fs.readFileSync(filePath, 'utf-8')
  
  // Extract the data array using regex - match from dataKey to 'as const'
  const regex = new RegExp(`export const ${dataKey}\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*as const`, 'm')
  const match = content.match(regex)
  
  if (!match) {
    console.warn(`  ⚠️  Could not find ${dataKey} in file`)
    return []
  }
  
  try {
    // Parse the JSON-like array
    return JSON.parse(match[1])
  } catch (e) {
    console.warn(`  ⚠️  Could not parse ${dataKey}:`, e)
    return []
  }
}

async function seedTable(config: SeedConfig): Promise<{ success: boolean; count: number }> {
  const filePath = path.join(CONSTANTS_DIR, config.filename)
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ⏭️  ${config.filename} (file not found, skipping)`)
    return { success: true, count: 0 }
  }
  
  const data = extractDataFromFile(filePath, config.dataKey)
  
  if (data.length === 0) {
    console.log(`  ⏭️  ${config.filename} (no data)`)
    return { success: true, count: 0 }
  }
  
  // Remove auto-generated fields before upserting
  const cleanedData = data.map((item: any) => {
    const { created_at, updated_at, ...rest } = item
    return rest
  })
  
  const { error } = await supabase
    .from(config.tableName)
    .upsert(cleanedData, {
      onConflict: config.primaryKey || 'id',
      ignoreDuplicates: false,
    })
  
  if (error) {
    console.error(`  ❌ ${config.filename}: ${error.message}`)
    return { success: false, count: 0 }
  }
  
  console.log(`  ✓ ${config.filename} (${cleanedData.length} records)`)
  return { success: true, count: cleanedData.length }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🌱 Seeding constants to database...\n')
  console.log(`   Source: ${CONSTANTS_DIR}`)
  console.log(`   Target: ${SUPABASE_URL}\n`)

  if (!fs.existsSync(CONSTANTS_DIR)) {
    console.error('❌ Constants directory not found!')
    console.error('   Run: pnpm run db:pull first')
    process.exit(1)
  }

  console.log('📤 Upserting data to database...\n')
  
  let totalRecords = 0
  let successCount = 0
  
  for (const config of SEED_CONFIGS) {
    try {
      const result = await seedTable(config)
      if (result.success) {
        successCount++
        totalRecords += result.count
      }
    } catch (error) {
      console.error(`  ❌ ${config.filename}: ${error}`)
    }
  }

  console.log(`\n✅ Seeding complete!`)
  console.log(`   ${successCount}/${SEED_CONFIGS.length} tables updated`)
  console.log(`   ${totalRecords} total records upserted`)
}

main().catch(console.error)
