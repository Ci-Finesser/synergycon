/**
 * API Security Middleware
 * 
 * Helper functions to validate CSRF tokens, honeypot fields, and rate limiting in API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateCSRFToken } from './csrf'
import { validateBotProtection } from './honeypot'
import { checkRateLimit, type RateLimitConfig, RATE_LIMITS } from './rate-limit'
import { logSecurityEvent } from './security-logger'
import type { SecureRequestBody } from '@/types/utils'

// Re-export for backward compatibility
export type { SecureRequestBody }

/**
 * Get client identifier from request
 */
function getClientId(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  
  return 'unknown'
}

/**
 * Validate request security (CSRF + honeypot + rate limiting)
 * Returns null if valid, or NextResponse with error if invalid
 */
export async function validateRequestSecurity(
  req: Request,
  body: SecureRequestBody,
  options: {
    skipCSRF?: boolean
    skipHoneypot?: boolean
    skipTiming?: boolean
    rateLimit?: RateLimitConfig | false
  } = {}
): Promise<NextResponse | null> {
  // Check rate limit first (fastest check)
  if (options.rateLimit !== false) {
    const rateLimitConfig = options.rateLimit || RATE_LIMITS.STANDARD
    const rateLimitResult = checkRateLimit(req, rateLimitConfig)
    
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        type: 'rate_limit_exceeded',
        endpoint: req.url,
        clientId: getClientId(req),
        userAgent: req.headers.get('user-agent') || undefined,
        details: `Exceeded ${rateLimitConfig.maxRequests} requests in ${rateLimitConfig.windowMs}ms`,
      })
      
      console.warn('[Security] Rate limit exceeded')
      return NextResponse.json(
        {
          error: rateLimitResult.message,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      )
    }
  }

  // Validate CSRF token (unless skipped)
  if (!options.skipCSRF) {
    const isValidCSRF = await validateCSRFToken(body._csrf)
    if (!isValidCSRF) {
      logSecurityEvent({
        type: 'csrf_violation',
        endpoint: req.url,
        clientId: getClientId(req),
        userAgent: req.headers.get('user-agent') || undefined,
        details: 'Invalid or missing CSRF token',
      })
      
      console.warn('[Security] Invalid CSRF token')
      return NextResponse.json({ error: 'Invalid security token' }, { status: 403 })
    }
  }

  // Validate honeypot fields and timing (unless skipped)
  if (!options.skipHoneypot) {
    const { _csrf, _formStartTime, ...otherFields } = body
    const botCheck = validateBotProtection(
      otherFields,
      options.skipTiming ? undefined : _formStartTime
    )
    
    if (!botCheck.isValid) {
      const eventType = botCheck.reason?.includes('quickly') ? 'timing_violation' : 'honeypot_triggered'
      
      logSecurityEvent({
        type: eventType,
        endpoint: req.url,
        clientId: getClientId(req),
        userAgent: req.headers.get('user-agent') || undefined,
        details: botCheck.reason,
      })
      
      console.warn('[Security] Bot detected:', botCheck.reason)
      return NextResponse.json({ error: 'Invalid submission' }, { status: 403 })
    }
  }

  // Log that security checks passed (not that the request succeeded)
  logSecurityEvent({
    type: 'security_check_passed',
    endpoint: req.url,
    clientId: getClientId(req),
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return null // Valid request
}

/**
 * Clean security fields from request body
 */
export function cleanSecurityFields<T extends SecureRequestBody>(body: T): Omit<T, '_csrf' | '_formStartTime'> {
  const { _csrf, _formStartTime, ...cleanBody } = body
  return cleanBody as Omit<T, '_csrf' | '_formStartTime'>
}

/**
 * Wrapper for POST routes with automatic security validation
 */
export function securePost(
  handler: (req: NextRequest, body: any) => Promise<NextResponse>,
  options?: {
    skipCSRF?: boolean
    skipHoneypot?: boolean
    skipTiming?: boolean
    rateLimit?: RateLimitConfig | false
  }
) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json()

      // Validate security
      const securityError = await validateRequestSecurity(req, body, options)
      if (securityError) {
        return securityError
      }

      // Clean security fields from body
      const cleanBody = cleanSecurityFields(body)

      // Call the actual handler
      return await handler(req, cleanBody)
    } catch (error) {
      console.error('[API] Error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
