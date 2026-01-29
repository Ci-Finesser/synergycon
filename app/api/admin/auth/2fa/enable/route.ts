import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { verifyAdminSessionWithout2FA } from "@/lib/admin-auth"

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

    const adminUser = await verifyAdminSessionWithout2FA()

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
