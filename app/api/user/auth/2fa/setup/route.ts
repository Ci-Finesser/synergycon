/**
 * 2FA Setup API Route
 * POST /api/user/auth/2fa/setup
 * Generate QR code and secret for 2FA setup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import * as speakeasy from 'speakeasy'
import { generate2FAQRCode } from '@/lib/qrcode'
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

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `SynergyCon (${user.email})`,
      issuer: 'SynergyCon',
      length: 32,
    })

    // Store temporary secret (not enabled yet)
    const { error: upsertError } = await supabase
      .from('user_2fa_secrets')
      .upsert({
        user_id: user.id,
        secret: secret.base32,
        enabled: false,
        backup_codes: [],
        updated_at: new Date().toISOString(),
      })

    if (upsertError) {
      console.error('Error storing 2FA secret:', upsertError)
      return NextResponse.json(
        { error: 'Failed to setup 2FA' },
        { status: 500 }
      )
    }

    // Generate QR code
    const qrCodeDataUrl = await generate2FAQRCode(secret.otpauth_url!)

    logSecurityEvent({
      type: '2fa_setup_initiated',
      endpoint: req.url,
      details: `2FA setup initiated for user: ${user.email}`,
    })

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
    })
  } catch (error) {
    console.error('Error in 2FA setup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
