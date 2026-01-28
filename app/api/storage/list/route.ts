/**
 * Storage List API Route
 * List files in a bucket with pagination and filtering
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { listFiles } from '@/lib/supabase/storage'
import { checkRateLimit } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-logger'
import { STORAGE_BUCKETS } from '@/types/storage'

// Rate limit for list operations: 200 requests per 15 minutes
const LIST_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 200,
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
    const rateLimitResult = checkRateLimit(req, LIST_RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        type: 'rate_limit_exceeded',
        endpoint: '/api/storage/list',
        clientId,
        userAgent: req.headers.get('user-agent') || undefined,
        details: 'List rate limit exceeded',
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
    const path = searchParams.get('path') || ''
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const search = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sortBy') as 'name' | 'created_at' | 'updated_at' | null
    const order = searchParams.get('order') as 'asc' | 'desc' | null

    // Validate required fields
    if (!bucketId) {
      return NextResponse.json({ error: 'Bucket ID is required' }, { status: 400 })
    }

    // Validate limit
    if (limit < 1 || limit > 1000) {
      return NextResponse.json({ error: 'Limit must be between 1 and 1000' }, { status: 400 })
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

    // List files
    const { data, error } = await listFiles(supabase, bucketId, path, {
      limit,
      offset,
      search,
      sortBy: sortBy && order ? { column: sortBy, order } : undefined,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      files: data || [],
      pagination: {
        limit,
        offset,
        hasMore: (data?.length || 0) === limit,
      },
    })
  } catch (error) {
    console.error('[Storage List] Error:', error)

    return NextResponse.json(
      { error: 'Failed to list files. Please try again.' },
      { status: 500 }
    )
  }
}
