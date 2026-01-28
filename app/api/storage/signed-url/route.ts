/**
 * Storage Signed URL API Route
 * Generate signed URLs for temporary file access
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createSignedUrl, createSignedUrls, createSignedUploadUrl } from '@/lib/supabase/storage'
import { validateCSRFToken } from '@/lib/csrf'
import { checkRateLimit } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-logger'
import { STORAGE_BUCKETS, type ImageTransformOptions } from '@/types/storage'

// Rate limit for signed URLs: 100 requests per 15 minutes
const SIGNED_URL_RATE_LIMIT = {
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

// GET: Generate signed URL for download
export async function GET(req: NextRequest) {
  const clientId = getClientId(req)

  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(req, SIGNED_URL_RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        type: 'rate_limit_exceeded',
        endpoint: '/api/storage/signed-url',
        clientId,
        userAgent: req.headers.get('user-agent') || undefined,
        details: 'Signed URL rate limit exceeded',
      })

      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
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
    const paths = searchParams.get('paths') // Comma-separated paths for batch
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600', 10)
    const download = searchParams.get('download')

    // Transform options
    const width = searchParams.get('width')
    const height = searchParams.get('height')
    const quality = searchParams.get('quality')
    const format = searchParams.get('format') as ImageTransformOptions['format']

    // Validate required fields
    if (!bucketId) {
      return NextResponse.json({ error: 'Bucket ID is required' }, { status: 400 })
    }

    if (!path && !paths) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 })
    }

    // Validate expiresIn (max 7 days)
    if (expiresIn < 1 || expiresIn > 604800) {
      return NextResponse.json(
        { error: 'Expiration must be between 1 second and 7 days' },
        { status: 400 }
      )
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

    // Build transform options
    const transform: ImageTransformOptions | undefined =
      width || height || quality || format
        ? {
            width: width ? parseInt(width, 10) : undefined,
            height: height ? parseInt(height, 10) : undefined,
            quality: quality ? parseInt(quality, 10) : undefined,
            format,
          }
        : undefined

    // Handle batch or single request
    if (paths) {
      // Batch signed URLs
      const pathList = paths.split(',').map((p) => p.trim())

      if (pathList.length > 50) {
        return NextResponse.json(
          { error: 'Cannot generate more than 50 signed URLs at once' },
          { status: 400 }
        )
      }

      const { data, error } = await createSignedUrls(supabase, bucketId, pathList, expiresIn)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        signedUrls: data,
      })
    } else {
      // Single signed URL
      const { data, error } = await createSignedUrl(supabase, bucketId, path!, {
        expiresIn,
        transform,
        download: download === 'true' ? true : download || undefined,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        signedUrl: data?.signedUrl,
        path: data?.path,
        expiresAt: data?.expiresAt,
      })
    }
  } catch (error) {
    console.error('[Storage Signed URL] Error:', error)

    return NextResponse.json(
      { error: 'Failed to generate signed URL. Please try again.' },
      { status: 500 }
    )
  }
}

// POST: Generate signed upload URL
export async function POST(req: NextRequest) {
  const clientId = getClientId(req)

  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(req, SIGNED_URL_RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        type: 'rate_limit_exceeded',
        endpoint: '/api/storage/signed-url',
        clientId,
        userAgent: req.headers.get('user-agent') || undefined,
        details: 'Signed upload URL rate limit exceeded',
      })

      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Parse request body
    const body = await req.json()
    const { bucketId, path, _csrf } = body

    // CSRF validation
    if (!_csrf || !(await validateCSRFToken(_csrf))) {
      logSecurityEvent({
        type: 'csrf_violation',
        endpoint: '/api/storage/signed-url',
        clientId,
        userAgent: req.headers.get('user-agent') || undefined,
        details: 'Invalid CSRF token for signed upload URL',
      })

      return NextResponse.json({ error: 'Invalid security token' }, { status: 403 })
    }

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

    // Authentication required for upload URLs
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Generate signed upload URL
    const { data, error } = await createSignedUploadUrl(supabase, bucketId, path)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    logSecurityEvent({
      type: 'successful_submission',
      endpoint: '/api/storage/signed-url',
      clientId,
      userAgent: req.headers.get('user-agent') || undefined,
      details: `Signed upload URL generated for: ${path}`,
    })

    return NextResponse.json({
      success: true,
      signedUrl: data?.signedUrl,
      path: data?.path,
      token: data?.token,
    })
  } catch (error) {
    console.error('[Storage Signed URL] Error:', error)

    return NextResponse.json(
      { error: 'Failed to generate signed upload URL. Please try again.' },
      { status: 500 }
    )
  }
}
