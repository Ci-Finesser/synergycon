/**
 * User Sessions API Route
 * GET /api/user/sessions
 * List all active sessions for the current user
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

    // Get current session token
    const { data: { session } } = await supabase.auth.getSession()

    // Fetch all active sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('last_active', { ascending: false })

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      )
    }

    // Mark current session
    const sessionsWithCurrent = (sessions || []).map(s => ({
      ...s,
      is_current: s.session_token === session?.access_token,
    }))

    return NextResponse.json({
      sessions: sessionsWithCurrent,
    })
  } catch (error) {
    console.error('Error in sessions list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
