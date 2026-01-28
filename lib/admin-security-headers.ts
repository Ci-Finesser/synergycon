/**
 * Security headers configuration for admin routes
 * Prevents common attacks and scraper exploitation
 */

export const SECURITY_HEADERS = {
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",

  // Prevent MIME sniffing
  "X-Content-Type-Options": "nosniff",

  // Enable XSS protection
  "X-XSS-Protection": "1; mode=block",

  // Referrer policy (prevent leaking admin URLs)
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions policy (disable unnecessary features)
  "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=()",

  // Strict transport security (HTTPS only)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",

  // Prevent caching of sensitive data
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",

  // Additional bot prevention
  "X-Robots-Tag": "noindex, nofollow, noarchive, nositelinkssearchbox",
}

/**
 * Rate limit configuration for admin endpoints
 */
export const ADMIN_RATE_LIMITS = {
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  API: {
    maxRequests: 100,
    windowMs: 1 * 60 * 1000, // 1 minute
  },
  FORM_SUBMISSION: {
    maxRequests: 20,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
}

/**
 * Get security headers for response
 */
export function getAdminSecurityHeaders() {
  return SECURITY_HEADERS
}

/**
 * Validate request has acceptable rate limit status
 */
export function checkRateLimit(
  identifier: string,
  rateLimitKey: keyof typeof ADMIN_RATE_LIMITS,
  store: Map<string, { count: number; resetTime: number }>
): {
  allowed: boolean
  remaining: number
  resetTime?: number
} {
  const limit = ADMIN_RATE_LIMITS[rateLimitKey]
  const key = `${rateLimitKey}:${identifier}`
  const now = Date.now()

  const record = store.get(key)

  if (!record || now > record.resetTime) {
    // First request or window expired
    store.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    })
    return {
      allowed: true,
      remaining: limit.maxRequests - 1,
    }
  }

  if (record.count < limit.maxRequests) {
    record.count++
    return {
      allowed: true,
      remaining: limit.maxRequests - record.count,
    }
  }

  return {
    allowed: false,
    remaining: 0,
    resetTime: record.resetTime,
  }
}
