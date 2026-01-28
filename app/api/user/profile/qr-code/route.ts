/**
 * Generate QR Code for User Profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateProfileQRCode } from '@/lib/qrcode'

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerClient()

    // Get session and user
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('profile_url, profile_slug')
      .eq('user_id', session.user_id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Generate QR code as base64
    const qrCodeData = await generateProfileQRCode(profile.profile_url)

    // Update profile with QR code data
    await supabase
      .from('user_profiles')
      .update({ qr_code_data: qrCodeData })
      .eq('user_id', session.user_id)

    return NextResponse.json({
      success: true,
      qr_code: qrCodeData,
      profile_url: profile.profile_url,
    })
  } catch (error) {
    console.error('[QR Code] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}
