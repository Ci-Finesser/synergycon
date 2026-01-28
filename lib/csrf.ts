/**
 * CSRF (Cross-Site Request Forgery) Protection Utilities - Server Side
 * 
 * Server-only CSRF utilities that use Next.js server APIs
 * DO NOT import this in client components - use csrf-client.ts instead
 */

import { cookies } from 'next/headers'

const CSRF_TOKEN_NAME = 'csrf_token'
const CSRF_TOKEN_LENGTH = 32

/**
 * Generate a cryptographically secure random token (server-side)
 */
function generateCSRFTokenServer(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Store CSRF token in HTTP-only cookie (server-side only)
 */
export async function setCSRFToken(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

/**
 * Retrieve CSRF token from cookie (server-side only)
 */
export async function getCSRFToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_TOKEN_NAME)?.value
}

/**
 * Validate CSRF token from request against stored token
 */
export async function validateCSRFToken(submittedToken: string | null | undefined): Promise<boolean> {
  if (!submittedToken) {
    return false
  }

  const storedToken = await getCSRFToken()
  if (!storedToken) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(submittedToken, storedToken)
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Generate CSRF token and set it in cookie (use in API routes)
 */
export async function generateAndStoreCSRFToken(): Promise<string> {
  const token = generateCSRFTokenServer()
  await setCSRFToken(token)
  return token
}
