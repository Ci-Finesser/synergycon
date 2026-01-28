import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    // Apply standard rate limiting
    const rateLimitResult = checkRateLimit(request, RATE_LIMITS.STANDARD)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message, retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) },
        { status: 429 }
      )
    }

    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminUser = JSON.parse(adminSessionCookie.value)
    const supabase = await createClient()

    // Enable 2FA for the admin
    const { data, error } = await supabase.rpc("enable_admin_2fa", {
      p_admin_id: adminUser.id,
    })

    if (error) {
      console.error("Error enabling 2FA:", error)
      return NextResponse.json({ error: "Failed to enable 2FA" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "2FA enabled successfully" })
  } catch (error) {
    console.error("2FA enable error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
