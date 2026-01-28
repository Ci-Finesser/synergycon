/**
 * Storage Download API Route
 * Secure file download with signed URL generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { downloadFile, createSignedUrl, getPublicUrl } from '@/lib/supabase/storage'
import { checkRateLimit } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-logger'
import { STORAGE_BUCKETS } from '@/types/storage'

// Rate limit for downloads: 100 downloads per 15 minutes
const DOWNLOAD_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
}

function getClientId(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

export async function GET(req: NextRequest) {
  const clientId = getClientId(req)

  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(req, DOWNLOAD_RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        type: 'rate_limit_exceeded',
        endpoint: '/api/storage/download',
        clientId,
        userAgent: req.headers.get('user-agent') || undefined,
        details: 'Download rate limit exceeded',
      })

      return NextResponse.json(
        { error: 'Too many downloads. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const bucketId = searchParams.get('bucketId')
    const path = searchParams.get('path')
    const mode = searchParams.get('mode') || 'url' // 'url' | 'signed' | 'blob'
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600', 10)

    // Validate required fields
    if (!bucketId) {
      return NextResponse.json({ error: 'Bucket ID is required' }, { status: 400 })
    }

    if (!path) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 })
    }

    // Get bucket configuration
    const bucketConfig = Object.values(STORAGE_BUCKETS).find((b) => b.id === bucketId)
    if (!bucketConfig) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Check authentication for private buckets
    if (!bucketConfig.public) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
    }

    // Handle different download modes
    switch (mode) {
      case 'url': {
        // Return public URL (only for public buckets)
        if (!bucketConfig.public) {
          return NextResponse.json(
            { error: 'Cannot get public URL for private bucket' },
            { status: 400 }
          )
        }

        const url = getPublicUrl(supabase, bucketId, path)
        return NextResponse.json({ success: true, url })
      }

      case 'signed': {
        // Generate signed URL
        const { data, error } = await createSignedUrl(supabase, bucketId, path, {
          expiresIn,
        })

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          signedUrl: data?.signedUrl,
          expiresAt: data?.expiresAt,
        })
      }

      case 'blob': {
        // Download and return blob
        const { data, error } = await downloadFile(supabase, bucketId, path)

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!data) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        // Return file as response
        const headers = new Headers()
        headers.set('Content-Type', data.contentType || 'application/octet-stream')
        headers.set('Content-Disposition', `attachment; filename="${data.filename || 'download'}"`)
        if (data.size) {
          headers.set('Content-Length', data.size.toString())
        }

        return new NextResponse(data.data, { headers })
      }

      default:
        return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Storage Download] Error:', error)

    return NextResponse.json(
      { error: 'Download failed. Please try again.' },
      { status: 500 }
    )
  }
}
