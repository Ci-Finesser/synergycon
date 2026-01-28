import { createAdminClient, createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { logSecurityEvent } from '@/lib/security-logger'

const USER_SESSION_COOKIE = 'synergycon_user_session'
const SESSION_EXPIRY_DAYS = 30

export interface UserSessionData {
  id: string
  userId: string
  email: string
  fullName: string | null
  userType: 'individual' | 'enterprise'
  isEnterprise: boolean
  enterpriseId?: string | null
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createUserSession(
  userId: string,
  deviceInfo?: Record<string, unknown>
): Promise<string | null> {
  const supabase = createAdminClient()
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  // Get user data for session
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (!user) {
    logSecurityEvent({
      type: 'session_creation_failed',
      endpoint: '/api/auth/session',
      details: `Failed to create session: User not found (${userId})`,
    })
    return null
  }

  const { error } = await supabase.from('user_sessions').insert({
    user_id: userId,
    session_token: token,
    device_info: deviceInfo || {},
    expires_at: expiresAt.toISOString(),
    ip_address: deviceInfo?.ip as string,
    user_agent: deviceInfo?.userAgent as string,
  })

  if (error) {
    console.error('Failed to create user session:', error)
    logSecurityEvent({
      type: 'session_creation_failed',
      endpoint: '/api/auth/session',
      details: `Database error creating session for user ${userId}: ${error.message}`,
    })
    return null
  }

  // Log successful session creation
  logSecurityEvent({
    type: 'session_created',
    endpoint: '/api/auth/session',
    details: `Session created for user: ${user.email || userId}`,
  })

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return token
}

export async function getCurrentUser(): Promise<UserSessionData | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(USER_SESSION_COOKIE)?.value

  // First try custom session
  if (sessionToken) {
    const supabase = createAdminClient()

    const { data: session, error } = await supabase
      .from('user_sessions')
      .select(`
        *,
        users: user_id (
          id,
          email,
          full_name,
          user_type,
          enterprise_id
        )
      `)
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!error && session?.users) {
      // Update last activity
      await supabase
        .from('user_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', session.id)

      const user = session.users as any
      return {
        id: session.id,
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        userType: user.user_type || 'individual',
        isEnterprise: user.user_type === 'enterprise',
        enterpriseId: user.enterprise_id,
      }
    }
  }

  // Fall back to Supabase auth
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (authUser) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        return {
          id: authUser.id,
          userId: authUser.id,
          email: userData.email,
          fullName: userData.full_name,
          userType: userData.user_type || 'individual',
          isEnterprise: userData.user_type === 'enterprise',
          enterpriseId: userData.enterprise_id,
        }
      }
    }
  } catch (error) {
    console.error('Auth check error:', error)
  }

  return null
}

export async function destroyUserSession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(USER_SESSION_COOKIE)?.value
  let userEmail = 'unknown'

  if (sessionToken) {
    const supabase = createAdminClient()
    
    // Get session info before deleting for audit logging
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id, users:user_id(email)')
      .eq('session_token', sessionToken)
      .single()

    if (session) {
      const userRecord = session.users as any
      userEmail = userRecord?.email || 'unknown'
    }

    await supabase.from('user_sessions').delete().eq('session_token', sessionToken)
    
    // Log session destruction
    logSecurityEvent({
      type: 'session_destroyed',
      endpoint: '/api/auth/session',
      details: `Session destroyed for user: ${userEmail}`,
    })
  }

  cookieStore.delete(USER_SESSION_COOKIE)

  // Also sign out from Supabase
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Supabase signout error:', error)
    logSecurityEvent({
      type: 'session_destruction_error',
      endpoint: '/api/auth/session',
      details: `Error during Supabase signout: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }
}

export async function getUserActiveSessions(userId: string) {
  const supabase = createAdminClient()
  const cookieStore = await cookies()
  const currentToken = cookieStore.get(USER_SESSION_COOKIE)?.value

  const { data: sessions, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('last_activity_at', { ascending: false })

  if (error) return []

  return sessions.map(session => ({
    ...session,
    is_current: session.session_token === currentToken,
  }))
}

export async function revokeUserSession(sessionId: string, userId: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('user_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId)

  return !error
}
