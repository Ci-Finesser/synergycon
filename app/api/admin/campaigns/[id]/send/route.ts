import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Function to personalize email content
function personalizeContent(template: string, data: Record<string, any>): string {
  let personalized = template

  // Replace merge fields like {{first_name}}, {{email}}, etc.
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi")
    personalized = personalized.replace(regex, data[key] || "")
  })

  // Also support {first_name} format
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{\\s*${key}\\s*}`, "gi")
    personalized = personalized.replace(regex, data[key] || "")
  })

  return personalized
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get("admin_session")

    if (!adminSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.status === "sent") {
      return NextResponse.json({ error: "Campaign has already been sent" }, { status: 400 })
    }

    // Get subscribers from mailing list
    if (!campaign.mailing_list_id) {
      return NextResponse.json({ error: "Campaign has no associated mailing list" }, { status: 400 })
    }

    const { data: subscribers, error: subscribersError } = await supabase
      .from("mailing_list_subscribers")
      .select("*")
      .eq("mailing_list_id", campaign.mailing_list_id)
      .eq("status", "active")

    if (subscribersError || !subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers found in mailing list" }, { status: 400 })
    }

    // Create campaign recipients with personalized content
    const recipients = subscribers.map((subscriber) => {
      const personalizationData = {
        email: subscriber.email,
        first_name: subscriber.first_name || "",
        last_name: subscriber.last_name || "",
        full_name: subscriber.full_name || subscriber.email,
        ...subscriber.custom_fields,
      }

      return {
        campaign_id: id,
        email: subscriber.email,
        personalized_subject: personalizeContent(campaign.subject, personalizationData),
        personalized_body: personalizeContent(campaign.body, personalizationData),
        status: "pending",
      }
    })

    // Insert campaign recipients
    const { error: recipientsError } = await supabase.from("campaign_recipients").insert(recipients)

    if (recipientsError) {
      console.error("Error creating campaign recipients:", recipientsError)
      return NextResponse.json({ error: "Failed to prepare campaign for sending" }, { status: 500 })
    }

    // Update campaign status to 'sending'
    const { error: updateError } = await supabase
      .from("email_campaigns")
      .update({
        status: "sending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error updating campaign status:", updateError)
      return NextResponse.json({ error: "Failed to update campaign status" }, { status: 500 })
    }

    // PRODUCTION NOTE: In a production environment, you should use a proper background job queue
    // (e.g., Bull, BullMQ, or Vercel's queue system) instead of setTimeout to ensure reliable
    // email sending. This setTimeout approach is used here for demonstration purposes only.
    // For production:
    // 1. Integrate with an email service provider (e.g., Resend, SendGrid, AWS SES)
    // 2. Use a message queue or background job system
    // 3. Implement retry logic for failed sends
    // 4. Add webhook handlers to track delivery status

    // Simulate sending (REPLACE THIS WITH PROPER BACKGROUND JOB IN PRODUCTION)
    setTimeout(async () => {
      try {
        const supabaseAsync = await createClient()

        // Mark all recipients as sent
        await supabaseAsync
          .from("campaign_recipients")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("campaign_id", id)
          .eq("status", "pending")

        // Update campaign status to 'sent'
        await supabaseAsync
          .from("email_campaigns")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
      } catch (error) {
        console.error("Error in background send:", error)
      }
    }, 2000)

    return NextResponse.json({
      success: true,
      message: `Campaign is being sent to ${subscribers.length} recipient(s)`,
      recipientCount: subscribers.length,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
