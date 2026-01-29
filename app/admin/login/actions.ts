"use server"

import { cookies, headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { logSecurityEvent } from "@/lib/security-logger"

// Simple in-memory rate limiter for server actions
const loginAttempts = new Map<string, { count: number; resetTime: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function getClientIP(): string {
  try {
    // Note: headers() is async in newer Next.js but we call it synchronously in server action context
    const headersList = headers() as unknown as { get: (key: string) => string | null }
    const forwardedFor = headersList.get('x-forwarded-for')
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim()
    }
    const realIp = headersList.get('x-real-ip')
    if (realIp) {
      return realIp
    }
  } catch {
    // Ignore errors in getting headers
  }
  return 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; message?: string } {
  const now = Date.now()
  const entry = loginAttempts.get(ip)

  // Clean up expired entry
  if (entry && entry.resetTime < now) {
    loginAttempts.delete(ip)
  }

  const currentEntry = loginAttempts.get(ip)

  if (!currentEntry) {
    loginAttempts.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }

  if (currentEntry.count >= MAX_ATTEMPTS) {
    const minutesRemaining = Math.ceil((currentEntry.resetTime - now) / 60000)
    return {
      allowed: false,
      remaining: 0,
      message: `Too many login attempts. Please try again in ${minutesRemaining} minute(s).`,
    }
  }

  currentEntry.count++
  return { allowed: true, remaining: MAX_ATTEMPTS - currentEntry.count }
}

export async function loginAdmin(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Rate limiting check
  const clientIP = getClientIP()
  const rateLimitResult = checkRateLimit(clientIP)

  if (!rateLimitResult.allowed) {
    logSecurityEvent({
      type: 'rate_limit_exceeded',
      endpoint: '/admin/login',
      details: `Rate limit exceeded for IP ${clientIP}: ${email || 'unknown email'}`,
    })
    return { 
      error: rateLimitResult.message, 
      success: false, 
      requires2FA: false, 
      needsSetup: false, 
      email: null 
    }
  }

  if (!email || !password) {
    return { error: "Email and password are required", success: false, requires2FA: false, needsSetup: false, email: null }
  }

  try {
    const supabase = await createClient()

    // Call the database function to verify credentials
    const { data, error } = await supabase.rpc("verify_admin_login", {
      p_email: email,
      p_password: password,
    })

    if (error || !data || data.length === 0) {
      return { error: "Invalid credentials", success: false, requires2FA: false, needsSetup: false, email: null }
    }

    const admin = data[0]

    // Check if 2FA is enabled for this admin
    const { data: is2FAEnabled, error: statusError } = await supabase.rpc("check_admin_2fa_status", {
      p_admin_id: admin.id,
    })

    if (statusError) {
      console.error("[v0] 2FA status check error:", statusError)
    }

    // Set initial session cookie (without 2FA verification)
    const cookieStore = await cookies()
    cookieStore.set(
      "admin_session",
      JSON.stringify({
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        twoFactorVerified: false,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      },
    )

    // If 2FA is not enabled, require setup
    if (!is2FAEnabled) {
      return { 
        success: true, 
        error: null, 
        requires2FA: false, 
        needsSetup: true,
        email: admin.email 
      }
    }

    // If 2FA is enabled, send verification code
    const { data: codeData, error: codeError } = await supabase.rpc("generate_2fa_code", {
      p_admin_id: admin.id,
    })

    if (codeError || !codeData) {
      console.error("[v0] 2FA code generation error:", codeError)
      return { error: "Failed to send verification code", success: false, requires2FA: false, needsSetup: false, email: null }
    }

    // Send email with the code (using Resend)
    try {
      const resendResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/auth/2fa/send-code`, {
        method: "POST",
        headers: {
          Cookie: `admin_session=${cookieStore.get("admin_session")?.value}`,
        },
      })

      if (!resendResponse.ok) {
        throw new Error("Failed to send verification email")
      }
    } catch (emailError) {
      console.error("[v0] Email sending error:", emailError)
      return { error: "Failed to send verification code via email", success: false, requires2FA: false, needsSetup: false, email: null }
    }

    return { 
      success: true, 
      error: null, 
      requires2FA: true, 
      needsSetup: false,
      email: admin.email 
    }
  } catch (error) {
    console.error("[v0] Login error:", error)
    return { error: "An error occurred during login", success: false, requires2FA: false, needsSetup: false, email: null }
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
}
