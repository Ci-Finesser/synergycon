import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminUser = JSON.parse(adminSessionCookie.value)
    const supabase = await createClient()

    // Check if 2FA is enabled for the admin
    const { data: isEnabled, error } = await supabase.rpc("check_admin_2fa_status", {
      p_admin_id: adminUser.id,
    })

    if (error) {
      console.error("Error checking 2FA status:", error)
      return NextResponse.json({ error: "Failed to check 2FA status" }, { status: 500 })
    }

    return NextResponse.json({ 
      enabled: isEnabled || false,
      verified: adminUser.twoFactorVerified || false 
    })
  } catch (error) {
    console.error("2FA status check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
