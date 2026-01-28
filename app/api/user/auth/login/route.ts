/**
 * User Login API - Send OTP to email
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { sendOTPEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    // Validate security
    const body = await req.json()
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.STRICT,
    })
    if (securityError) return securityError

    const cleanData = cleanSecurityFields(body)
    const { email } = cleanData

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Check if user exists
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, email, user_type')
      .eq('email', email)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'No account found with this email. Please register first.' },
        { status: 404 }
      )
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete existing OTPs for this email
    await supabase
      .from('otp_verifications')
      .delete()
      .eq('email', email)
      .eq('purpose', 'login')

    // Store OTP
    const { error: otpError } = await supabase
      .from('otp_verifications')
      .insert({
        email,
        code,
        purpose: 'login',
        expires_at: expiresAt.toISOString(),
      })

    if (otpError) {
      console.error('[Login] OTP creation error:', otpError)
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      )
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(email, code, 10)

    // Log for development purposes
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Login] OTP for ${email}: ${code}`)
    }

    if (!emailResult.success) {
      console.warn(`[Login] Failed to send OTP email: ${emailResult.error}`)
      // Continue anyway - OTP is stored in DB
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      // For development only - REMOVE IN PRODUCTION
      ...(process.env.NODE_ENV === 'development' && { code }),
    })
  } catch (error) {
    console.error('[Login] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
