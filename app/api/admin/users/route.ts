import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { validateRequestSecurity, cleanSecurityFields } from "@/lib/api-security"
import { RATE_LIMITS } from "@/lib/rate-limit"
import { logSecurityEvent } from "@/lib/security-logger"

// GET - List all admins
export async function GET(request: Request) {
  try {
    // Verify admin session
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let adminUser
    try {
      adminUser = JSON.parse(adminSessionCookie.value)
    } catch (error) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all admins from the database
    const { data, error } = await supabase
      .rpc("get_all_admins")

    if (error) {
      console.error("[Admin Users API] Error fetching admins:", error)
      return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 })
    }

    return NextResponse.json({ admins: data || [] })
  } catch (error) {
    console.error("[Admin Users API] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new admin
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate security with strict rate limiting
    const securityError = await validateRequestSecurity(request, body, {
      skipTiming: false,
      rateLimit: RATE_LIMITS.FORM,
    })
    if (securityError) return securityError

    const { email, password, full_name, role } = cleanSecurityFields(body)

    // Verify admin session
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let adminUser
    try {
      adminUser = JSON.parse(adminSessionCookie.value)
    } catch (error) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Validate required fields
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      )
    }

    // Validate email format (after the @ most contain finesser keyword, default is @finesser.co)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Validate role (default to 'admin' if not provided)
    const validRoles = ["admin", "super_admin"]
    const adminRole = role && validRoles.includes(role) ? role : "admin"

    const supabase = await createClient()

    // Call database function to create admin
    const { data, error } = await supabase.rpc("create_admin_user", {
      p_email: email,
      p_password: password,
      p_full_name: full_name,
      p_role: adminRole,
    })

    if (error) {
      console.error("[Admin Users API] Error creating admin:", error)
      
      // Check for duplicate email
      if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
        return NextResponse.json(
          { error: "An admin with this email already exists" },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: "Failed to create admin user" },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'admin_user_created',
      endpoint: request.url,
      details: `Admin user created: ${email} (role: ${adminRole}) by ${adminUser.email}`,
    })

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      admin: {
        id: data?.id,
        email: data?.email,
        full_name: data?.full_name,
        role: data?.role,
      },
    })
  } catch (error) {
    console.error("[Admin Users API] POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Remove admin (optional, be careful with this)
export async function DELETE(request: Request) {
  try {
    const body = await request.json()

    // Verify admin session
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let adminUser
    try {
      adminUser = JSON.parse(adminSessionCookie.value)
    } catch (error) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { admin_id } = body

    if (!admin_id) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 })
    }

    // Prevent self-deletion
    if (admin_id === adminUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Call database function to delete admin
    const { error } = await supabase.rpc("delete_admin_user", {
      p_admin_id: admin_id,
    })

    if (error) {
      console.error("[Admin Users API] Error deleting admin:", error)
      return NextResponse.json({ error: "Failed to delete admin user" }, { status: 500 })
    }

    logSecurityEvent({
      type: 'admin_user_deleted',
      endpoint: request.url,
      details: `Admin user deleted: ${admin_id} by ${adminUser.email}`,
    })

    return NextResponse.json({
      success: true,
      message: "Admin user deleted successfully",
    })
  } catch (error) {
    console.error("[Admin Users API] DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
