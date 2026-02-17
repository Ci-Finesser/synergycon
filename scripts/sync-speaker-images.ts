#!/usr/bin/env npx tsx
/**
 * Speaker Image Sync Script
 * 
 * This script:
 * 1. Reads the CSV file to get speaker names and Google Drive image links
 * 2. Compares against existing images in public/images/
 * 3. Downloads missing images from Google Drive
 * 
 * Usage: pnpm sync:images
 * Or:    npx tsx scripts/sync-speaker-images.ts
 * 
 * Options:
 *   --dry-run    Show what would be downloaded without actually downloading
 *   --force      Re-download all images (even existing ones)
 */

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as http from 'http'

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images')
const CSV_PATH = path.join(
  process.cwd(),
  'lib',
  'constants',
  'data',
  "SYNERGYCON 2.0 LISTS - Speakers JAN '26.csv"
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

interface ImageStatus {
  name: string
  expectedFileName: string
  googleDriveLink: string
  exists: boolean
  existingFile: string | null
  fileId: string | null
}

// =============================================================================
// CSV Parsing (handles multiline fields in quotes)
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
          // Escaped quote
          currentField += '"'
          i++
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        currentRow.push(currentField.trim())
        currentField = ''
      } else {
        currentField += char
      }
    }
    
    if (inQuotes) {
      // Multiline field - add newline and continue
      currentField += '\n'
    } else {
      // End of row
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
// Name to Filename Conversion
// =============================================================================

/**
 * Convert speaker name to expected image filename format
 * Examples:
 *   "Dr. Muiz Banire SAN" -> "dr-muiz-banire-san.jpg"
 *   "Dr. Jumoke Oduwole, MFR" -> "dr-jumoke-oduwole-mfr.jpg"
 *   "Mr. Kehinde Ogunwumiju SAN, OFR" -> "mr-kehinde-ogunwumiju-san-ofr.jpg"
 */
function nameToFileName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[.,'"()⁣⁢\u200B\u200C\u200D\uFEFF]/g, '') // Remove punctuation and zero-width chars
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Collapse multiple hyphens
    .replace(/^-|-$/g, '')     // Remove leading/trailing hyphens
    + '.jpg'
}

// =============================================================================
// Google Drive Utilities
// =============================================================================

/**
 * Extract Google Drive file ID from various URL formats
 */
function extractGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=drivesdk
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return fileMatch[1]
  
  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (openMatch) return openMatch[1]
  
  // Format: https://drive.google.com/uc?id=FILE_ID
  const ucMatch = url.match(/uc\?.*id=([a-zA-Z0-9_-]+)/)
  if (ucMatch) return ucMatch[1]
  
  return null
}

/**
 * Get direct download URL from Google Drive file ID
 */
function getGoogleDriveDirectUrl(fileId: string): string {
  // Try the direct download URL first
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

// =============================================================================
// File Download
// =============================================================================

/**
 * Download file from URL with redirect following
 */
async function downloadFile(url: string, destPath: string, speakerName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const maxRedirects = 10
    let redirectCount = 0
    
    function doRequest(currentUrl: string) {
      const protocol = currentUrl.startsWith('https') ? https : http
      
      const request = protocol.get(currentUrl, (response) => {
        // Handle redirects
        if (response.statusCode && [301, 302, 303, 307, 308].includes(response.statusCode)) {
          const redirectUrl = response.headers.location
          if (!redirectUrl) {
            console.log(`   ❌ Redirect without location header`)
            resolve(false)
            return
          }
          
          redirectCount++
          if (redirectCount > maxRedirects) {
            console.log(`   ❌ Too many redirects`)
            resolve(false)
            return
          }
          
          // Handle relative redirects
          const absoluteUrl = redirectUrl.startsWith('http') 
            ? redirectUrl 
            : new URL(redirectUrl, currentUrl).toString()
          
          doRequest(absoluteUrl)
          return
        }
        
        if (response.statusCode !== 200) {
          console.log(`   ❌ HTTP ${response.statusCode}: ${response.statusMessage}`)
          resolve(false)
          return
        }
        
        // Check content type
        const contentType = response.headers['content-type'] || ''
        
        // Handle Google Drive confirmation page (virus scan warning for large files)
        if (contentType.includes('text/html')) {
          let html = ''
          response.on('data', (chunk) => { html += chunk })
          response.on('end', () => {
            // Look for confirmation token or download link
            const confirmMatch = html.match(/confirm=([a-zA-Z0-9_-]+)/)
            const uuidMatch = html.match(/uuid=([a-zA-Z0-9_-]+)/)
            
            if (confirmMatch || uuidMatch) {
              let newUrl = currentUrl
              if (confirmMatch) {
                newUrl += `&confirm=${confirmMatch[1]}`
              }
              if (uuidMatch) {
                newUrl += `&uuid=${uuidMatch[1]}`
              }
              doRequest(newUrl)
            } else {
              // Try alternative download URL
              const fileIdMatch = currentUrl.match(/id=([a-zA-Z0-9_-]+)/)
              if (fileIdMatch && !currentUrl.includes('drive.usercontent.google.com')) {
                const altUrl = `https://drive.usercontent.google.com/download?id=${fileIdMatch[1]}&export=download&confirm=t`
                doRequest(altUrl)
              } else {
                console.log(`   ❌ Google Drive returned HTML page instead of file`)
                console.log(`      File may not be publicly accessible`)
                resolve(false)
              }
            }
          })
          return
        }
        
        // Write the file
        const file = fs.createWriteStream(destPath)
        response.pipe(file)
        
        file.on('finish', () => {
          file.close()
          
          // Verify file was downloaded and has content
          try {
            const stats = fs.statSync(destPath)
            if (stats.size < 1000) {
              fs.unlinkSync(destPath)
              console.log(`   ❌ Downloaded file too small (${stats.size} bytes)`)
              resolve(false)
            } else {
              console.log(`   ✅ Downloaded (${(stats.size / 1024).toFixed(1)} KB)`)
              resolve(true)
            }
          } catch {
            resolve(false)
          }
        })
        
        file.on('error', (err) => {
          try { fs.unlinkSync(destPath) } catch { /* ignore */ }
          console.log(`   ❌ Write error: ${err.message}`)
          resolve(false)
        })
      })
      
      request.on('error', (err) => {
        console.log(`   ❌ Network error: ${err.message}`)
        resolve(false)
      })
      
      request.setTimeout(30000, () => {
        request.destroy()
        console.log(`   ❌ Request timeout`)
        resolve(false)
      })
    }
    
    doRequest(url)
  })
}

// =============================================================================
// Image File Checking
// =============================================================================

/**
 * Check if image file exists with various extensions
 */
function findExistingImage(baseName: string, allFiles: string[]): string | null {
  const extensions = ['.jpg', '.jpeg', '.png', '.webp']
  const baseWithoutExt = baseName.replace(/\.[^.]+$/, '')
  
  for (const ext of extensions) {
    const fileName = baseWithoutExt + ext
    if (allFiles.includes(fileName)) {
      return fileName
    }
  }
  
  // Also check for URL-encoded variants (legacy)
  const legacyName = baseWithoutExt.replace(/-/g, '-20').replace(/-2020/g, '-20') + '.jpg'
  if (allFiles.includes(legacyName)) {
    return legacyName
  }
  
  return null
}

// =============================================================================
// Main Script
// =============================================================================

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const isForce = args.includes('--force')
  
  console.log('🔍 Speaker Image Sync Script')
  console.log('='.repeat(60))
  
  if (isDryRun) {
    console.log('📋 DRY RUN MODE - No files will be downloaded\n')
  }
  if (isForce) {
    console.log('⚠️  FORCE MODE - Re-downloading all images\n')
  }
  
  // Ensure images directory exists
  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true })
    console.log(`📁 Created directory: ${PUBLIC_IMAGES_DIR}`)
  }
  
  // Get list of existing image files
  const existingFiles = fs.readdirSync(PUBLIC_IMAGES_DIR)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  
  console.log(`📁 Found ${existingFiles.length} existing images in public/images/`)
  
  // Read and parse CSV
  console.log(`\n📄 Reading CSV: ${CSV_PATH}`)
  
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV file not found: ${CSV_PATH}`)
    process.exit(1)
  }
  
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  const records = parseCSV(csvContent)
  
  console.log(`   Found ${records.length} speaker records in CSV\n`)
  
  // Analyze each speaker
  const imageStatuses: ImageStatus[] = []
  
  for (const record of records) {
    const name = record.name?.trim()
    if (!name) continue
    
    const expectedFileName = nameToFileName(name)
    const googleDriveLink = record.googleDriveLink?.trim() || ''
    const fileId = extractGoogleDriveFileId(googleDriveLink)
    const existingFile = findExistingImage(expectedFileName, existingFiles)
    
    imageStatuses.push({
      name,
      expectedFileName,
      googleDriveLink,
      exists: !!existingFile,
      existingFile,
      fileId,
    })
  }
  
  // Report status
  const missing = imageStatuses.filter(s => !s.exists || isForce)
  const present = imageStatuses.filter(s => s.exists && !isForce)
  const noGoogleLink = missing.filter(s => !s.fileId)
  const downloadable = missing.filter(s => s.fileId)
  
  console.log('📊 Image Status Summary')
  console.log('-'.repeat(60))
  console.log(`   ✅ Present:     ${present.length} images`)
  console.log(`   ❌ Missing:     ${missing.length} images`)
  console.log(`      ├─ With Google Drive link: ${downloadable.length}`)
  console.log(`      └─ No valid link:          ${noGoogleLink.length}`)
  
  // Show detailed list of present images
  if (present.length > 0) {
    console.log('\n✅ Images already present:')
    for (const s of present.slice(0, 10)) {
      console.log(`   • ${s.name}`)
      console.log(`     → ${s.existingFile}`)
    }
    if (present.length > 10) {
      console.log(`   ... and ${present.length - 10} more`)
    }
  }
  
  // Show speakers without valid Google Drive links
  if (noGoogleLink.length > 0) {
    console.log('\n⚠️  Speakers without valid Google Drive links:')
    for (const s of noGoogleLink) {
      console.log(`   • ${s.name}`)
      console.log(`     Expected: ${s.expectedFileName}`)
      if (s.googleDriveLink) {
        console.log(`     Invalid link: ${s.googleDriveLink.substring(0, 60)}...`)
      }
    }
  }
  
  if (downloadable.length === 0) {
    console.log('\n✅ No images to download!')
    return
  }
  
  // Show what will be downloaded
  console.log('\n📥 Images to download:')
  for (const s of downloadable) {
    console.log(`   • ${s.name} → ${s.expectedFileName}`)
  }
  
  if (isDryRun) {
    console.log('\n📋 Dry run complete. Use without --dry-run to download.')
    return
  }
  
  console.log('\n📥 Downloading missing images...')
  console.log('-'.repeat(60))
  
  let successCount = 0
  let failCount = 0
  const failedSpeakers: ImageStatus[] = []
  
  for (const speaker of downloadable) {
    const destPath = path.join(PUBLIC_IMAGES_DIR, speaker.expectedFileName)
    const downloadUrl = getGoogleDriveDirectUrl(speaker.fileId!)
    
    console.log(`\n📷 ${speaker.name}`)
    console.log(`   File: ${speaker.expectedFileName}`)
    console.log(`   ID:   ${speaker.fileId}`)
    
    const success = await downloadFile(downloadUrl, destPath, speaker.name)
    
    if (success) {
      successCount++
    } else {
      failCount++
      failedSpeakers.push(speaker)
    }
    
    // Rate limiting to avoid Google Drive throttling (1.5 seconds between requests)
    await new Promise(resolve => setTimeout(resolve, 1500))
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 Download Summary')
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed:     ${failCount}`)
  
  if (failedSpeakers.length > 0) {
    console.log('\n❌ Failed downloads:')
    for (const s of failedSpeakers) {
      console.log(`   • ${s.name}`)
      console.log(`     Link: ${s.googleDriveLink}`)
    }
    
    console.log('\n💡 Tips for failed downloads:')
    console.log('   1. Ensure files are shared publicly ("Anyone with the link")')
    console.log('   2. Try manual download from Google Drive')
    console.log('   3. Use gdown tool: pip install gdown && gdown "LINK"')
    console.log('   4. Check if the Google Drive link is correct')
  }
  
  // Generate manual download commands for failed images
  if (failedSpeakers.length > 0) {
    console.log('\n📋 Manual download commands (gdown):')
    console.log('```bash')
    console.log('pip install gdown')
    for (const s of failedSpeakers) {
      if (s.fileId) {
        console.log(`gdown "https://drive.google.com/uc?id=${s.fileId}" -O "public/images/${s.expectedFileName}"`)
      }
    }
    console.log('```')
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Script failed:', error)
  process.exit(1)
})
