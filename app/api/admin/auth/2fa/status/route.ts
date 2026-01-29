import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSessionWithout2FA } from "@/lib/admin-auth"

export async function GET(request: Request) {
  try {
    const adminUser = await verifyAdminSessionWithout2FA()

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
