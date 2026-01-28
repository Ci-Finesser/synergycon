/**
 * User Logout API - Clear session
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logSecurityEvent } from '@/lib/security-logger'

interface SessionWithUserEmail {
  user_id: string;
  users: {
    email: string;
  } | null;
}

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value
    let userEmail = 'unknown'

    if (sessionToken) {
      const supabase = await createServerClient()
      
      // Get session info before deleting
      const { data: session } = await supabase
        .from('user_sessions')
        .select('user_id, users:user_id(email)')
        .eq('session_token', sessionToken)
        .single<SessionWithUserEmail>()

      if (session && session.users) {
        userEmail = session.users.email
      }
      
      // Delete session from database
      await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken)
    }

    // Log successful logout
    logSecurityEvent({
      type: 'successful_logout',
      endpoint: req.url,
      details: `User logged out successfully: ${userEmail}`,
    })

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    response.cookies.delete('session_token')

    return response
  } catch (error) {
    console.error('[Logout] Error:', error)
    
    logSecurityEvent({
      type: 'api_handler_exception',
      endpoint: req.url,
      details: `Logout error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
