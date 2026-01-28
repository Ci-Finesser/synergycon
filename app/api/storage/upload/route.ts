/**
 * Storage Upload API Route
 * Secure file upload endpoint with CSRF protection and validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { uploadFile } from '@/lib/supabase/storage'
import { validateCSRFToken } from '@/lib/csrf'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-logger'
import { validateFile, STORAGE_BUCKETS, type BucketConfig } from '@/types/storage'

// Rate limit for uploads: 20 uploads per 15 minutes
const UPLOAD_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
}

function getClientId(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

export async function POST(req: NextRequest) {
  const clientId = getClientId(req)

  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(req, UPLOAD_RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        type: 'rate_limit_exceeded',
        endpoint: '/api/storage/upload',
        clientId,
        userAgent: req.headers.get('user-agent') || undefined,
        details: 'Upload rate limit exceeded',
      })

      return NextResponse.json(
        { error: 'Too many uploads. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Parse form data
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const bucketId = formData.get('bucketId') as string | null
    const path = formData.get('path') as string | null
    const csrfToken = formData.get('_csrf') as string | null
    const upsert = formData.get('upsert') === 'true'

    // CSRF validation
    if (!csrfToken || !(await validateCSRFToken(csrfToken))) {
      logSecurityEvent({
        type: 'csrf_violation',
        endpoint: '/api/storage/upload',
        clientId,
        userAgent: req.headers.get('user-agent') || undefined,
        details: 'Invalid CSRF token for upload',
      })

      return NextResponse.json({ error: 'Invalid security token' }, { status: 403 })
    }

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!bucketId) {
      return NextResponse.json({ error: 'Bucket ID is required' }, { status: 400 })
    }

    // Get bucket configuration
    const bucketConfig = Object.values(STORAGE_BUCKETS).find((b) => b.id === bucketId)
    if (!bucketConfig) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    // Check if bucket requires authentication
    if (!bucketConfig.public) {
      const supabase = await createServerClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
    }

    // Validate file against bucket config
    const validation = validateFile(file, bucketConfig)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Generate file path
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
    const finalPath = path || `${timestamp}-${random}-${safeName}`

    // Upload file
    const supabase = await createServerClient()
    const { data, error } = await uploadFile(supabase, bucketId, finalPath, file, {
      contentType: file.type,
      upsert,
    })

    if (error) {
      logSecurityEvent({
        type: 'successful_submission',
        endpoint: '/api/storage/upload',
        clientId,
        userAgent: req.headers.get('user-agent') || undefined,
        details: `Upload failed: ${error.message}`,
      })

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    logSecurityEvent({
      type: 'successful_submission',
      endpoint: '/api/storage/upload',
      clientId,
      userAgent: req.headers.get('user-agent') || undefined,
      details: `File uploaded: ${finalPath}`,
    })

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('[Storage Upload] Error:', error)

    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}

// export const config = {
//   api: {
//     bodyParser: false, // Disable default body parser for file uploads
//   },
// }
