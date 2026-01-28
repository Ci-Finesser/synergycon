import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession, createUnauthorizedResponse } from '@/lib/admin-auth';
import {
  getActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
  logout,
  validateSession,
  cleanupExpiredSessions,
} from '@/lib/session-tracker';

/**
 * GET /api/admin/sessions
 * List all active sessions for the current admin
 */
export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession();
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session');
    }

    // Validate current session
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for action query parameter
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'cleanup') {
      // Cleanup expired sessions (admin utility)
      const count = await cleanupExpiredSessions();
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${count} expired sessions`,
        count,
      });
    }

    // Get all active sessions
    const sessions = await getActiveSessions(session.admin_id);

    return NextResponse.json({
      success: true,
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/sessions
 * Revoke sessions
 * Body: { action: 'revoke' | 'revoke_all' | 'logout', session_id?: string }
 */
export async function DELETE(request: Request) {
  try {
    // Validate current session
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, session_id } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'revoke': {
        // Revoke a specific session
        if (!session_id) {
          return NextResponse.json(
            { error: 'session_id is required for revoke action' },
            { status: 400 }
          );
        }

        // Don't allow revoking current session with this action
        if (session_id === session.id) {
          return NextResponse.json(
            { error: 'Cannot revoke current session. Use logout action instead.' },
            { status: 400 }
          );
        }

        const success = await revokeSession(session_id, session.admin_id);
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to revoke session' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Session revoked successfully',
        });
      }

      case 'revoke_all': {
        // Revoke all sessions except current
        const success = await revokeAllOtherSessions(
          session.admin_id,
          session.session_token
        );
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to revoke sessions' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'All other sessions revoked successfully',
        });
      }

      case 'logout': {
        // Logout current session
        const success = await logout();
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to logout' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Logged out successfully',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/sessions
 * Refresh current session (extend expiration)
 */
export async function POST(request: Request) {
  try {
    // Validate current session
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'refresh') {
      // Session is already refreshed by validateSession (updates last_activity)
      // Could extend expires_at here if needed
      return NextResponse.json({
        success: true,
        message: 'Session refreshed',
        session: {
          id: session.id,
          last_activity: session.last_activity,
          expires_at: session.expires_at,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}
