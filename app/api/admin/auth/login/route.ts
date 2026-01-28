import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateRequestSecurity, cleanSecurityFields } from "@/lib/api-security"
import { RATE_LIMITS } from "@/lib/rate-limit"
import { createSession } from "@/lib/session-tracker"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate security with strict auth rate limiting
    const securityError = await validateRequestSecurity(request, body, {
      skipTiming: true, // Allow users to take their time on login
      rateLimit: RATE_LIMITS.AUTH,
    })
    if (securityError) return securityError

    const { email, password } = cleanSecurityFields(body)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Call the verify_admin_login function
    const { data, error } = await supabase.rpc("verify_admin_login", {
      p_email: email,
      p_password: password,
    })

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const admin = data[0]

    // Create session record with device tracking
    const sessionResult = await createSession(admin.id, request)
    
    if (!sessionResult) {
      console.error("[v0] Failed to create session")
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    // Create a session cookie (legacy - kept for backward compatibility)
    const cookieStore = await cookies()
    cookieStore.set(
      "admin_session",
      JSON.stringify({
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      },
    )

    return NextResponse.json({
      success: true,
      admin: {
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      },
      session_id: sessionResult.session_id,
    })
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
