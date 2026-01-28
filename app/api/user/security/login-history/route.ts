/**
 * Login History API Route
 * GET /api/user/security/login-history
 * Fetch login history for the current user
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

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // Fetch login history
    const { data: history, error: historyError } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (historyError) {
      console.error('Error fetching login history:', historyError)
      return NextResponse.json(
        { error: 'Failed to fetch login history' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      history: history || [],
    })
  } catch (error) {
    console.error('Error in login history fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
