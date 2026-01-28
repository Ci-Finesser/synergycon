/**
 * Verify OTP and Create Session
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-logger'
import { randomBytes } from 'crypto'

interface VerifyOtpPayload {
  email: string;
  code: string;
  purpose: string;
}

export async function POST(req: NextRequest) {
  try {
    // Validate security
    const body = await req.json()
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.STRICT,
    })
    if (securityError) return securityError

    const cleanData = cleanSecurityFields(body) as VerifyOtpPayload
    const { email, code, purpose } = cleanData

    if (!email || !code || !purpose) {
      return NextResponse.json(
        { error: 'Email, code, and purpose are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Get OTP
    const { data: otp, error: otpError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('purpose', purpose)
      .is('verified_at', null)
      .single()

    if (otpError || !otp) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Check if expired
    if (new Date(otp.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      )
    }

    // Check attempts
    if (otp.attempts >= 5) {
      // Log failed attempt
      logSecurityEvent({
        type: 'failed_login_attempt',
        endpoint: req.url,
        details: `Too many failed OTP attempts for email: ${email}`,
      })

      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new code.' },
        { status: 429 }
      )
    }

    // Mark OTP as verified
    await supabase
      .from('otp_verifications')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', otp.id)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Update login count and last login
    await supabase
      .from('user_profiles')
      .update({
        login_count: (profile.login_count || 0) + 1,
        last_login_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    // Create session token
    const sessionToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: profile.user_id,
        session_token: sessionToken,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
        expires_at: expiresAt.toISOString(),
      })

    if (sessionError) {
      console.error('[Verify OTP] Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Return session data in SessionDTO format
    const user = {
      id: profile.user_id,
      email: profile.email,
      user_type: profile.user_type,
      roles: profile.roles || { default: 'attendee' }, // Default to attendee if not set
      email_verified: true,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      last_login_at: new Date(),
    }

    const userProfile = {
      id: profile.id,
      user_id: profile.user_id,
      full_name: profile.full_name,
      phone: profile.phone,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      public_name: profile.public_name,
      public_title: profile.public_title,
      public_company: profile.public_company,
      public_bio: profile.public_bio,
      public_linkedin_url: profile.public_linkedin_url,
      public_twitter_url: profile.public_twitter_url,
      public_instagram_url: profile.public_instagram_url,
      public_website_url: profile.public_website_url,
      organization: profile.organization,
      roles: profile.roles,
      industry: profile.industry,
      dietary_requirements: profile.dietary_requirements,
      special_needs: profile.special_needs,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }

    const sessionDTO = {
      user,
      profile: userProfile,
      session_token: sessionToken,
      expires_at: expiresAt,
    }

    // Log successful login
    logSecurityEvent({
      type: 'successful_login',
      endpoint: req.url,
      details: `User logged in successfully: ${email}`,
    })

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      data: sessionDTO,
      message: 'Login successful',
    })

    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Verify OTP] Error:', error)
    logSecurityEvent({
      type: 'api_handler_exception',
      endpoint: req.url,
      details: `OTP verification error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
