import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { validateRequestSecurity, cleanSecurityFields } from "@/lib/api-security"
import { RATE_LIMITS } from "@/lib/rate-limit"
import { verifyAdminSession, createUnauthorizedResponse } from "@/lib/admin-auth"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession();
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session');
    }

    // Parse query parameters for pagination and filtering
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200)
    const offset = Math.max(parseInt(url.searchParams.get("offset") || "0"), 0)
    const status = url.searchParams.get("status")
    const search = url.searchParams.get("search")

    const supabase = await createClient()
    
    let query = supabase
      .from("email_campaigns")
      .select(`
        *,
        mailing_lists (
          id,
          name,
          total_subscribers
        ),
        campaign_analytics (
          total_sent,
          total_opened,
          total_clicked,
          total_bounced,
          open_rate,
          click_rate
        )
      `)

    // Apply filters
    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,subject.ilike.%${search}%`)
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching campaigns:", error)
      return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
    }

    return NextResponse.json({ 
      campaigns: data,
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()

    // Validate security
    const securityError = await validateRequestSecurity(request, body, {
      rateLimit: RATE_LIMITS.FORM,
    })
    if (securityError) return securityError

    const cleanData = cleanSecurityFields(body)
    const { name, subject, body: emailBody, mailing_list_id, template_id, tags, status, scheduled_at } = cleanData

    // Validate required fields
    if (!name || !subject || (!emailBody && !template_id)) {
      return NextResponse.json({ error: "Name, subject, and body/template are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get total recipients from mailing list if provided
    let totalRecipients = 0
    if (mailing_list_id) {
      const { data: mailingList } = await supabase
        .from("mailing_lists")
        .select("total_subscribers")
        .eq("id", mailing_list_id)
        .single()

      if (mailingList) {
        totalRecipients = mailingList.total_subscribers || 0
      }
    }

    const { data, error } = await supabase
      .from("email_campaigns")
      .insert([
        {
          name,
          subject,
          body: emailBody || null,
          template_id: template_id || null,
          mailing_list_id: mailing_list_id || null,
          tags: tags || [],
          status: status || "draft",
          scheduled_at: scheduled_at || null,
          created_by: adminUser.id,
          total_recipients: totalRecipients,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating campaign:", error)
      return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
    }

    return NextResponse.json({ campaign: data }, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate security
    const securityError = await validateRequestSecurity(request, body, {
      rateLimit: RATE_LIMITS.FORM,
    })
    if (securityError) return securityError

    const cleanData = cleanSecurityFields(body)
    const { id, name, subject, body: emailBody, status, tags } = cleanData

    if (!id) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check campaign exists and get current status
    const { data: existingCampaign } = await supabase
      .from("email_campaigns")
      .select("status")
      .eq("id", id)
      .single()

    if (!existingCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Prevent updating sent campaigns
    if (existingCampaign.status === "sent") {
      return NextResponse.json({ error: "Cannot update sent campaigns" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("email_campaigns")
      .update({
        name,
        subject,
        body: emailBody,
        status,
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating campaign:", error)
      return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 })
    }

    return NextResponse.json({ campaign: data })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check campaign status
    const { data: campaign } = await supabase
      .from("email_campaigns")
      .select("status")
      .eq("id", id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Only allow deletion of draft campaigns
    if (campaign.status !== "draft") {
      return NextResponse.json({ error: "Only draft campaigns can be deleted" }, { status: 400 })
    }

    const { error } = await supabase
      .from("email_campaigns")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting campaign:", error)
      return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Campaign deleted successfully" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
