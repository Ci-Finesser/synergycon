import { createAdminClient } from '@/lib/supabase/server'
import { getResend } from '@/lib/resend'
import crypto from 'crypto'

const OTP_EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 3

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

export async function createAndSendOTP(
  email: string,
  purpose: 'login' | 'registration' | 'verification' = 'login'
): Promise<boolean> {
  const supabase = createAdminClient()
  const code = generateOTP()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  // Invalidate any existing OTPs for this email
  await supabase
    .from('otp_codes')
    .update({ used: true })
    .eq('email', email.toLowerCase())
    .eq('purpose', purpose)
    .eq('used', false)

  // Create new OTP
  const { error: insertError } = await supabase.from('otp_codes').insert({
    email: email.toLowerCase(),
    code,
    purpose,
    expires_at: expiresAt.toISOString(),
  })

  if (insertError) {
    console.error('Failed to create OTP:', insertError)
    return false
  }

  // Send email
  try {
    const resend = getResend()
    const { error: emailError } = await resend.emails.send({
      from: `SynergyCon <${process.env.EMAIL_FROM || 'noreply@synergycon.live'}>`,
      to: email,
      subject: `${code} is your SynergyCon verification code`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px;">
          <h1 style="color: #111827; margin-bottom: 24px;">SynergyCon 2026</h1>
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px;">Your verification code is:</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes. If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    })

    if (emailError) {
      console.error('Failed to send OTP email:', emailError)
      return false
    }
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

export async function verifyOTP(
  email: string,
  code: string,
  purpose: 'login' | 'registration' | 'verification' = 'login'
): Promise<{ valid: boolean; error?: string }> {
  const supabase = createAdminClient()

  // Find the OTP
  const { data: otp, error: fetchError } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('purpose', purpose)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (fetchError || !otp) {
    return { valid: false, error: 'No valid code found. Please request a new one.' }
  }

  // Check attempts
  if (otp.attempts >= MAX_ATTEMPTS) {
    await supabase.from('otp_codes').update({ used: true }).eq('id', otp.id)
    return { valid: false, error: 'Too many attempts. Please request a new code.' }
  }

  // Verify code
  if (otp.code !== code) {
    await supabase
      .from('otp_codes')
      .update({ attempts: otp.attempts + 1 })
      .eq('id', otp.id)
    return { valid: false, error: 'Invalid code. Please try again.' }
  }

  // Mark as used
  await supabase
    .from('otp_codes')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', otp.id)

  return { valid: true }
}
