#!/usr/bin/env node
/**
 * Image Optimization Script
 * 
 * Compresses and resizes images in public/images to ensure fast loading.
 * 
 * Features:
 * - Resizes images to max 800x800 (configurable)
 * - Compresses to ~80% quality
 * - Keeps originals as backup (optional)
 * - Reports size savings
 * 
 * Usage:
 *   node --import tsx scripts/optimize-images.ts
 *   node --import tsx scripts/optimize-images.ts --dry-run
 *   node --import tsx scripts/optimize-images.ts --max-size 150  # Max 150KB
 *   node --import tsx scripts/optimize-images.ts --no-backup     # Don't keep originals
 */

import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')
const BACKUP_DIR = path.join(process.cwd(), 'public', 'images', '_originals')

// Configuration
const CONFIG = {
  maxWidth: 800,
  maxHeight: 800,
  jpegQuality: 70,
  pngCompressionLevel: 9,
  maxFileSizeKB: 200, // Target max file size in KB
  extensions: ['.jpg', '.jpeg', '.png'],
}

// Parse CLI arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const noBackup = args.includes('--no-backup')
const maxSizeIdx = args.indexOf('--max-size')
if (maxSizeIdx !== -1 && args[maxSizeIdx + 1]) {
  CONFIG.maxFileSizeKB = parseInt(args[maxSizeIdx + 1], 10)
}

interface ImageStats {
  file: string
  originalSize: number
  newSize: number
  savings: number
  savingsPercent: number
  skipped: boolean
  error?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function optimizeImage(filePath: string): Promise<ImageStats> {
  const fileName = path.basename(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const stats = fs.statSync(filePath)
  const originalSize = stats.size
  const originalSizeKB = originalSize / 1024

  // Skip if already under target size
  if (originalSizeKB <= CONFIG.maxFileSizeKB) {
    return {
      file: fileName,
      originalSize,
      newSize: originalSize,
      savings: 0,
      savingsPercent: 0,
      skipped: true,
    }
  }

  if (isDryRun) {
    // Estimate ~60% reduction for dry run
    const estimatedNew = Math.round(originalSize * 0.4)
    return {
      file: fileName,
      originalSize,
      newSize: estimatedNew,
      savings: originalSize - estimatedNew,
      savingsPercent: 60,
      skipped: false,
    }
  }

  try {
    // Read file into buffer first (avoids file locking issues on Windows)
    const inputBuffer = fs.readFileSync(filePath)
    const image = sharp(inputBuffer)
    const metadata = await image.metadata()

    // Determine if resize is needed
    const needsResize = (metadata.width && metadata.width > CONFIG.maxWidth) ||
                        (metadata.height && metadata.height > CONFIG.maxHeight)

    let pipeline = sharp(inputBuffer)

    if (needsResize) {
      pipeline = pipeline.resize(CONFIG.maxWidth, CONFIG.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    // Apply format-specific compression
    let outputBuffer: Buffer
    if (ext === '.png') {
      outputBuffer = await pipeline
        .png({ compressionLevel: CONFIG.pngCompressionLevel, quality: CONFIG.jpegQuality })
        .toBuffer()
    } else {
      outputBuffer = await pipeline
        .jpeg({ quality: CONFIG.jpegQuality, mozjpeg: true })
        .toBuffer()
    }

    const newSize = outputBuffer.length

    // Only save if we actually reduced size
    if (newSize < originalSize) {
      // Backup original if requested
      if (!noBackup) {
        if (!fs.existsSync(BACKUP_DIR)) {
          fs.mkdirSync(BACKUP_DIR, { recursive: true })
        }
        const backupPath = path.join(BACKUP_DIR, fileName)
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(filePath, backupPath)
        }
      }

      // Write optimized image
      fs.writeFileSync(filePath, outputBuffer)

      return {
        file: fileName,
        originalSize,
        newSize,
        savings: originalSize - newSize,
        savingsPercent: Math.round(((originalSize - newSize) / originalSize) * 100),
        skipped: false,
      }
    }

    return {
      file: fileName,
      originalSize,
      newSize: originalSize,
      savings: 0,
      savingsPercent: 0,
      skipped: true,
    }
  } catch (error) {
    return {
      file: fileName,
      originalSize,
      newSize: originalSize,
      savings: 0,
      savingsPercent: 0,
      skipped: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function main() {
  console.log('🖼️  Image Optimization Script')
  console.log('=' .repeat(60))
  console.log(`   Max dimensions: ${CONFIG.maxWidth}x${CONFIG.maxHeight}`)
  console.log(`   JPEG quality: ${CONFIG.jpegQuality}%`)
  console.log(`   Target max size: ${CONFIG.maxFileSizeKB} KB`)
  console.log(`   Backup originals: ${noBackup ? 'No' : 'Yes'}`)
  console.log(isDryRun ? '   [DRY RUN MODE]' : '')
  console.log('')

  // Find all images
  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => CONFIG.extensions.includes(path.extname(f).toLowerCase()))
    .filter(f => !f.startsWith('_')) // Skip backup folder
    .map(f => path.join(IMAGES_DIR, f))

  console.log(`📁 Found ${files.length} images to process`)
  console.log('')

  // Find images over target size
  const largeFiles = files.filter(f => {
    const stats = fs.statSync(f)
    return stats.size / 1024 > CONFIG.maxFileSizeKB
  })

  console.log(`⚠️  ${largeFiles.length} images exceed ${CONFIG.maxFileSizeKB} KB`)
  console.log('')

  if (largeFiles.length === 0) {
    console.log('✅ All images are within size limits!')
    return
  }

  // Process images
  const results: ImageStats[] = []
  for (const file of largeFiles) {
    const result = await optimizeImage(file)
    results.push(result)
    
    if (result.error) {
      console.log(`❌ ${result.file}: ${result.error}`)
    } else if (result.skipped) {
      console.log(`⏭️  ${result.file}: Already optimized`)
    } else {
      console.log(`✅ ${result.file}: ${formatBytes(result.originalSize)} → ${formatBytes(result.newSize)} (-${result.savingsPercent}%)`)
    }
  }

  // Summary
  const optimized = results.filter(r => !r.skipped && !r.error)
  const totalSavings = optimized.reduce((sum, r) => sum + r.savings, 0)
  const totalOriginal = optimized.reduce((sum, r) => sum + r.originalSize, 0)

  console.log('')
  console.log('=' .repeat(60))
  console.log('📊 Summary')
  console.log(`   Images processed: ${results.length}`)
  console.log(`   Images optimized: ${optimized.length}`)
  console.log(`   Images skipped: ${results.filter(r => r.skipped).length}`)
  console.log(`   Errors: ${results.filter(r => r.error).length}`)
  console.log('')
  console.log(`   Total savings: ${formatBytes(totalSavings)}`)
  if (totalOriginal > 0) {
    console.log(`   Average reduction: ${Math.round((totalSavings / totalOriginal) * 100)}%`)
  }

  if (!noBackup && !isDryRun && optimized.length > 0) {
    console.log('')
    console.log(`📦 Original files backed up to: public/images/_originals/`)
  }

  if (isDryRun) {
    console.log('')
    console.log('Run without --dry-run to apply changes.')
  }

  console.log('')
  console.log('✅ Done!')
}

main().catch(console.error)
