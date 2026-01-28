/**
 * Revoke All Sessions API Route
 * POST /api/user/sessions/revoke-all
 * Revoke all sessions except the current one
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

    // Get current session token
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 400 }
      )
    }

    // Delete all sessions except current
    const { error: deleteError } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', user.id)
      .neq('session_token', session.access_token)

    if (deleteError) {
      console.error('Error revoking sessions:', deleteError)
      return NextResponse.json(
        { error: 'Failed to revoke sessions' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'all_sessions_revoked',
      endpoint: req.url,
      details: `All other sessions revoked for user: ${user.email}`,
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error in revoke all sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
