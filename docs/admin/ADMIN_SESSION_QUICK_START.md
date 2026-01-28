# Admin Session Management - Quick Start Guide

## What Was Added?

A complete session tracking system for admin users to:
- See all active login sessions across devices
- View device info (browser, OS, IP address)
- View last login and last activity times
- Revoke individual sessions
- Log out all other devices at once

## Getting Started

### 1. Run Database Migration

Execute this SQL in Supabase:
```sql
-- Run the migration file: scripts/010_create_admin_sessions_table.sql
```

Or via command line:
```bash
cd c:\Users\FINESSER\Documents\synergycon-website
# Execute using your Supabase CLI or SQL client
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access Sessions Page

1. Log in to admin panel (`/admin`)
2. Click "Sessions" button in navigation bar
3. Or navigate directly to: `http://localhost:3000/admin/sessions`

## What You'll See

### Current Session (Green Badge)
- Device name (e.g., "Chrome on Windows")
- Last activity (e.g., "2 minutes ago")
- Login time
- IP address
- Browser and OS info

### Other Sessions
- All active sessions from other devices
- "Revoke" button to log out that device
- Same information as current session

### Actions
- **Refresh Button** - Update session list manually
- **Revoke Button** - Log out a specific device
- **Log Out All Others** - Keep only current device logged in

## How Sessions Work

### When You Login
1. Admin enters email/password
2. System creates a session record in database
3. Session token stored in secure HTTP-only cookie
4. Device information captured (browser, OS, IP)

### Session Lifetime
- **Duration:** 7 days by default
- **Last Activity:** Updated on each API request
- **Auto Cleanup:** Expired sessions removed automatically

### When You Revoke a Session
1. Click "Revoke" or "Log Out All Others"
2. Session deleted from database
3. Other device logged out on next request

## Key Features

✅ **Security**
- HTTP-only cookies (XSS protection)
- HTTPS required (in production)
- Cryptographic tokens
- Automatic session expiration
- One-time account recovery via revoke

✅ **User Experience**
- Real-time session updates (auto-refresh every 30 seconds)
- Human-readable timestamps (e.g., "2 hours ago")
- Device icons (desktop/mobile/tablet)
- Current session highlighted in green
- Responsive design works on all devices

✅ **Functionality**
- Multi-device tracking
- Location data (if IP geolocation enabled)
- Activity history per session
- Batch revocation (all others)
- Single session revocation

## File Locations

### Database
- Migration: `scripts/010_create_admin_sessions_table.sql`

### Backend
- Session utilities: `lib/session-tracker.ts`
- API routes: `app/api/admin/sessions/route.ts`
- Login integration: `app/api/admin/auth/login/route.ts`

### Frontend
- Component: `components/admin/active-sessions.tsx`
- Page: `app/admin/sessions/page.tsx`
- Navigation: `components/admin-navigation.tsx` (updated)

## API Endpoints

### List Sessions
```
GET /api/admin/sessions
```
Returns all active sessions with device info

### Revoke a Session
```
DELETE /api/admin/sessions
Body: { action: "revoke", session_id: "uuid" }
```

### Revoke All Others
```
DELETE /api/admin/sessions
Body: { action: "revoke_all" }
```

### Logout
```
DELETE /api/admin/sessions
Body: { action: "logout" }
```

### Refresh Session
```
POST /api/admin/sessions
Body: { action: "refresh" }
```

## Customization

### Change Session Duration
Edit `lib/session-tracker.ts`:
```typescript
const SESSION_DURATION_DAYS = 7; // Change to desired number
```

### Change Auto-Refresh Interval
Edit `app/admin/sessions/page.tsx`:
```tsx
<ActiveSessions 
  autoRefresh={true} 
  refreshInterval={30000}  // milliseconds (30 seconds)
/>
```

### Customize Display
- Color scheme: Edit Tailwind classes in `components/admin/active-sessions.tsx`
- Device icons: Import different icons from `lucide-react`
- Time format: Modify `formatDate()` function

## Troubleshooting

### Sessions page shows "Loading..."
- Check browser console for errors
- Verify admin is authenticated
- Check network tab for API errors

### "Revoke" button doesn't work
- Check if you're trying to revoke current session (use logout instead)
- Verify API response in network tab
- Check browser console for errors

### Old sessions not disappearing
- Run cleanup: `GET /api/admin/sessions?action=cleanup`
- Check if session expiration time has passed
- Verify database migration was applied

### Device info showing "Unknown"
- Normal for some browsers with privacy settings
- User agent might be blocked or empty
- Add debugging in `parseUserAgent()` if needed

## Security Notes

### ✅ Already Secured
- HTTPS required for cookie transmission
- XSS protection via HTTP-only cookies
- CSRF protection via SameSite cookies
- Automatic expiration
- Cryptographic tokens

### ⚠️ Manual Security Steps
1. Enable HTTPS in production
2. Regularly review active sessions
3. Revoke suspicious sessions immediately
4. Consider IP change detection
5. Log all session activities for audit

## Support

For detailed documentation, see: `ADMIN_SESSION_MANAGEMENT.md`

For issues or enhancement requests:
1. Check troubleshooting section
2. Review browser console logs
3. Check database records in Supabase
4. Examine API responses in Network tab
