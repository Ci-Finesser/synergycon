import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { validateRequestSecurity, cleanSecurityFields } from "@/lib/api-security"
import { RATE_LIMITS } from "@/lib/rate-limit"
import { getResend, isResendConfigured } from "@/lib/resend"
import { logSecurityEvent } from "@/lib/security-logger"
import { EVENT_NAME, EVENT_TAGLINE, EVENT_DATES, VENUE_SHORT_NAMES } from "@/lib/constants"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate CSRF token, honeypot fields, and rate limiting
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.NEWSLETTER,
    })
    if (securityError) return securityError

    // Clean security fields from body
    const { email } = cleanSecurityFields(body)

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Check if email already exists
    const { data: existing, error: selectError } = await supabase
      .from("newsletter_subscriptions")
      .select("email, status")
      .eq("email", email)
      .maybeSingle()

    if (selectError) {
      console.error("[v0] Database select error:", selectError)
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 })
    }

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          { error: "This email is already subscribed to our newsletter" },
          { status: 409 },
        )
      }
      // Reactivate if previously unsubscribed
      const { error: updateError } = await supabase
        .from("newsletter_subscriptions")
        .update({ status: "active", subscribed_at: new Date().toISOString() })
        .eq("email", email)

      if (updateError) {
        console.error("[v0] Database update error:", updateError)
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
      }
    } else {
      // Insert new subscription
      const { error: insertError } = await supabase.from("newsletter_subscriptions").insert({ email, status: "active" })

      if (insertError) {
        console.error("[v0] Database insert error:", insertError)
        return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
      }
    }

    logSecurityEvent({
      type: 'newsletter_subscribed',
      endpoint: req.url,
      details: `Newsletter subscription: ${email}`,
    })

    try {
      if (isResendConfigured()) {
        const resend = getResend()
        const { data: template } = await supabase
          .from("email_templates")
          .select("*")
          .eq("name", "newsletter_welcome")
          .maybeSingle()

        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff;">
                <tr>
                  <td style="padding: 40px 30px; text-align: center; background-color: #0A0A0A;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${EVENT_NAME}</h1>
                    <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 14px;">${EVENT_TAGLINE}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #0A0A0A; font-size: 24px; font-weight: 600;">${template?.header_text || "Welcome to the Future of Nigeria's Creative Economy!"}</h2>
                    <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Thank you for subscribing to ${EVENT_NAME} updates. You're now part of an exclusive community shaping the future of Nigeria's creative, digital, and tech sectors.</p>
                    <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Mark your calendar for <strong>${EVENT_DATES.displayRange}</strong> across ${VENUE_SHORT_NAMES.join(", ")} in Lagos. This flagship conference brings together industry leaders, policymakers, and innovators.</p>
                    <div style="margin: 30px 0; text-align: center;">
                      <a href="https://synergycon.live" style="display: inline-block; padding: 14px 32px; background-color: #0A0A0A; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Secure Your Spot</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">${template?.footer_text || "Powered by Finesser - Building Africa's Creative Economy"}</p>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `;
        await resend.emails.send({
          from: "SynergyCon <news@synergycon.live>",
          to: email,
          subject: template?.subject || "Welcome to SynergyCon 2.0!",
          html: emailHtml,
        })
      }
    } catch (emailError: any) {
      // Email sending failed but subscription was saved
      // Log error for debugging in production monitoring
      if (emailError?.message?.includes("verify a domain")) {
        console.error(
          "Email domain verification required: synergycon.live at https://resend.com/domains",
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed! You'll receive updates about SynergyCon 2.0.",
    })
  } catch (error) {
    console.error("[v0] Newsletter subscription error:", error)

    logSecurityEvent({
      type: 'api_handler_exception',
      endpoint: req.url,
      details: `Newsletter subscription error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })

    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
