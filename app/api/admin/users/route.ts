import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateRequestSecurity, cleanSecurityFields } from "@/lib/api-security"
import { RATE_LIMITS } from "@/lib/rate-limit"
import { logSecurityEvent } from "@/lib/security-logger"
import { verifyAdminSession, createUnauthorizedResponse } from "@/lib/admin-auth"

// GET - List all admins
export async function GET(request: Request) {
  try {
    // Verify admin session
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session')
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
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session')
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
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session')
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

// PATCH - Update admin user
export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    // Validate security with strict rate limiting
    const securityError = await validateRequestSecurity(request, body, {
      skipTiming: false,
      rateLimit: RATE_LIMITS.FORM,
    })
    if (securityError) return securityError

    const { admin_id, full_name, role, is_active } = cleanSecurityFields(body)

    // Verify admin session
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session')
    }

    if (!admin_id) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 })
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {}
    if (full_name !== undefined) updates.full_name = full_name
    if (role !== undefined) {
      const validRoles = ["admin", "super_admin"]
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }
      updates.role = role
    }
    if (is_active !== undefined) {
      // Prevent self-deactivation
      if (admin_id === adminUser.id && is_active === false) {
        return NextResponse.json(
          { error: "You cannot deactivate your own account" },
          { status: 400 }
        )
      }
      updates.is_active = is_active
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", admin_id)
      .select()
      .single()

    if (error) {
      console.error("[Admin Users API] Error updating admin:", error)
      return NextResponse.json({ error: "Failed to update admin user" }, { status: 500 })
    }

    logSecurityEvent({
      type: 'admin_user_updated',
      endpoint: request.url,
      details: `Admin user updated: ${admin_id} by ${adminUser.email}`,
    })

    return NextResponse.json({
      success: true,
      message: "Admin user updated successfully",
      admin: data,
    })
  } catch (error) {
    console.error("[Admin Users API] PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
