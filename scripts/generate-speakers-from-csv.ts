#!/usr/bin/env npx tsx
/**
 * Generate Updated Speakers List from CSV
 * 
 * This script reads the CSV and generates an updated speakers.ts file
 * with all speaker data in the correct format.
 * 
 * Usage: npx tsx scripts/generate-speakers-from-csv.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

const CSV_PATH = path.join(
  process.cwd(),
  'lib',
  'constants',
  'data',
  "SYNERGYCON 2.0 LISTS - Speakers JAN '26.csv"
)

const OUTPUT_PATH = path.join(
  process.cwd(),
  'lib',
  'constants',
  'data',
  'speakers.ts'
)

interface SpeakerRecord {
  action: string
  name: string
  role: string
  bio: string
  eventDay: string
  speakingOn: string
  speakerType: string
  connect: string
  tags: string
  googleDriveLink: string
}

// =============================================================================
// CSV Parsing
// =============================================================================

function parseCSV(content: string): SpeakerRecord[] {
  const records: SpeakerRecord[] = []
  const lines = content.split('\n')
  
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false
  let isFirstRow = true
  
  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim())
        currentField = ''
      } else {
        currentField += char
      }
    }
    
    if (inQuotes) {
      currentField += '\n'
    } else {
      currentRow.push(currentField.trim())
      currentField = ''
      
      if (currentRow.length >= 10 && !isFirstRow) {
        records.push({
          action: currentRow[0] || '',
          name: currentRow[1] || '',
          role: currentRow[2] || '',
          bio: currentRow[3] || '',
          eventDay: currentRow[4] || '',
          speakingOn: currentRow[5] || '',
          speakerType: currentRow[6] || '',
          connect: currentRow[7] || '',
          tags: currentRow[8] || '',
          googleDriveLink: currentRow[9] || '',
        })
      }
      
      isFirstRow = false
      currentRow = []
    }
  }
  
  return records
}

// =============================================================================
// Utilities
// =============================================================================

function generateUUID(): string {
  return crypto.randomUUID()
}

function nameToImageUrl(name: string): string {
  const fileName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,'"()⁣⁢\u200B\u200C\u200D\uFEFF]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  return `/images/${fileName}.jpg`
}

function extractSocialLinks(connect: string): {
  linkedin_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  website_url: string | null
} {
  const result = {
    linkedin_url: null as string | null,
    twitter_url: null as string | null,
    instagram_url: null as string | null,
    website_url: null as string | null,
  }
  
  if (!connect) return result
  
  // LinkedIn
  const linkedinMatch = connect.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s,]+/i)
    || connect.match(/https?:\/\/(?:ng\.|uk\.)?linkedin\.com\/in\/[^\s,]+/i)
  if (linkedinMatch) {
    result.linkedin_url = linkedinMatch[0].replace(/\s+$/, '')
  }
  
  // Instagram
  const instagramMatch = connect.match(/https?:\/\/(?:www\.)?instagram\.com\/[^\s,?]+/i)
  if (instagramMatch) {
    result.instagram_url = instagramMatch[0].replace(/\s+$/, '').replace(/\?.*$/, '')
  }
  
  // Twitter/X
  const twitterMatch = connect.match(/https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[^\s,?]+/i)
  if (twitterMatch) {
    result.twitter_url = twitterMatch[0].replace(/\s+$/, '').replace(/\?.*$/, '')
  }
  
  // Website (non-social URLs)
  const websiteMatch = connect.match(/https?:\/\/(?!(?:www\.)?(?:linkedin|instagram|twitter|x|facebook|tiktok|youtube)\.com)[^\s,]+/i)
  if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('instagram')) {
    result.website_url = websiteMatch[0].replace(/\s+$/, '')
  }
  
  return result
}

function parseTagsToArray(tags: string): string[] {
  if (!tags) return []
  return tags
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .join(', ')
    .split(', ')
    .map(t => t.trim())
    .filter(t => t.length > 0)
}

function extractCompany(role: string): string | null {
  // Try to extract company from role
  const atMatch = role.match(/(?:at|@)\s+(.+)$/i)
  if (atMatch) return atMatch[1].trim()
  
  const commaMatch = role.match(/,\s*(.+)$/i)
  if (commaMatch) return commaMatch[1].trim()
  
  return null
}

function isFeatured(speakerType: string): boolean {
  const type = speakerType.toLowerCase()
  return type.includes('special guest') || type.includes('keynote')
}

// =============================================================================
// Main
// =============================================================================

function main() {
  console.log('📝 Generating speakers.ts from CSV...\n')
  
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  const records = parseCSV(csvContent)
  
  console.log(`Found ${records.length} speakers in CSV\n`)
  
  const now = new Date().toISOString()
  
  const speakers = records.map((record, index) => {
    const socialLinks = extractSocialLinks(record.connect)
    const tags = parseTagsToArray(record.tags)
    const company = extractCompany(record.role)
    const featured = isFeatured(record.speakerType)
    
    return {
      id: generateUUID(),
      name: record.name,
      title: record.role || null,
      bio: record.bio || null,
      image_url: nameToImageUrl(record.name),
      company: company,
      linkedin_url: socialLinks.linkedin_url,
      twitter_url: socialLinks.twitter_url,
      featured: featured,
      display_order: index + 1,
      created_at: now,
      updated_at: now,
      topic: record.speakingOn || "Session topic to be announced",
      instagram_url: socialLinks.instagram_url,
      website_url: socialLinks.website_url,
      event_day: 1,
      tags: tags.join(', '),
      status: "live",
      application_id: null,
      user_id: null,
      position: index + 1,
      speaker_role: record.speakerType.trim() || "Speaker",
      confirmed: false,
    }
  })
  
  // Group speakers by type for better organization
  const specialGuests = speakers.filter(s => 
    s.speaker_role.toLowerCase().includes('special guest')
  )
  const regularSpeakers = speakers.filter(s => 
    !s.speaker_role.toLowerCase().includes('special guest') &&
    s.speaker_role.toLowerCase().includes('speaker')
  )
  const guests = speakers.filter(s => 
    s.speaker_role.toLowerCase() === 'guest'
  )
  
  // Sort: Special Guests first, then Speakers, then Guests
  const sortedSpeakers = [...specialGuests, ...regularSpeakers, ...guests]
  
  // Re-assign display_order and position
  sortedSpeakers.forEach((s, i) => {
    s.display_order = i + 1
    s.position = i + 1
  })
  
  // Generate TypeScript file content
  const fileContent = `/**
 * Speaker Data Constants
 * 
 * SynergyCon 2.0 - Single-Day Event (March 26, 2026)
 * All speakers present on the single event day across four creative districts.
 * 
 * Last synced: ${now}
 * Total Speakers: ${sortedSpeakers.length}
 * 
 * Categories:
 * - Special Guests: ${specialGuests.length}
 * - Speakers: ${regularSpeakers.length}
 * - Guests: ${guests.length}
 */

export interface SpeakerData {
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
}

export const SPEAKERS_DATA = ${JSON.stringify(sortedSpeakers, null, 2)};

// Helper functions for filtering speakers
export const getSpecialGuests = () => SPEAKERS_DATA.filter(s => 
  s.speaker_role.toLowerCase().includes('special guest')
);

export const getSpeakers = () => SPEAKERS_DATA.filter(s => 
  s.speaker_role.toLowerCase().includes('speaker') && 
  !s.speaker_role.toLowerCase().includes('special guest')
);

export const getGuests = () => SPEAKERS_DATA.filter(s => 
  s.speaker_role.toLowerCase() === 'guest'
);

export const getFeaturedSpeakers = () => SPEAKERS_DATA.filter(s => s.featured);

export const getSpeakerByName = (name: string) => 
  SPEAKERS_DATA.find(s => s.name.toLowerCase() === name.toLowerCase());

export const getSpeakerById = (id: string) => 
  SPEAKERS_DATA.find(s => s.id === id);
`

  fs.writeFileSync(OUTPUT_PATH, fileContent, 'utf-8')
  
  console.log('✅ Generated speakers.ts successfully!')
  console.log(`   Total: ${sortedSpeakers.length} speakers`)
  console.log(`   Special Guests: ${specialGuests.length}`)
  console.log(`   Speakers: ${regularSpeakers.length}`)
  console.log(`   Guests: ${guests.length}`)
  console.log(`\n📁 Output: ${OUTPUT_PATH}`)
}

main()
