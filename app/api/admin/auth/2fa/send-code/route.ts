import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getResend } from "@/lib/resend"
import { logSecurityEvent } from "@/lib/security-logger"
import { verifyAdminSessionWithout2FA } from "@/lib/admin-auth"

export async function POST(request: Request) {
  try {
    const adminUser = await verifyAdminSessionWithout2FA()

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Generate 2FA code
    const { data: codeData, error: codeError } = await supabase.rpc("generate_2fa_code", {
      p_admin_id: adminUser.id,
    })

    if (codeError || !codeData) {
      console.error("Error generating 2FA code:", codeError)
      return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
    }
    const resend = getResend()

    // Send email with the code
    const { error: emailError } = await resend.emails.send({
      from: "SynergyCon Admin <noreply@synergycon.live>",
      to: adminUser.email,
      subject: "Your 2FA Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Two-Factor Authentication</h2>
          <p>Hello ${adminUser.full_name},</p>
          <p>Your verification code for SynergyCon Admin is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
            ${codeData}
          </div>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    })

    if (emailError) {
      logSecurityEvent({
        type: "2fa_email_failure",
        endpoint: "/api/admin/auth/2fa/send-code",
        clientId: adminUser.id,
        userAgent: request.headers.get("user-agent") || undefined,
        details: `2FA email send failed: ${emailError.message}`,
      })
      // console.error("Error sending 2FA email:", emailError)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    logSecurityEvent({
      type: "2fa_enabled",
      endpoint: "/api/admin/auth/2fa/send-code",
      clientId: adminUser.id,
      userAgent: request.headers.get("user-agent") || undefined,
      details: "2FA email sent successfully",
    })

    return NextResponse.json({ success: true, message: "Code sent to your email" })
  } catch (error) {
    logSecurityEvent({
      type: "2fa_email_failure",
      endpoint: "/api/admin/auth/2fa/send-code",
      // clientId: null
      userAgent: request.headers.get("user-agent") || undefined,
      details: `2FA email send exception: ${error instanceof Error ? error.message : String(error)}`,
    })
    // console.error("2FA send code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
