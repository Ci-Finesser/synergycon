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
  // Note: partners table doesn't exist in database schema - needs migration to create table
  // { filename: 'partners.ts', tableName: 'partners', dataKey: 'PARTNERS_DATA', primaryKey: 'id' },
  { filename: 'schedule.ts', tableName: 'schedule_sessions', dataKey: 'SCHEDULE_ITEMS_DATA', primaryKey: 'id' },
  // Note: faqs table doesn't exist in database schema - skipping
  { filename: 'gallery.ts', tableName: 'gallery_items', dataKey: 'GALLERY_ITEMS_DATA', primaryKey: 'id' },
]

/**
 * Transform schedule data to match database schema.
 * The constants file has different column names than the database table.
 */
function transformScheduleData(data: any[]): any[] {
  return data.map((item: any) => {
    const {
      track,           // renamed to 'district' in DB
      is_featured,     // doesn't exist in DB
      tags,            // doesn't exist in DB
      speaker_ids,     // DB has 'speaker_id' (singular, UUID not array)
      ...rest
    } = item
    
    return {
      ...rest,
      district: track || 'main-conference',  // Map track → district
      date: 'March 26, 2026',                 // Single day event
      time: item.start_time || '09:00',       // Use start_time as time
      venue: item.location || 'National Theatre',  // venue is required
      speaker: 'TBA',                         // Default speaker name (required in DB)
      speaker_id: speaker_ids?.[0] || null,   // Take first speaker_id if array
      capacity: 100,                          // Default capacity
    }
  })
}

/**
 * Converts TypeScript object syntax to valid JSON.
 * Handles unquoted keys, trailing commas, and comments.
 */
function tsToJson(tsCode: string): string {
  let result = tsCode
  
  // Remove single-line comments (// ...) but be careful not to match URLs
  // Match // only when not preceded by : (which would be part of a URL like https://)
  result = result.replace(/(?<!:)\/\/[^\n]*/g, '')
  
  // Remove multi-line comments (/* ... */)
  result = result.replace(/\/\*[\s\S]*?\*\//g, '')
  
  // Convert TypeScript object keys to JSON quoted keys
  // This regex matches property names that are not already quoted
  // Pattern: word characters followed by colon, at start of line or after { or ,
  result = result.replace(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/gm, '"$1":')
  
  // Handle keys that appear after { or , on the same line
  result = result.replace(/([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
  
  // Remove trailing commas before ] or }
  result = result.replace(/,(\s*[\]}])/g, '$1')
  
  // Clean up any double-quoted keys (in case some were already quoted)
  result = result.replace(/""([^"]+)""/g, '"$1"')
  
  return result
}

function extractDataFromFile(filePath: string, dataKey: string): any[] {
  if (!fs.existsSync(filePath)) {
    return []
  }
  
  const content = fs.readFileSync(filePath, 'utf-8')
  
  // Try multiple patterns to match the data array:
  // 1. With 'as const' suffix: export const DATA = [...] as const
  // 2. With type annotation: export const DATA: Type[] = [...]
  // 3. Plain export: export const DATA = [...]
  
  const patterns = [
    // Pattern 1: With 'as const'
    new RegExp(`export const ${dataKey}\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*as const`, 'm'),
    // Pattern 2: With type annotation (stops at the closing bracket before export/function/const/type)
    new RegExp(`export const ${dataKey}(?::\\s*\\w+\\[\\])?\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*(?=\\/\\/|export|function|const|type|\\n\\n)`, 'm'),
    // Pattern 3: Match array until we find a closing bracket followed by newlines and non-array content
    new RegExp(`export const ${dataKey}(?::\\s*\\w+\\[\\])?\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*$`, 'm'),
  ]
  
  let arrayContent: string | null = null
  
  for (const regex of patterns) {
    const match = content.match(regex)
    if (match && match[1]) {
      arrayContent = match[1]
      break
    }
  }
  
  if (!arrayContent) {
    // Fallback: Try to extract array more aggressively
    const startMarker = `export const ${dataKey}`
    const startIdx = content.indexOf(startMarker)
    if (startIdx === -1) {
      console.warn(`  ⚠️  Could not find ${dataKey} in file`)
      return []
    }
    
    // Find the opening bracket
    const bracketStart = content.indexOf('[', startIdx)
    if (bracketStart === -1) {
      console.warn(`  ⚠️  Could not find array start for ${dataKey}`)
      return []
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
      console.warn(`  ⚠️  Could not find array end for ${dataKey}`)
      return []
    }
    
    arrayContent = content.substring(bracketStart, bracketEnd + 1)
  }
  
  try {
    // First, try direct JSON parse (for already valid JSON)
    return JSON.parse(arrayContent)
  } catch {
    // If that fails, convert TypeScript syntax to JSON
    try {
      const jsonContent = tsToJson(arrayContent)
      return JSON.parse(jsonContent)
    } catch (e) {
      console.warn(`  ⚠️  Could not parse ${dataKey}:`, e)
      return []
    }
  }
}

async function seedTable(config: SeedConfig): Promise<{ success: boolean; count: number }> {
  const filePath = path.join(CONSTANTS_DIR, config.filename)
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ⏭️  ${config.filename} (file not found, skipping)`)
    return { success: true, count: 0 }
  }
  
  let data = extractDataFromFile(filePath, config.dataKey)
  
  if (data.length === 0) {
    console.log(`  ⏭️  ${config.filename} (no data)`)
    return { success: true, count: 0 }
  }
  
  // Apply special transformations for schedule data to match DB schema
  if (config.tableName === 'schedule_sessions') {
    data = transformScheduleData(data)
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
