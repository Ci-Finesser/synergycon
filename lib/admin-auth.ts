import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { AdminUser } from '@/types/admin'

// Re-export for backward compatibility
export type { AdminUser }

/**
 * Verify admin session exists and is valid
 * Returns the admin user if valid, null otherwise
 */
export async function verifyAdminSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie?.value) {
      return null
    }

    const adminUser = JSON.parse(adminSessionCookie.value) as AdminUser

    // Validate required fields
    if (!adminUser.id || !adminUser.email) {
      return null
    }

    // Check 2FA verification
    if (!adminUser.twoFactorVerified) {
      return null
    }

    return adminUser
  } catch (error) {
    console.error("Error verifying admin session:", error)
    return null
  }
}

/**
 * Get admin user from session - throws if not authenticated
 * For use in server components that require authentication
 */
export async function getAdminUser(): Promise<AdminUser> {
  const user = await verifyAdminSession()
  if (!user) {
    throw new Error("Unauthorized: Invalid admin session")
  }
  return user
}

/**
 * Create an unauthorized response
 */
export function createUnauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 })
}

/**
 * Create a forbidden response
 */
export function createForbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 })
}
