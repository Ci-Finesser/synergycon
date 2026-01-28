/**
 * 2FA Verify API Route
 * POST /api/user/auth/2fa/verify
 * Verify TOTP token and enable 2FA
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import * as speakeasy from 'speakeasy'
import { randomBytes } from 'crypto'
import { logSecurityEvent } from '@/lib/security-logger'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { token, secret } = body

    if (!token || !secret) {
      return NextResponse.json(
        { error: 'Missing token or secret' },
        { status: 400 }
      )
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time steps for clock skew
    })

    if (!verified) {
      logSecurityEvent({
        type: '2fa_verification_failed',
        endpoint: req.url,
        details: `2FA verification failed for user: ${user.email}`,
      })

      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      randomBytes(4).toString('hex').toUpperCase()
    )

    // Enable 2FA and store backup codes
    const { error: updateError } = await supabase
      .from('user_2fa_secrets')
      .update({
        enabled: true,
        backup_codes: backupCodes,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error enabling 2FA:', updateError)
      return NextResponse.json(
        { error: 'Failed to enable 2FA' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: '2fa_enabled',
      endpoint: req.url,
      details: `2FA enabled for user: ${user.email}`,
    })

    return NextResponse.json({
      success: true,
      backupCodes,
    })
  } catch (error) {
    console.error('Error in 2FA verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
