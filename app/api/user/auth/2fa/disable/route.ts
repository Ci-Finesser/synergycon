/**
 * 2FA Disable API Route
 * POST /api/user/auth/2fa/disable
 * Disable two-factor authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
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

    // Delete 2FA record
    const { error: deleteError } = await supabase
      .from('user_2fa_secrets')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error disabling 2FA:', deleteError)
      return NextResponse.json(
        { error: 'Failed to disable 2FA' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: '2fa_disabled',
      endpoint: req.url,
      details: `2FA disabled for user: ${user.email}`,
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error in 2FA disable:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
