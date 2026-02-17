/**
 * Partner Logo Sync Script
 * 
 * Downloads missing partner logos from various sources:
 * 1. Direct CDN URLs (brand kits, press pages)
 * 2. Wikipedia Commons
 * 3. Company websites
 * 
 * Usage:
 *   pnpm sync:partner-logos           # Download missing logos
 *   pnpm sync:partner-logos:dry-run   # Preview what would be downloaded
 */

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as http from 'http'

// Partner to direct logo URL mapping
interface PartnerLogoSource {
  id: string
  name: string
  filename: string
  urls: string[]  // Direct URLs to try in order
}

// Known direct logo URLs from brand kits, CDNs, and press pages
const PARTNER_LOGO_SOURCES: PartnerLogoSource[] = [
  // Strategic Partners
  {
    id: 'partner-001',
    name: 'Lagos State Ministry of Tourism, Arts and Culture',
    filename: 'lagos-tourism.png',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Seal_of_Lagos_State.svg/200px-Seal_of_Lagos_State.svg.png',
      'https://lagosstate.gov.ng/wp-content/uploads/2019/04/Lagos-State-Government-Logo.png'
    ]
  },
  {
    id: 'partner-002',
    name: 'Bank of Industry',
    filename: 'boi.png',
    urls: [
      'https://www.boi.ng/wp-content/uploads/2019/01/BOI-logo.png',
      'https://upload.wikimedia.org/wikipedia/commons/1/1e/BOI_logo.png'
    ]
  },
  {
    id: 'partner-003',
    name: 'Nigerian Copyright Commission',
    filename: 'ncc.png',
    urls: [
      'https://copyright.gov.ng/wp-content/uploads/2020/09/NCC-Logo.png'
    ]
  },
  
  // Media Partners
  {
    id: 'partner-004',
    name: 'Guardian Nigeria',
    filename: 'guardian.png',
    urls: [
      'https://guardian.ng/wp-content/uploads/2017/09/guardian-logo-red.png'
    ]
  },
  {
    id: 'partner-005',
    name: 'Pulse Nigeria',
    filename: 'pulse.png',
    urls: [
      'https://occ-0-3215-3212.1.nflxso.net/dnm/api/v6/LmEnxtiAuzezXBjYXPuDgfZ4zZQ/AAAABcuWXbWSGr3QXmMJO7dVYgPiXSgYLKxYwKPzG_Sv_SWZ8T2K0X9Jz7tSFw.png',
      'https://www.pulse.ng/img/pulse-logo.svg'
    ]
  },
  {
    id: 'partner-006',
    name: 'TechCabal',
    filename: 'techcabal.png',
    urls: [
      'https://techcabal.com/wp-content/uploads/2021/04/tc-logo.png',
      'https://assets.techcabal.com/tc-logo.png'
    ]
  },
  {
    id: 'partner-007',
    name: 'BellaNaija',
    filename: 'bellanaija.png',
    urls: [
      'https://www.bellanaija.com/wp-content/themes/flavor/images/BN-Logo.png'
    ]
  },
  {
    id: 'partner-008',
    name: 'Cool FM / Wazobia FM / Nigeria Info',
    filename: 'cool-fm.png',
    urls: [
      'https://www.coolfm.ng/images/logo.png'
    ]
  },
  {
    id: 'partner-009',
    name: 'Notjustok',
    filename: 'notjustok.png',
    urls: [
      'https://notjustok.com/wp-content/uploads/2019/01/njk-logo.png'
    ]
  },
  
  // Ecosystem Partners
  {
    id: 'partner-010',
    name: 'Creative Nigeria',
    filename: 'creative-nigeria.png',
    urls: []  // Manual required
  },
  {
    id: 'partner-011',
    name: 'Lagos Fashion Week',
    filename: 'lfw.png',
    urls: [
      'https://lagosfashionweek.ng/wp-content/uploads/2020/02/LFW-Logo.png'
    ]
  },
  {
    id: 'partner-012',
    name: 'Nollywood Filmmakers Association',
    filename: 'nfa.png',
    urls: []  // Manual required
  },
  {
    id: 'partner-013',
    name: 'Society of Nigerian Artists',
    filename: 'sna.png',
    urls: []  // Manual required
  },
  {
    id: 'partner-014',
    name: 'MUSON Centre',
    filename: 'muson.png',
    urls: [
      'https://mfrtech.muson.org/wp-content/uploads/2021/06/MUSON-Logo.png'
    ]
  },
  {
    id: 'partner-015',
    name: 'Gaming Nigeria',
    filename: 'gaming-nigeria.png',
    urls: []  // Manual required
  },
  
  // Technology Partners (high likelihood of CDN logos)
  {
    id: 'partner-016',
    name: 'Paystack',
    filename: 'paystack.png',
    urls: [
      'https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png',
      'https://upload.wikimedia.org/wikipedia/commons/5/55/Paystack_Logo.png',
      'https://raw.githubusercontent.com/PaystackHQ/brand-assets/main/paystack-mark.png'
    ]
  },
  {
    id: 'partner-017',
    name: 'Flutterwave',
    filename: 'flutterwave.png',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/9/9e/Flutterwave_Logo.png',
      'https://flutterwave.com/images/logo-colored.svg'
    ]
  },
  {
    id: 'partner-018',
    name: 'Vercel',
    filename: 'vercel.png',
    urls: [
      'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png',
      'https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg'
    ]
  },
  {
    id: 'partner-019',
    name: 'Audiomack',
    filename: 'audiomack.png',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/c/c5/Audiomack_Logo.png',
      'https://assets.audiomack.com/audiomack-logo.png'
    ]
  },
  {
    id: 'partner-020',
    name: 'Boomplay',
    filename: 'boomplay.png',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/6/6a/Boomplay_Logo.png',
      'https://www.boomplay.com/img/logo.png'
    ]
  },
  
  // Venue Partners
  {
    id: 'partner-021',
    name: 'National Theatre',
    filename: 'national-theatre.png',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/National_Theatre_%28Nigeria%29.jpg/200px-National_Theatre_%28Nigeria%29.jpg'
    ]
  },
  {
    id: 'partner-022',
    name: 'Radisson Blu Anchorage Hotel',
    filename: 'radisson.png',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/d/d8/Radisson_Blu_logo.png',
      'https://www.radissonhotels.com/-/media/project/rh/shared/logo/radisson-blu.png'
    ]
  },
  
  // Creative Partners
  {
    id: 'partner-023',
    name: 'Lagos Photo Festival',
    filename: 'lagos-photo.png',
    urls: [
      'https://lagosphoto.com/wp-content/uploads/2020/09/LagosPhoto-Logo.png'
    ]
  },
  {
    id: 'partner-024',
    name: 'Terra Kulture',
    filename: 'terra-kulture.png',
    urls: [
      'https://terrakulture.com/wp-content/uploads/2019/01/TK-Logo.png'
    ]
  },
  {
    id: 'partner-025',
    name: 'ArtX Lagos',
    filename: 'artx.png',
    urls: [
      'https://artxlagos.com/wp-content/uploads/2020/10/ArtX-Logo.png'
    ]
  },
  
  // Community Partners
  {
    id: 'partner-026',
    name: 'Google Developers Lagos',
    filename: 'gdg-lagos.png',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/4/4a/Google_Developers_Logo.png',
      'https://developers.google.com/static/community/images/gdg-logo.png',
      'https://www.gstatic.com/devrel-devsite/prod/v14d63e30cd5c5d5f2e6bc73f79ee13ebea04a6c0e5a8a8c4c51b4b0f4e8a6f3/developers/images/lockup.svg'
    ]
  },
  {
    id: 'partner-027',
    name: 'She Code Africa',
    filename: 'sca.png',
    urls: [
      'https://shecodeafrica.org/images/logo.png',
      'https://raw.githubusercontent.com/she-code-africa/brand-assets/main/logo.png'
    ]
  },
  {
    id: 'partner-028',
    name: 'Founders Forum Africa',
    filename: 'ffa.png',
    urls: [
      'https://ff.co/wp-content/uploads/2021/05/FF-Logo.png'
    ]
  },
  {
    id: 'partner-029',
    name: 'Lagos Creative Industries Cluster',
    filename: 'lcic.png',
    urls: []  // Manual required
  },
  {
    id: 'partner-030',
    name: 'Pan-Atlantic University Enterprise Development Centre',
    filename: 'pau-edc.png',
    urls: [
      'https://pau.edu.ng/wp-content/uploads/2019/01/PAU-Logo.png'
    ]
  }
]

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')
const DRY_RUN = process.argv.includes('--dry-run')

// Delay utility for rate limiting
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Check if file exists
function fileExists(filename: string): boolean {
  const filePath = path.join(IMAGES_DIR, filename)
  return fs.existsSync(filePath)
}

// Download image from URL with redirect support
function downloadImage(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http
    
    const request = protocol.get(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = response.headers.location.startsWith('http') 
          ? response.headers.location 
          : new URL(response.headers.location, url).href
        downloadImage(redirectUrl, destPath).then(resolve)
        return
      }
      
      if (response.statusCode !== 200) {
        resolve(false)
        return
      }
      
      // Check content type is image
      const contentType = response.headers['content-type'] || ''
      if (!contentType.includes('image')) {
        resolve(false)
        return
      }
      
      const fileStream = fs.createWriteStream(destPath)
      response.pipe(fileStream)
      
      fileStream.on('finish', () => {
        fileStream.close()
        // Verify file is not empty
        const stats = fs.statSync(destPath)
        if (stats.size < 100) {
          fs.unlinkSync(destPath)
          resolve(false)
        } else {
          resolve(true)
        }
      })
      
      fileStream.on('error', () => {
        fs.unlinkSync(destPath)
        resolve(false)
      })
    })
    
    request.on('error', () => resolve(false))
    request.on('timeout', () => {
      request.destroy()
      resolve(false)
    })
  })
}

// Try to download logo from Clearbit API
async function downloadFromClearbit(domain: string, destPath: string): Promise<boolean> {
  const url = `https://logo.clearbit.com/${domain}`
  return downloadImage(url, destPath)
}

// Download a partner logo - try each URL in order
async function downloadPartnerLogo(partner: PartnerLogoSource): Promise<{ success: boolean; source: string }> {
  const destPath = path.join(IMAGES_DIR, partner.filename)
  
  // Try each URL in order
  for (const url of partner.urls) {
    const success = await downloadImage(url, destPath)
    if (success) {
      return { success: true, source: url.substring(0, 50) + '...' }
    }
    // Small delay between attempts
    await delay(200)
  }
  
  return { success: false, source: 'none' }
}

async function main() {
  console.log('🤝 Partner Logo Sync Script')
  console.log(DRY_RUN ? '   [DRY RUN MODE - No downloads will occur]' : '')
  console.log('')
  
  // Ensure images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
  }
  
  // Check which logos are missing
  const missingLogos: PartnerLogoSource[] = []
  const existingLogos: PartnerLogoSource[] = []
  
  for (const partner of PARTNER_LOGO_SOURCES) {
    if (fileExists(partner.filename)) {
      existingLogos.push(partner)
    } else {
      missingLogos.push(partner)
    }
  }
  
  console.log(`📊 Logo Status:`)
  console.log(`   Total partners: ${PARTNER_LOGO_SOURCES.length}`)
  console.log(`   Existing logos: ${existingLogos.length}`)
  console.log(`   Missing logos:  ${missingLogos.length}`)
  console.log('')
  
  if (missingLogos.length === 0) {
    console.log('✅ All partner logos are present!')
    return
  }
  
  console.log('')
  
  if (DRY_RUN) {
    console.log('🔍 Dry run complete. Run without --dry-run to download logos.')
    return
  }
  
  // Download missing logos
  console.log('📥 Downloading missing logos...')
  console.log('')
  
  const results = {
    downloaded: [] as { name: string; source: string }[],
    failed: [] as string[]
  }
  
  for (const partner of missingLogos) {
    process.stdout.write(`   Downloading: ${partner.name.substring(0, 50).padEnd(50)}`)
    
    const result = await downloadPartnerLogo(partner)
    
    if (result.success) {
      console.log(`✅ (${result.source})`)
      results.downloaded.push({ name: partner.name, source: result.source })
    } else {
      console.log('❌ (no source)')
      results.failed.push(partner.name)
    }
    
    // Rate limiting
    await delay(500)
  }
  
  console.log('')
  console.log('📊 Summary')
  console.log(`   Downloaded: ${results.downloaded.length}`)
  console.log(`   Failed:     ${results.failed.length}`)
  
  if (results.failed.length > 0) {
    console.log('')
    console.log('⚠️  Failed logos (manual download required):')
    for (const name of results.failed) {
      console.log(`   - ${name}`)
    }
    console.log('')
    console.log('💡 Tip: For failed logos, you can:')
    console.log('   1. Download manually from partner websites')
    console.log('   2. Search for "[Partner Name] logo png" and save to public/images/')
    console.log('   3. Create a placeholder or use partner initials')
  }
  
  console.log('')
  console.log('✅ Partner logo sync complete!')
}

main().catch(console.error)
