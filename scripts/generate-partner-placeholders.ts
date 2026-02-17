/**
 * Partner Logo Placeholder Generator
 * 
 * Generates professional SVG placeholder logos for partners
 * using their initials and tier-based color schemes.
 * 
 * Usage:
 *   pnpm generate:partner-placeholders           # Generate all missing placeholders
 *   pnpm generate:partner-placeholders:force     # Regenerate all (overwrite existing)
 */

import * as fs from 'fs'
import * as path from 'path'

interface PartnerInfo {
  name: string
  filename: string
  tier: 'strategic' | 'media' | 'ecosystem' | 'technology' | 'venue' | 'creative' | 'community'
}

// Partner data with tier info for color mapping
const PARTNERS: PartnerInfo[] = [
  // Strategic Partners (Gold/Yellow theme)
  { name: 'Lagos State Ministry of Tourism, Arts and Culture', filename: 'lagos-tourism.png', tier: 'strategic' },
  { name: 'Bank of Industry', filename: 'boi.png', tier: 'strategic' },
  { name: 'Nigerian Copyright Commission', filename: 'ncc.png', tier: 'strategic' },
  
  // Media Partners (Blue theme)
  { name: 'Guardian Nigeria', filename: 'guardian.png', tier: 'media' },
  { name: 'Pulse Nigeria', filename: 'pulse.png', tier: 'media' },
  { name: 'TechCabal', filename: 'techcabal.png', tier: 'media' },
  { name: 'BellaNaija', filename: 'bellanaija.png', tier: 'media' },
  { name: 'Cool FM', filename: 'cool-fm.png', tier: 'media' },
  { name: 'Notjustok', filename: 'notjustok.png', tier: 'media' },
  
  // Ecosystem Partners (Green theme)
  { name: 'Creative Nigeria', filename: 'creative-nigeria.png', tier: 'ecosystem' },
  { name: 'Lagos Fashion Week', filename: 'lfw.png', tier: 'ecosystem' },
  { name: 'Nollywood Filmmakers Association', filename: 'nfa.png', tier: 'ecosystem' },
  { name: 'Society of Nigerian Artists', filename: 'sna.png', tier: 'ecosystem' },
  { name: 'MUSON Centre', filename: 'muson.png', tier: 'ecosystem' },
  { name: 'Gaming Nigeria', filename: 'gaming-nigeria.png', tier: 'ecosystem' },
  
  // Technology Partners (Purple theme)
  { name: 'Paystack', filename: 'paystack.png', tier: 'technology' },
  { name: 'Flutterwave', filename: 'flutterwave.png', tier: 'technology' },
  { name: 'Vercel', filename: 'vercel.png', tier: 'technology' },
  { name: 'Audiomack', filename: 'audiomack.png', tier: 'technology' },
  { name: 'Boomplay', filename: 'boomplay.png', tier: 'technology' },
  
  // Venue Partners (Red theme)
  { name: 'National Theatre', filename: 'national-theatre.png', tier: 'venue' },
  { name: 'Radisson Blu', filename: 'radisson.png', tier: 'venue' },
  
  // Creative Partners (Orange theme)
  { name: 'Lagos Photo Festival', filename: 'lagos-photo.png', tier: 'creative' },
  { name: 'Terra Kulture', filename: 'terra-kulture.png', tier: 'creative' },
  { name: 'ArtX Lagos', filename: 'artx.png', tier: 'creative' },
  
  // Community Partners (Teal theme)
  { name: 'Google Developers Lagos', filename: 'gdg-lagos.png', tier: 'community' },
  { name: 'She Code Africa', filename: 'sca.png', tier: 'community' },
  { name: 'Founders Forum Africa', filename: 'ffa.png', tier: 'community' },
  { name: 'Lagos Creative Industries Cluster', filename: 'lcic.png', tier: 'community' },
  { name: 'Pan-Atlantic University EDC', filename: 'pau-edc.png', tier: 'community' }
]

// Color schemes by tier
const TIER_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  strategic: { bg: '#FEF3C7', text: '#92400E', accent: '#F59E0B' },   // Gold/Amber
  media: { bg: '#DBEAFE', text: '#1E40AF', accent: '#3B82F6' },       // Blue
  ecosystem: { bg: '#D1FAE5', text: '#065F46', accent: '#10B981' },   // Green
  technology: { bg: '#EDE9FE', text: '#5B21B6', accent: '#8B5CF6' },  // Purple
  venue: { bg: '#FEE2E2', text: '#991B1B', accent: '#EF4444' },       // Red
  creative: { bg: '#FFEDD5', text: '#9A3412', accent: '#F97316' },    // Orange
  community: { bg: '#CCFBF1', text: '#115E59', accent: '#14B8A6' }    // Teal
}

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')
const FORCE_REGENERATE = process.argv.includes('--force')

// Extract initials from partner name (max 3 characters)
function getInitials(name: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'Lagos State Ministry of Tourism, Arts and Culture': 'LSM',
    'Bank of Industry': 'BOI',
    'Nigerian Copyright Commission': 'NCC',
    'Guardian Nigeria': 'GN',
    'Pulse Nigeria': 'PN',
    'TechCabal': 'TC',
    'BellaNaija': 'BN',
    'Cool FM': 'CFM',
    'Notjustok': 'NJO',
    'Creative Nigeria': 'CN',
    'Lagos Fashion Week': 'LFW',
    'Nollywood Filmmakers Association': 'NFA',
    'Society of Nigerian Artists': 'SNA',
    'MUSON Centre': 'MUS',
    'Gaming Nigeria': 'GN',
    'Paystack': 'PS',
    'Flutterwave': 'FW',
    'Vercel': 'V',
    'Audiomack': 'AM',
    'Boomplay': 'BP',
    'National Theatre': 'NT',
    'Radisson Blu': 'RB',
    'Lagos Photo Festival': 'LPF',
    'Terra Kulture': 'TK',
    'ArtX Lagos': 'AX',
    'Google Developers Lagos': 'GDG',
    'She Code Africa': 'SCA',
    'Founders Forum Africa': 'FFA',
    'Lagos Creative Industries Cluster': 'LCI',
    'Pan-Atlantic University EDC': 'PAU'
  }
  
  if (specialCases[name]) {
    return specialCases[name]
  }
  
  // Default: take first letter of each word (max 3)
  const words = name.split(/[\s,]+/).filter(w => w.length > 0)
  return words.slice(0, 3).map(w => w[0].toUpperCase()).join('')
}

// Generate SVG placeholder
function generateSVG(initials: string, colors: { bg: string; text: string; accent: string }): string {
  const fontSize = initials.length <= 2 ? 48 : (initials.length === 3 ? 36 : 28)
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.bg};stop-opacity:0.8" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${colors.accent}" flood-opacity="0.2"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="200" height="200" rx="20" ry="20" fill="url(#bgGradient)"/>
  
  <!-- Accent border -->
  <rect x="4" y="4" width="192" height="192" rx="18" ry="18" fill="none" stroke="${colors.accent}" stroke-width="2" opacity="0.4"/>
  
  <!-- Initials -->
  <text 
    x="100" 
    y="100" 
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
    font-size="${fontSize}" 
    font-weight="700" 
    fill="${colors.text}" 
    text-anchor="middle" 
    dominant-baseline="central"
    filter="url(#shadow)"
  >${initials}</text>
  
  <!-- Subtle inner pattern -->
  <circle cx="170" cy="170" r="40" fill="${colors.accent}" opacity="0.08"/>
  <circle cx="30" cy="30" r="25" fill="${colors.accent}" opacity="0.05"/>
</svg>`
}

// Check if file exists
function fileExists(filename: string): boolean {
  const filePath = path.join(IMAGES_DIR, filename)
  return fs.existsSync(filePath)
}

async function main() {
  console.log('🎨 Partner Logo Placeholder Generator')
  console.log(FORCE_REGENERATE ? '   [FORCE MODE - Will overwrite existing]' : '   [Normal mode - Skip existing files]')
  console.log('')
  
  // Ensure images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
  }
  
  // Check current status
  const existing: string[] = []
  const toGenerate: PartnerInfo[] = []
  
  for (const partner of PARTNERS) {
    if (FORCE_REGENERATE || !fileExists(partner.filename.replace('.png', '.svg'))) {
      toGenerate.push(partner)
    } else {
      existing.push(partner.name)
    }
  }
  
  // Also check for .png files
  const pngExisting: string[] = []
  for (const partner of toGenerate) {
    if (fileExists(partner.filename)) {
      pngExisting.push(partner.name)
    }
  }
  
  console.log(`📊 Status:`)
  console.log(`   Total partners: ${PARTNERS.length}`)
  console.log(`   Existing SVGs: ${existing.length}`)
  console.log(`   Existing PNGs: ${pngExisting.length}`)
  console.log(`   To generate: ${toGenerate.length}`)
  console.log('')
  
  if (toGenerate.length === 0) {
    console.log('✅ All partner placeholders already exist!')
    return
  }
  
  // Generate placeholders
  console.log('🎨 Generating placeholders...')
  console.log('')
  
  let generated = 0
  let errors = 0
  
  for (const partner of toGenerate) {
    const initials = getInitials(partner.name)
    const colors = TIER_COLORS[partner.tier]
    const svg = generateSVG(initials, colors)
    
    // Save as SVG (cleaner format)
    const svgFilename = partner.filename.replace('.png', '.svg')
    const svgPath = path.join(IMAGES_DIR, svgFilename)
    
    try {
      fs.writeFileSync(svgPath, svg, 'utf-8')
      console.log(`   ✅ ${partner.name} → ${svgFilename} (${initials})`)
      generated++
    } catch (error) {
      console.log(`   ❌ ${partner.name} - Error: ${error}`)
      errors++
    }
  }
  
  console.log('')
  console.log('📊 Summary')
  console.log(`   Generated: ${generated}`)
  console.log(`   Errors:    ${errors}`)
  console.log('')
  
  if (generated > 0) {
    console.log('⚠️  Note: Placeholders generated as .svg files')
    console.log('   Update partners.ts to use .svg extension:')
    console.log('   logo_url: "/images/partner-name.svg"')
  }
  
  console.log('')
  console.log('✅ Placeholder generation complete!')
}

main().catch(console.error)
