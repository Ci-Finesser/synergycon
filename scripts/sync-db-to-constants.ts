/**
 * Sync Database to Constants
 * 
 * This script queries all editable data from the Supabase database
 * and generates TypeScript constants files in lib/constants/ for editing.
 * 
 * After editing, use seed-constants-to-db.ts to push changes back.
 * 
 * Usage:
 *   npx tsx scripts/sync-db-to-constants.ts
 *   # or
 *   pnpm run db:pull
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

// Ensure output directory exists
if (!fs.existsSync(CONSTANTS_DIR)) {
  fs.mkdirSync(CONSTANTS_DIR, { recursive: true })
}

// ============================================================================
// Data Fetchers
// ============================================================================

async function fetchTicketTypes() {
  const { data, error } = await supabase
    .from('ticket_types')
    .select('*')
    .order('price', { ascending: true })

  if (error) {
    console.error('Error fetching ticket_types:', error.message)
    return []
  }
  return data || []
}

async function fetchSpecialGuests() {
  const { data, error } = await supabase
    .from('special_guests')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching special_guests:', error.message)
    return []
  }
  return data || []
}

async function fetchSpeakers() {
  const { data, error } = await supabase
    .from('speakers')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching speakers:', error.message)
    return []
  }
  return data || []
}

async function fetchSponsors() {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('tier', { ascending: true })

  if (error) {
    console.error('Error fetching sponsors:', error.message)
    return []
  }
  return data || []
}

async function fetchPartners() {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching partners:', error.message)
    return []
  }
  return data || []
}

async function fetchScheduleItems() {
  const { data, error } = await supabase
    .from('schedule_items')
    .select('*')
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching schedule_items:', error.message)
    return []
  }
  return data || []
}

async function fetchFAQs() {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching faqs:', error.message)
    return []
  }
  return data || []
}

async function fetchGalleryItems() {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching gallery_items:', error.message)
    return []
  }
  return data || []
}

// ============================================================================
// File Generators
// ============================================================================

function generateConstantsFile(
  filename: string,
  typeName: string,
  dataName: string,
  data: any[],
  typeDefinition: string
): void {
  const filePath = path.join(CONSTANTS_DIR, filename)
  
  const content = `/**
 * ${typeName} Data Constants
 * 
 * Auto-generated from database by sync-db-to-constants.ts
 * Edit this file and run db:seed to push changes back to the database.
 * 
 * Last synced: ${new Date().toISOString()}
 */

${typeDefinition}

export const ${dataName} = ${JSON.stringify(data, null, 2)} as const

export type ${typeName}Id = typeof ${dataName}[number]['id']
`

  fs.writeFileSync(filePath, content, 'utf-8')
  console.log(`  ✓ ${filename} (${data.length} records)`)
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🔄 Syncing database to constants...\n')
  console.log(`   Source: ${SUPABASE_URL}`)
  console.log(`   Target: ${CONSTANTS_DIR}\n`)

  console.log('📥 Fetching data from database...\n')

  // Fetch all data
  const [
    ticketTypes,
    specialGuests,
    speakers,
    sponsors,
    partners,
    scheduleItems,
    faqs,
    galleryItems,
  ] = await Promise.all([
    fetchTicketTypes(),
    fetchSpecialGuests(),
    fetchSpeakers(),
    fetchSponsors(),
    fetchPartners(),
    fetchScheduleItems(),
    fetchFAQs(),
    fetchGalleryItems(),
  ])

  console.log('📝 Generating constants files...\n')

  // Generate ticket types
  generateConstantsFile(
    'ticket-types.ts',
    'TicketType',
    'TICKET_TYPES_DATA',
    ticketTypes,
    `export interface TicketTypeData {
  ticket_id: string
  name: string
  description: string | null
  price: number
  currency: string
  category: 'vip' | 'vip-plus' | 'vvip' | 'priority'
  duration: 'day' | 'full-event'
  access_type: 'general' | 'backstage' | 'all-access'
  benefits: string[] | null
  max_quantity: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}`
  )

  // Generate special guests
  generateConstantsFile(
    'special-guests.ts',
    'SpecialGuest',
    'SPECIAL_GUESTS_DATA',
    specialGuests,
    `export interface SpecialGuestData {
  id: string
  name: string
  title: string | null
  image_url: string | null
  category: string | null
  description: string | null
  social_links: Record<string, string> | null
  display_order: number
  is_featured: boolean
  created_at: string
  updated_at: string
}`
  )

  // Generate speakers
  generateConstantsFile(
    'speakers.ts',
    'Speaker',
    'SPEAKERS_DATA',
    speakers,
    `export interface SpeakerData {
  id: string
  name: string
  title: string | null
  company: string | null
  bio: string | null
  image_url: string | null
  social_links: Record<string, string> | null
  topics: string[] | null
  is_keynote: boolean
  created_at: string
  updated_at: string
}`
  )

  // Generate sponsors
  generateConstantsFile(
    'sponsors.ts',
    'Sponsor',
    'SPONSORS_DATA',
    sponsors,
    `export interface SponsorData {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}`
  )

  // Generate partners
  generateConstantsFile(
    'partners.ts',
    'Partner',
    'PARTNERS_DATA',
    partners,
    `export interface PartnerData {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  category: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}`
  )

  // Generate schedule items
  generateConstantsFile(
    'schedule.ts',
    'ScheduleItem',
    'SCHEDULE_ITEMS_DATA',
    scheduleItems,
    `export interface ScheduleItemData {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  day: number
  track: string | null
  location: string | null
  speaker_ids: string[] | null
  tags: string[] | null
  created_at: string
  updated_at: string
}`
  )

  // Generate FAQs
  generateConstantsFile(
    'faqs.ts',
    'FAQ',
    'FAQS_DATA',
    faqs,
    `export interface FAQData {
  id: string
  question: string
  answer: string
  category: string | null
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}`
  )

  // Generate gallery items
  generateConstantsFile(
    'gallery.ts',
    'GalleryItem',
    'GALLERY_ITEMS_DATA',
    galleryItems,
    `export interface GalleryItemData {
  id: string
  title: string | null
  description: string | null
  image_url: string
  thumbnail_url: string | null
  category: string | null
  year: number | null
  display_order: number
  is_featured: boolean
  created_at: string
  updated_at: string
}`
  )

  // Create index file
  const indexContent = `/**
 * Constants Data Index
 * 
 * Auto-generated by sync-db-to-constants.ts
 * Last synced: ${new Date().toISOString()}
 */

export * from './ticket-types'
export * from './special-guests'
export * from './speakers'
export * from './sponsors'
export * from './partners'
export * from './schedule'
export * from './faqs'
export * from './gallery'
`
  fs.writeFileSync(path.join(CONSTANTS_DIR, 'index.ts'), indexContent, 'utf-8')
  console.log(`  ✓ index.ts (exports)`)

  console.log(`\n✅ Sync complete! Files saved to: ${CONSTANTS_DIR}`)
  console.log('\n📋 Next steps:')
  console.log('   1. Edit the constants files in lib/constants/data/')
  console.log('   2. Run: pnpm run db:seed to push changes back')
}

main().catch(console.error)
