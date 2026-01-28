/**
 * Session Revoke API Route
 * DELETE /api/user/sessions/[id]
 * Revoke a specific session
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logSecurityEvent } from '@/lib/security-logger'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sessionId = id

    // Check session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Don't allow revoking current session
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    if (session.session_token === currentSession?.access_token) {
      return NextResponse.json(
        { error: 'Cannot revoke current session' },
        { status: 400 }
      )
    }

    // Delete the session
    const { error: deleteError } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', sessionId)

    if (deleteError) {
      console.error('Error revoking session:', deleteError)
      return NextResponse.json(
        { error: 'Failed to revoke session' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'user_session_revoked',
      endpoint: req.url,
      details: `Session ${sessionId} revoked for user: ${user.email}`,
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error in session revoke:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
