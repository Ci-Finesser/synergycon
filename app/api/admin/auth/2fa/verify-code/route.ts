import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { verifyAdminSessionWithout2FA } from "@/lib/admin-auth"

export async function POST(request: Request) {
  try {
    // Apply strict rate limiting for 2FA verification
    const rateLimitResult = checkRateLimit(request, RATE_LIMITS.AUTH)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message, retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) },
        { status: 429 }
      )
    }

    const adminUser = await verifyAdminSessionWithout2FA()

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = await createClient()

    // Verify the code
    const { data: isValid, error: verifyError } = await supabase.rpc("verify_2fa_code", {
      p_admin_id: adminUser.id,
      p_code: code,
    })

    if (verifyError) {
      console.error("Error verifying 2FA code:", verifyError)
      return NextResponse.json({ error: "Verification failed" }, { status: 500 })
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    // Update session to mark 2FA as verified
    const updatedSession = {
      ...adminUser,
      twoFactorVerified: true,
    }

    cookieStore.set("admin_session", JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return NextResponse.json({ success: true, message: "Code verified successfully" })
  } catch (error) {
    console.error("2FA verify code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
