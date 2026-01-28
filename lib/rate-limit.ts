/**
 * Rate Limiting Utility
 * 
 * Implements in-memory rate limiting for API endpoints to prevent abuse.
 * For production, consider using Redis or a dedicated rate limiting service.
 */

import type { RateLimitEntry, RateLimitConfig, RateLimitEntryInternal } from '@/types/utils'

// Re-export for backward compatibility
export type { RateLimitEntry, RateLimitConfig, RateLimitEntryInternal }

// In-memory store (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, RateLimitEntryInternal>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  /** Standard rate limit for most endpoints: 60 requests per minute */
  STANDARD: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },
  /** Strict rate limit for sensitive endpoints: 10 requests per minute */
  STRICT: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
  /** Auth rate limit: 5 login attempts per 15 minutes */
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  /** Form submission: 3 submissions per 5 minutes */
  FORM: {
    maxRequests: 3,
    windowMs: 5 * 60 * 1000,
    message: 'Too many submissions. Please try again in a few minutes.',
  },
  /** Newsletter: 1 subscription per IP per hour */
  NEWSLETTER: {
    maxRequests: 1,
    windowMs: 60 * 60 * 1000,
    message: 'You have already subscribed recently. Please try again later.',
  },
  BECOME_PARTNER: {
    maxRequests: 1,
    windowMs: 60 * 60 * 1000,
    message: 'You have already submitted an application recently. Please try again later.',
  },
} as const

/**
 * Get client identifier from request (IP address or custom key)
 */
function getClientId(req: Request, keyGenerator?: (req: Request) => string): string {
  if (keyGenerator) {
    return keyGenerator(req)
  }

  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a default identifier
  return 'unknown'
}

/**
 * Check if request exceeds rate limit
 */
export function checkRateLimit(
  req: Request,
  config: RateLimitConfig
): {
  allowed: boolean
  remaining: number
  resetTime: number
  message?: string
} {
  const clientId = getClientId(req, config.keyGenerator)
  const key = `${clientId}:${req.url}`
  const now = Date.now()

  let entry = rateLimitStore.get(key)

  // Create new entry if doesn't exist or expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, entry)
  }

  // Increment count
  entry.count++

  const allowed = entry.count <= config.maxRequests
  const remaining = Math.max(0, config.maxRequests - entry.count)

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    message: config.message || 'Rate limit exceeded. Please try again later.',
  }
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (req: Request, ...args: any[]) => Promise<Response>,
  config: RateLimitConfig = RATE_LIMITS.STANDARD
) {
  return async (req: Request, ...args: any[]) => {
    const result = checkRateLimit(req, config)

    // Add rate limit headers
    const headers = new Headers()
    headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

    if (!result.allowed) {
      console.warn(`[RateLimit] Blocked request from ${getClientId(req, config.keyGenerator)} to ${req.url}`)
      return new Response(
        JSON.stringify({
          error: result.message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            ...Object.fromEntries(headers),
          },
        }
      )
    }

    // Execute handler and add rate limit headers to response
    const response = await handler(req, ...args)
    
    // Clone response to add headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    })

    headers.forEach((value, key) => {
      newResponse.headers.set(key, value)
    })

    return newResponse
  }
}

/**
 * Reset rate limit for a specific client (useful for testing or admin overrides)
 */
export function resetRateLimit(req: Request, keyGenerator?: (req: Request) => string): void {
  const clientId = getClientId(req, keyGenerator)
  const key = `${clientId}:${req.url}`
  rateLimitStore.delete(key)
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  req: Request,
  config: RateLimitConfig
): {
  count: number
  remaining: number
  resetTime: number
} {
  const clientId = getClientId(req, config.keyGenerator)
  const key = `${clientId}:${req.url}`
  const now = Date.now()

  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    return {
      count: 0,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    }
  }

  return {
    count: entry.count,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
  }
}
