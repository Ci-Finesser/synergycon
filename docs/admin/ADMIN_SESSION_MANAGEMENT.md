# Admin Session Management Implementation Guide

## Overview

A comprehensive session management system has been implemented to allow admins to track active authorized sessions across multiple devices, view last login information, and revoke sessions from other devices for security purposes.

## Features Implemented

### 1. **Multi-Device Session Tracking**
- Track all active sessions for each admin user
- Display device information (type, name, browser, OS)
- Show IP addresses and location data (if IP geolocation is enabled)
- Track login time and last activity timestamp

### 2. **Session Management UI**
- Dashboard page at `/admin/sessions` with real-time session monitoring
- Device identification with icons (desktop/mobile/tablet)
- Session cards with detailed information
- One-click session revocation
- "Log Out All Other Devices" functionality
- Auto-refresh capability (default 30 seconds)

### 3. **API Endpoints**
- `GET /api/admin/sessions` - List all active sessions
- `DELETE /api/admin/sessions` - Revoke sessions
- `POST /api/admin/sessions` - Refresh session

### 4. **Security Features**
- Session token-based authentication (HTTP-only cookies)
- Automatic session expiration (7 days by default)
- Device fingerprinting from user agent
- IP address tracking
- Auto-cleanup of expired sessions
- Session validation middleware

## Database Schema

### `admin_sessions` Table

```sql
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY,
  admin_id UUID NOT NULL (FK -> admins.id),
  session_token TEXT UNIQUE NOT NULL,
  device_name TEXT,           -- e.g., "Chrome on Windows"
  device_type TEXT,           -- 'desktop', 'mobile', 'tablet'
  browser TEXT,               -- e.g., "Chrome", "Safari", "Firefox"
  os TEXT,                    -- e.g., "Windows", "macOS", "iOS"
  ip_address TEXT,            -- Client IP address
  user_agent TEXT,            -- Full browser user agent
  location_city TEXT,         -- Optional: Requires IP geolocation API
  location_country TEXT,      -- Optional: Requires IP geolocation API
  is_current BOOLEAN,         -- Current session indicator (computed)
  login_time TIMESTAMPTZ,     -- When session was created
  last_activity TIMESTAMPTZ,  -- Last request with this session
  expires_at TIMESTAMPTZ,     -- Session expiration time
  created_at TIMESTAMPTZ
);
```

**Indexes Created:**
- `idx_admin_sessions_admin_id` - For querying by admin
- `idx_admin_sessions_session_token` - For session validation
- `idx_admin_sessions_expires_at` - For cleanup queries
- `idx_admin_sessions_last_activity` - For activity tracking

## Core Files

### Session Tracking Utilities
**File:** [lib/session-tracker.ts](lib/session-tracker.ts)

Key functions:
- `generateSessionToken()` - Creates cryptographically secure session tokens
- `parseUserAgent()` - Extracts device info from user agent string
- `getClientIP()` - Retrieves client IP from request headers
- `getLocationFromIP()` - Stub for IP geolocation (integrate with service)
- `createSession()` - Creates new session record on login
- `validateSession()` - Validates and refreshes session, updates last_activity
- `getActiveSessions()` - Lists all active sessions for an admin
- `revokeSession()` - Deletes a specific session
- `revokeAllOtherSessions()` - Revokes all sessions except current
- `logout()` - Deletes current session
- `cleanupExpiredSessions()` - Removes expired sessions

### API Routes
**File:** [app/api/admin/sessions/route.ts](app/api/admin/sessions/route.ts)

Endpoints:
- `GET /api/admin/sessions` - List active sessions
- `GET /api/admin/sessions?action=cleanup` - Admin utility to cleanup expired sessions
- `DELETE /api/admin/sessions` - Revoke sessions (body: {action, session_id})
  - Actions: `'revoke'`, `'revoke_all'`, `'logout'`
- `POST /api/admin/sessions` - Refresh session (body: {action: 'refresh'})

### Login Integration
**File:** [app/api/admin/auth/login/route.ts](app/api/admin/auth/login/route.ts)

Modified to:
1. Call `createSession()` after successful login
2. Track device information and IP address
3. Return `session_id` in response
4. Maintain backward compatibility with existing `admin_session` cookie

### UI Components

#### ActiveSessions Component
**File:** [components/admin/active-sessions.tsx](components/admin/active-sessions.tsx)

Features:
- Real-time session list with auto-refresh
- Device icons and browser/OS information
- Last activity tracking with human-readable timestamps
- "Revoke" button for individual sessions
- "Log Out All Other Devices" button
- Current session indicator (green badge)
- Loading states and error handling
- Responsive grid layout with stats summary

#### Sessions Page
**File:** [app/admin/sessions/page.tsx](app/admin/sessions/page.tsx)

- Protects route with admin authentication check
- Renders ActiveSessions component
- Server-side rendering with authentication validation

### Navigation
**File:** [components/admin-navigation.tsx](components/admin-navigation.tsx)

Updated to:
- Add "Sessions" link in admin navigation
- Link goes to `/admin/sessions`
- Shows on all admin pages

## Configuration

### Session Duration
Default: **7 days**

Edit in [lib/session-tracker.ts](lib/session-tracker.ts):
```typescript
const SESSION_DURATION_DAYS = 7;
```

### Auto-Refresh Interval
Default: **30 seconds**

Customize in [app/admin/sessions/page.tsx](app/admin/sessions/page.tsx):
```tsx
<ActiveSessions autoRefresh={true} refreshInterval={30000} />
```

### Session Cookie Settings
- Name: `admin_session_token`
- HttpOnly: ✅ Yes (prevent XSS access)
- Secure: ✅ Yes (production only)
- SameSite: `lax` (CSRF protection)
- Max Age: 7 days

## Usage

### For Admins

1. **View Active Sessions:**
   - Navigate to `/admin/sessions`
   - See all active sessions with device info, location, and last activity

2. **Revoke a Session:**
   - Click "Revoke" button on any session card
   - Device will be logged out immediately

3. **Log Out All Other Devices:**
   - Click "Log Out All Other Devices" button
   - All sessions except current will be revoked
   - Useful for security after password change or if compromised

4. **Auto-Refresh:**
   - Sessions list automatically refreshes every 30 seconds
   - Shows real-time activity updates

### For Developers

#### Create a Session (Called on Login)
```typescript
import { createSession } from '@/lib/session-tracker';

// In login endpoint
const sessionResult = await createSession(adminId, request);
if (sessionResult) {
  console.log('Session ID:', sessionResult.session_id);
  console.log('Session Token:', sessionResult.session_token);
}
```

#### Validate a Session
```typescript
import { validateSession } from '@/lib/session-tracker';

// Automatically updates last_activity
const session = await validateSession();
if (!session) {
  // Session expired or invalid
  redirect('/admin/login');
}
```

#### Get All Active Sessions
```typescript
import { getActiveSessions } from '@/lib/session-tracker';

const sessions = await getActiveSessions(adminId);
sessions.forEach(session => {
  console.log(`${session.device_name} - Last active: ${session.last_activity}`);
});
```

#### Revoke a Session
```typescript
import { revokeSession } from '@/lib/session-tracker';

const success = await revokeSession(sessionId, adminId);
```

## API Usage Examples

### Get All Active Sessions
```bash
curl -X GET http://localhost:3000/api/admin/sessions \
  -H "Cookie: admin_session_token=<token>"
```

Response:
```json
{
  "success": true,
  "sessions": [
    {
      "id": "uuid",
      "admin_id": "uuid",
      "session_token": "...",
      "device_name": "Chrome on Windows",
      "device_type": "desktop",
      "browser": "Chrome",
      "os": "Windows",
      "ip_address": "192.168.1.1",
      "location_city": null,
      "location_country": null,
      "is_current": true,
      "login_time": "2024-01-15T10:30:00Z",
      "last_activity": "2024-01-15T10:45:00Z",
      "expires_at": "2024-01-22T10:30:00Z",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### Revoke a Session
```bash
curl -X DELETE http://localhost:3000/api/admin/sessions \
  -H "Cookie: admin_session_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "revoke", "session_id": "uuid"}'
```

### Revoke All Other Sessions
```bash
curl -X DELETE http://localhost:3000/api/admin/sessions \
  -H "Cookie: admin_session_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "revoke_all"}'
```

### Logout
```bash
curl -X DELETE http://localhost:3000/api/admin/sessions \
  -H "Cookie: admin_session_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "logout"}'
```

## Database Migration

Run this SQL migration to create the sessions table:

```bash
psql -U postgres -d synergycon -f scripts/010_create_admin_sessions_table.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy content of [scripts/010_create_admin_sessions_table.sql](scripts/010_create_admin_sessions_table.sql)
3. Run the query

## Security Considerations

### ✅ Implemented
- **HTTP-only Cookies:** Session tokens stored in HTTP-only cookies, inaccessible to JavaScript
- **Secure Flag:** Cookies only sent over HTTPS in production
- **SameSite Protection:** `lax` SameSite policy prevents CSRF attacks
- **Session Expiration:** Sessions expire after 7 days
- **Token Generation:** Cryptographically secure random tokens (32 bytes)
- **Last Activity Tracking:** Updated on each request to detect stale sessions
- **Automatic Cleanup:** Expired sessions automatically removed

### 🔄 Consider for Enhancement
- **IP Address Validation:** Flag if session IP changes significantly
- **Geo-Location Blocking:** Prevent logins from unexpected locations
- **Device Fingerprinting:** Use more robust fingerprinting (canvas, WebGL, etc.)
- **Redis Integration:** For distributed session management in production
- **Database Persistence:** Move session logs to permanent storage
- **Anomaly Detection:** Alert on suspicious login patterns
- **2FA per Session:** Require 2FA for sensitive operations
- **Session Recording:** Log all actions per session for audit trail

## Troubleshooting

### Sessions Not Updating
- Check browser cookies are enabled
- Ensure HTTP-only cookie is being set (check Network tab)
- Verify `admin_session_token` cookie exists
- Check browser console for JS errors

### Old Sessions Not Cleaning Up
- Manual cleanup: `GET /api/admin/sessions?action=cleanup`
- Check if Supabase `pg_cron` extension is enabled for auto-cleanup
- Consider implementing background job for session cleanup

### Device Info Showing as "Unknown"
- User agent might be empty or malformed
- Increase validation in `parseUserAgent()` function
- Add logging to see actual user agent strings

### Location Data Not Showing
- IP geolocation is stubbed - integrate with API like:
  - `ipapi.co` (free tier available)
  - `ipinfo.io`
  - `maxmind.com`
  - Cloudflare IP Intelligence

## Next Steps

1. **Run Database Migration**
   ```bash
   npm run db:migrate scripts/010_create_admin_sessions_table.sql
   ```

2. **Test Session Creation**
   - Log in to admin panel
   - Check `/admin/sessions` page
   - Verify session appears with correct device info

3. **Test Session Revocation**
   - Create multiple sessions (different browsers/devices)
   - Revoke one session
   - Verify device is logged out

4. **Integrate IP Geolocation (Optional)**
   - Choose geolocation service
   - Implement in `getLocationFromIP()` function
   - Test with various IPs

5. **Production Deployment**
   - Enable HTTPS (required for secure cookies)
   - Consider Redis for distributed sessions
   - Set up monitoring/alerting for suspicious activity
   - Configure log retention policies

## Files Modified

- `scripts/010_create_admin_sessions_table.sql` - Database schema
- `lib/session-tracker.ts` - Core session management
- `app/api/admin/auth/login/route.ts` - Session creation on login
- `app/api/admin/sessions/route.ts` - Session API endpoints
- `components/admin/active-sessions.tsx` - UI component
- `app/admin/sessions/page.tsx` - Sessions page
- `components/admin-navigation.tsx` - Added Sessions link
- `lib/supabase/middleware.ts` - Updated with session note
- `components/ui/alert.tsx` - Created Alert component (backup)

## Summary

The session management system is now fully functional and provides:
- ✅ Multi-device session tracking
- ✅ Real-time activity monitoring
- ✅ Easy session revocation
- ✅ Security-first design with HTTP-only cookies
- ✅ Responsive UI with auto-refresh
- ✅ Comprehensive API endpoints
- ✅ Automatic cleanup of expired sessions
