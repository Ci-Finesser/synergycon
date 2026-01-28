/**
 * Storage Delete API Route
 * Secure file deletion with CSRF protection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { deleteFiles } from '@/lib/supabase/storage'
import { validateCSRFToken } from '@/lib/csrf'
import { checkRateLimit } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-logger'
import { STORAGE_BUCKETS } from '@/types/storage'

// Rate limit for deletes: 50 deletes per 15 minutes
const DELETE_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 50,
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
    const rateLimitResult = checkRateLimit(req, DELETE_RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        type: 'rate_limit_exceeded',
        endpoint: '/api/storage/delete',
        clientId,
        userAgent: req.headers.get('user-agent') || undefined,
        details: 'Delete rate limit exceeded',
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
    const { bucketId, paths, _csrf } = body

    // CSRF validation
    if (!_csrf || !(await validateCSRFToken(_csrf))) {
      logSecurityEvent({
        type: 'csrf_violation',
        endpoint: '/api/storage/delete',
        clientId,
        userAgent: req.headers.get('user-agent') || undefined,
        details: 'Invalid CSRF token for delete',
      })

      return NextResponse.json({ error: 'Invalid security token' }, { status: 403 })
    }

    // Validate required fields
    if (!bucketId) {
      return NextResponse.json({ error: 'Bucket ID is required' }, { status: 400 })
    }

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: 'File paths are required' }, { status: 400 })
    }

    if (paths.length > 100) {
      return NextResponse.json(
        { error: 'Cannot delete more than 100 files at once' },
        { status: 400 }
      )
    }

    // Get bucket configuration
    const bucketConfig = Object.values(STORAGE_BUCKETS).find((b) => b.id === bucketId)
    if (!bucketConfig) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    // Authentication required for all delete operations
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Delete files
    const { data, error } = await deleteFiles(supabase, bucketId, paths)

    if (error) {
      logSecurityEvent({
        type: 'successful_submission',
        endpoint: '/api/storage/delete',
        clientId,
        userAgent: req.headers.get('user-agent') || undefined,
        details: `Delete failed: ${error.message}`,
      })

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    logSecurityEvent({
      type: 'successful_submission',
      endpoint: '/api/storage/delete',
      clientId,
      userAgent: req.headers.get('user-agent') || undefined,
      details: `Files deleted: ${paths.join(', ')}`,
    })

    return NextResponse.json({
      success: true,
      deleted: paths,
    })
  } catch (error) {
    console.error('[Storage Delete] Error:', error)

    return NextResponse.json(
      { error: 'Delete failed. Please try again.' },
      { status: 500 }
    )
  }
}
