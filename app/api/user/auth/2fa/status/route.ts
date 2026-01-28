/**
 * 2FA Status API Route
 * GET /api/user/auth/2fa/status
 * Check if user has 2FA enabled
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
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

    // Check if 2FA is enabled
    const { data: twoFactorData, error: twoFactorError } = await supabase
      .from('user_2fa_secrets')
      .select('enabled')
      .eq('user_id', user.id)
      .single()

    if (twoFactorError && twoFactorError.code !== 'PGRST116') {
      console.error('Error checking 2FA status:', twoFactorError)
      return NextResponse.json(
        { error: 'Failed to check 2FA status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      enabled: twoFactorData?.enabled || false,
    })
  } catch (error) {
    console.error('Error in 2FA status check:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
