/**
 * CSRF (Cross-Site Request Forgery) Protection Utilities - Client Side
 * 
 * Client-safe CSRF utilities that don't depend on Next.js server APIs
 */

const CSRF_TOKEN_LENGTH = 32

/**
 * Generate a cryptographically secure random token (client-side only)
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Client-side: Get CSRF token from meta tag
 */
export function getClientCSRFToken(): string | null {
  if (typeof window === 'undefined') return null
  
  const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
  return metaTag?.content || null
}

/**
 * Client-side: Get CSRF token from cookie
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrf_token') {
      return decodeURIComponent(value)
    }
  }
  return null
}
