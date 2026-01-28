import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import type { SessionInfo, DeviceInfo } from '@/types/utils'

// Re-export for backward compatibility
export type { SessionInfo, DeviceInfo }

// Session duration: 7 days by default
const SESSION_DURATION_DAYS = 7;
const SESSION_COOKIE_NAME = 'admin_session_token';

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Parse user agent to extract device information
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();
  
  // Detect device type
  let device_type: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (ua.includes('mobile')) {
    device_type = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device_type = 'tablet';
  }
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('edg/')) {
    browser = 'Edge';
  } else if (ua.includes('chrome/')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox';
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('opera/') || ua.includes('opr/')) {
    browser = 'Opera';
  }
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac os x') || ua.includes('macos')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  }
  
  // Generate device name
  const device_name = `${browser} on ${os}`;
  
  return {
    device_name,
    device_type,
    browser,
    os,
    user_agent: userAgent,
  };
}

/**
 * Get IP address from request headers
 */
export function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || undefined;
}

/**
 * Get location info from IP
 * 
 * Future enhancement: Integrate with IP geolocation API (ipapi.co, ipinfo.io, etc.)
 * Currently returns empty location as a placeholder.
 * When implemented, use process.env.IP_GEOLOCATION_API_KEY for credentials.
 */
export async function getLocationFromIP(ip?: string): Promise<{ city?: string; country?: string }> {
  if (!ip) {
    return {}
  }
  // Placeholder for future IP geolocation integration
  return {};
}

/**
 * Create a new session record
 */
export async function createSession(
  adminId: string,
  request: Request
): Promise<{ session_token: string; session_id: string } | null> {
  try {
    const supabase = await createClient();
    
    // Generate session token
    const session_token = generateSessionToken();
    
    // Extract device info
    const userAgent = request.headers.get('user-agent') || '';
    const deviceInfo = parseUserAgent(userAgent);
    
    // Get IP address
    const ip_address = getClientIP(request);
    
    // Get location (stub for now)
    const location = await getLocationFromIP(ip_address);
    
    // Calculate expiration
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + SESSION_DURATION_DAYS);
    
    // Insert session
    const { data, error } = await supabase
      .from('admin_sessions')
      .insert({
        admin_id: adminId,
        session_token,
        ...deviceInfo,
        ip_address,
        location_city: location.city,
        location_country: location.country,
        expires_at: expires_at.toISOString(),
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating session:', error);
      return null;
    }
    
    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });
    
    return {
      session_token,
      session_id: data.id,
    };
  } catch (error) {
    console.error('Error in createSession:', error);
    return null;
  }
}

/**
 * Validate session token and update last activity
 */
export async function validateSession(sessionToken?: string): Promise<SessionInfo | null> {
  try {
    // Get token from parameter or cookie
    let token = sessionToken;
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }
    
    if (!token) {
      return null;
    }
    
    const supabase = await createClient();
    
    // Find session and check if expired
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !session) {
      return null;
    }
    
    // Update last activity
    await supabase
      .from('admin_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', session.id);
    
    return session as SessionInfo;
  } catch (error) {
    console.error('Error in validateSession:', error);
    return null;
  }
}

/**
 * Get all active sessions for an admin
 */
export async function getActiveSessions(adminId: string, currentToken?: string): Promise<SessionInfo[]> {
  try {
    const supabase = await createClient();
    
    // Get current token from cookie if not provided
    let token = currentToken;
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }
    
    // Get all active sessions
    const { data: sessions, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('admin_id', adminId)
      .gt('expires_at', new Date().toISOString())
      .order('last_activity', { ascending: false });
    
    if (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
    
    // Mark current session
    return (sessions || []).map((session: any) => ({
      ...session,
      is_current: session.session_token === token,
    }));
  } catch (error) {
    console.error('Error in getActiveSessions:', error);
    return [];
  }
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string, adminId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('admin_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('admin_id', adminId);
    
    if (error) {
      console.error('Error revoking session:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in revokeSession:', error);
    return false;
  }
}

/**
 * Revoke all sessions except current
 */
export async function revokeAllOtherSessions(adminId: string, currentToken?: string): Promise<boolean> {
  try {
    // Get current token from cookie if not provided
    let token = currentToken;
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }
    
    if (!token) {
      return false;
    }
    
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('admin_sessions')
      .delete()
      .eq('admin_id', adminId)
      .neq('session_token', token);
    
    if (error) {
      console.error('Error revoking other sessions:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in revokeAllOtherSessions:', error);
    return false;
  }
}

/**
 * Logout: Delete current session
 */
export async function logout(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!token) {
      return false;
    }
    
    const supabase = await createClient();
    
    // Delete session from database
    await supabase
      .from('admin_sessions')
      .delete()
      .eq('session_token', token);
    
    // Delete cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
    
    return true;
  } catch (error) {
    console.error('Error in logout:', error);
    return false;
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('admin_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');
    
    if (error) {
      console.error('Error cleaning up sessions:', error);
      return 0;
    }
    
    return data?.length || 0;
  } catch (error) {
    console.error('Error in cleanupExpiredSessions:', error);
    return 0;
  }
}
