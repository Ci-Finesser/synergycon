#!/usr/bin/env node

/**
 * PWA Setup Script
 * Generates VAPID keys for push notifications and PWA icons
 * 
 * Features:
 * - VAPID key generation for web push
 * - Automatic icon generation (72x72 to 512x512)
 * - Maskable icon generation with safe zones
 * - Favicon generation
 * - Apple touch icon
 * - High-quality image optimization
 */

const crypto = require('crypto')
const fs = require('fs').promises
const fsSync = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

// PWA icon sizes (following PWA best practices)
const ICON_SIZES = [
  { size: 72, purpose: 'any' },
  { size: 96, purpose: 'any' },
  { size: 128, purpose: 'any' },
  { size: 144, purpose: 'any' },
  { size: 152, purpose: 'any' },
  { size: 192, purpose: 'any maskable' },
  { size: 384, purpose: 'any maskable' },
  { size: 512, purpose: 'any maskable' }
]

// Additional icon configurations
const ADDITIONAL_ICONS = [
  { name: 'favicon', size: 32 },
  { name: 'apple-touch-icon', size: 180 }
]

/**
 * URL-safe Base64 encoding for VAPID keys
 */
function urlBase64(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Generate VAPID keys for push notifications
 */
function generateVAPIDKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' }
  })

  return {
    publicKey: urlBase64(publicKey),
    privateKey: urlBase64(privateKey)
  }
}

/**
 * Check if sharp is installed
 */
async function checkSharp() {
  try {
    require.resolve('sharp')
    return true
  } catch (e) {
    return false
  }
}

/**
 * Install sharp if not present
 */
async function ensureSharp() {
  const hasSharp = await checkSharp()
  
  if (!hasSharp) {
    console.log('📦 Installing sharp for image processing...')
    try {
      // Detect package manager
      const hasPnpm = fsSync.existsSync('pnpm-lock.yaml')
      const hasYarn = fsSync.existsSync('yarn.lock')
      
      let installCmd
      if (hasPnpm) {
        installCmd = 'npx pnpm add -D sharp'
      } else if (hasYarn) {
        installCmd = 'yarn add --dev sharp'
      } else {
        installCmd = 'npm install --save-dev sharp --legacy-peer-deps'
      }
      
      await execAsync(installCmd)
      console.log('✅ Sharp installed successfully\n')
      return true
    } catch (error) {
      console.error('❌ Failed to install sharp:', error.message)
      console.log('   Please install manually: npm install --save-dev sharp --legacy-peer-deps\n')
      return false
    }
  }
  
  return true
}

/**
 * Find source icon in public directory
 */
async function findSourceIcon(publicDir) {
  const possibleNames = [
    'icon.svg',
    'icon.png',
    'logo.svg',
    'logo.png',
    'app-icon.svg',
    'app-icon.png',
    'icon-512x512.png',
    'icon-source.png'
  ]

  for (const name of possibleNames) {
    const iconPath = path.join(publicDir, name)
    if (fsSync.existsSync(iconPath)) {
      return iconPath
    }
  }

  return null
}

/**
 * Generate maskable icon with safe zone padding
 */
async function generateMaskableIcon(sharp, inputBuffer, size) {
  // Maskable icons need 10% safe zone on all sides
  const safeZonePercent = 0.1
  const innerSize = Math.floor(size * (1 - 2 * safeZonePercent))
  const padding = Math.floor((size - innerSize) / 2)

  return await sharp(inputBuffer)
    .resize(innerSize, innerSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({
      quality: 100,
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: true
    })
    .toBuffer()
}

/**
 * Generate all PWA icons
 */
async function generateIcons(sourceIcon, publicDir) {
  console.log('🎨 Generating PWA icons from:', path.basename(sourceIcon))
  
  const sharp = require('sharp')
  const sourceBuffer = await fs.readFile(sourceIcon)
  
  // Get source image metadata
  const metadata = await sharp(sourceBuffer).metadata()
  console.log(`   Source: ${metadata.width}x${metadata.height} ${metadata.format}\n`)

  let generated = 0
  let skipped = 0

  // Generate PWA icons
  for (const { size, purpose } of ICON_SIZES) {
    const filename = `icon-${size}x${size}.png`
    const outputPath = path.join(publicDir, filename)
    
    try {
      let buffer
      
      if (purpose.includes('maskable')) {
        buffer = await generateMaskableIcon(sharp, sourceBuffer, size)
      } else {
        buffer = await sharp(sourceBuffer)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png({
            quality: 100,
            compressionLevel: 9,
            adaptiveFiltering: true,
            palette: true
          })
          .toBuffer()
      }
      
      await fs.writeFile(outputPath, buffer)
      console.log(`   ✓ ${filename} (${purpose})`)
      generated++
    } catch (error) {
      console.error(`   ✗ Failed to generate ${filename}:`, error.message)
      skipped++
    }
  }

  // Generate additional icons
  console.log('\n📱 Generating additional icons...\n')
  
  for (const { name, size } of ADDITIONAL_ICONS) {
    const filename = `${name}.png`
    const outputPath = path.join(publicDir, filename)
    
    try {
      const buffer = await sharp(sourceBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: name === 'favicon' 
            ? { r: 0, g: 0, b: 0, alpha: 0 }
            : { r: 0, g: 0, b: 0, alpha: 1 }
        })
        .png({
          quality: 100,
          compressionLevel: 9
        })
        .toBuffer()
      
      await fs.writeFile(outputPath, buffer)
      console.log(`   ✓ ${filename} (${size}x${size})`)
      generated++
    } catch (error) {
      console.error(`   ✗ Failed to generate ${filename}:`, error.message)
      skipped++
    }
  }

  return { generated, skipped }
}

/**
 * Update or create manifest.json
 */
async function updateManifest(publicDir) {
  const manifestPath = path.join(publicDir, 'manifest.json')
  let manifest = {}

  // Read existing manifest if it exists
  if (fsSync.existsSync(manifestPath)) {
    const content = await fs.readFile(manifestPath, 'utf8')
    manifest = JSON.parse(content)
    console.log('\n📝 Updating existing manifest.json')
  } else {
    console.log('\n📝 Creating manifest.json')
  }

  // Update icons array
  manifest.icons = ICON_SIZES.map(({ size, purpose }) => ({
    src: `/icon-${size}x${size}.png`,
    sizes: `${size}x${size}`,
    type: 'image/png',
    purpose
  }))

  // Ensure essential manifest fields
  manifest.name = manifest.name || 'SynergyCon 2026'
  manifest.short_name = manifest.short_name || 'SynergyCon'
  manifest.description = manifest.description || 'The Ultimate Tech and Innovation Conference'
  manifest.start_url = manifest.start_url || '/'
  manifest.display = manifest.display || 'standalone'
  manifest.background_color = manifest.background_color || '#000000'
  manifest.theme_color = manifest.theme_color || '#000000'
  manifest.orientation = manifest.orientation || 'portrait-primary'

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  console.log('   ✓ manifest.json updated with icon references')
}

/**
 * Setup VAPID keys
 */
async function setupVAPIDKeys() {
  console.log('🔐 Generating VAPID keys for Push Notifications...\n')

  const keys = generateVAPIDKeys()

  const envContent = `
# PWA Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}
VAPID_PRIVATE_KEY=${keys.privateKey}
`

  const envPath = path.join(process.cwd(), '.env.local')
  
  // Check if file exists and has VAPID keys
  if (fsSync.existsSync(envPath)) {
    const existingContent = await fs.readFile(envPath, 'utf8')
    
    if (existingContent.includes('NEXT_PUBLIC_VAPID_PUBLIC_KEY')) {
      console.log('ℹ️  VAPID keys already exist in .env.local\n')
      return false
    } else {
      await fs.appendFile(envPath, envContent)
      console.log('✅ VAPID keys added to .env.local\n')
    }
  } else {
    await fs.writeFile(envPath, envContent.trim() + '\n')
    console.log('✅ Created .env.local with VAPID keys\n')
  }

  console.log('   Public Key:', keys.publicKey)
  console.log('   Private Key:', keys.privateKey.substring(0, 20) + '...[hidden]\n')
  
  return true
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 PWA Setup Script\n')
  console.log('═'.repeat(60) + '\n')

  try {
    // Setup VAPID keys
    await setupVAPIDKeys()

    // Ensure sharp is installed
    const sharpInstalled = await ensureSharp()
    
    if (!sharpInstalled) {
      console.log('\n⚠️  Icon generation skipped - sharp installation failed')
      console.log('   Install manually: npm install --save-dev sharp\n')
      return
    }

    // Find source icon
    const publicDir = path.join(process.cwd(), 'public')
    const sourceIcon = await findSourceIcon(publicDir)

    if (!sourceIcon) {
      console.log('⚠️  No source icon found in public directory')
      console.log('   Place one of these files in /public:')
      console.log('   - icon.svg, icon.png, logo.svg, or logo.png')
      console.log('   Recommended: 512x512px or larger\n')
      return
    }

    // Generate icons
    const { generated, skipped } = await generateIcons(sourceIcon, publicDir)

    // Update manifest
    await updateManifest(publicDir)

    // Summary
    console.log('\n' + '═'.repeat(60))
    console.log('\n✨ PWA Setup Complete!\n')
    console.log(`   Icons generated: ${generated}`)
    if (skipped > 0) {
      console.log(`   Icons skipped: ${skipped}`)
    }
    
    console.log('\n📋 Next Steps:\n')
    console.log('   1. Update NEXT_PUBLIC_APP_URL in .env.local with your domain')
    console.log('   2. Review generated icons in /public directory')
    console.log('   3. Test manifest: /manifest.json')
    console.log('   4. Build and test: npm run build && npm start')
    console.log('   5. Verify PWA: Chrome DevTools > Application > Manifest')
    console.log('   6. Test installation: Click install prompt or use DevTools\n')
    console.log('═'.repeat(60) + '\n')

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    console.error('\nStack trace:', error.stack)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}
