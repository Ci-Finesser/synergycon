# Security System Implementation Guide

## Overview
Comprehensive security system for SynergyCon 2.0 with Two-Factor Authentication (2FA), session management, and login history tracking.

## Features Implemented

### 1. Two-Factor Authentication (2FA)
- **QR Code Setup**: Users can set up 2FA by scanning a QR code with authenticator apps (Google Authenticator, Authy, etc.)
- **TOTP Verification**: Time-based One-Time Password verification
- **Backup Codes**: 8 backup codes generated during setup for account recovery
- **Enable/Disable**: Users can enable or disable 2FA at any time

### 2. Session Management
- **Active Sessions Tracking**: View all devices currently logged into your account
- **Session Details**: Device name, location, IP address, last active time
- **Current Session Indicator**: Highlights the current active session
- **Session Revocation**: Revoke individual sessions or all sessions at once
- **Auto-cleanup**: Sessions update last_active timestamp on activity

### 3. Login History
- **Login Tracking**: Records all login attempts (successful and failed)
- **Device Tracking**: Device name, location, and IP address
- **Status Indicators**: Visual distinction between successful and failed attempts
- **Timestamp Display**: Smart relative timestamps (just now, 5m ago, 2h ago, etc.)

## File Structure

```
app/
├── dashboard/
│   └── security/
│       └── page.tsx                              # Main security settings page
└── api/
    └── user/
        ├── auth/
        │   └── 2fa/
        │       ├── status/
        │       │   └── route.ts                   # GET 2FA status
        │       ├── setup/
        │       │   └── route.ts                   # POST Generate QR code
        │       ├── verify/
        │       │   └── route.ts                   # POST Verify and enable 2FA
        │       └── disable/
        │           └── route.ts                   # POST Disable 2FA
        ├── sessions/
        │   ├── route.ts                           # GET List sessions
        │   ├── [id]/
        │   │   └── route.ts                       # DELETE Revoke session
        │   └── revoke-all/
        │       └── route.ts                       # POST Revoke all sessions
        └── security/
            └── login-history/
                └── route.ts                       # GET Login history

supabase/
└── migrations/
    └── 20260103130000_create_security_tables.sql  # Database schema
```

## Database Schema

### user_2fa_secrets
```sql
CREATE TABLE user_2fa_secrets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  secret TEXT NOT NULL,                    -- Base32 encoded TOTP secret
  enabled BOOLEAN DEFAULT false,           -- Whether 2FA is active
  backup_codes TEXT[] DEFAULT '{}',        -- Array of backup codes
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id)
);
```

### user_sessions
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_token TEXT NOT NULL,             -- Session access token
  device TEXT NOT NULL,                    -- Device name (e.g., "Chrome on Windows")
  location TEXT NOT NULL,                  -- Location (e.g., "Lagos, Nigeria")
  ip_address TEXT NOT NULL,                -- IP address
  user_agent TEXT,                         -- Full user agent string
  last_active TIMESTAMPTZ,                 -- Last activity timestamp
  created_at TIMESTAMPTZ,
  UNIQUE(session_token)
);
```

### login_history
```sql
CREATE TABLE login_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  device TEXT NOT NULL,                    -- Device name
  location TEXT NOT NULL,                  -- Location
  ip_address TEXT NOT NULL,                -- IP address
  user_agent TEXT,                         -- User agent string
  status TEXT CHECK (status IN ('success', 'failed')),
  timestamp TIMESTAMPTZ
);
```

## API Endpoints

### 2FA Endpoints

#### Check 2FA Status
```typescript
GET /api/user/auth/2fa/status

Response:
{
  "enabled": boolean
}
```

#### Setup 2FA
```typescript
POST /api/user/auth/2fa/setup

Response:
{
  "secret": string,      // Base32 encoded secret
  "qrCode": string       // Data URL for QR code image
}
```

#### Verify and Enable 2FA
```typescript
POST /api/user/auth/2fa/verify

Body:
{
  "token": string,       // 6-digit TOTP code
  "secret": string       // Secret from setup
}

Response:
{
  "success": true,
  "backupCodes": string[]  // Array of 8 backup codes
}
```

#### Disable 2FA
```typescript
POST /api/user/auth/2fa/disable

Response:
{
  "success": true
}
```

### Session Endpoints

#### List Active Sessions
```typescript
GET /api/user/sessions

Response:
{
  "sessions": [
    {
      "id": string,
      "device": string,
      "location": string,
      "ip_address": string,
      "last_active": string,
      "is_current": boolean,
      "created_at": string
    }
  ]
}
```

#### Revoke Specific Session
```typescript
DELETE /api/user/sessions/{id}

Response:
{
  "success": true
}
```

#### Revoke All Sessions
```typescript
POST /api/user/sessions/revoke-all

Response:
{
  "success": true
}
```

### Login History Endpoint

#### Get Login History
```typescript
GET /api/user/security/login-history?limit=50

Response:
{
  "history": [
    {
      "id": string,
      "device": string,
      "location": string,
      "ip_address": string,
      "status": "success" | "failed",
      "timestamp": string
    }
  ]
}
```

## Usage Examples

### Setting Up 2FA

1. **Check Current Status**
```javascript
const response = await fetch('/api/user/auth/2fa/status')
const { enabled } = await response.json()
```

2. **Start Setup**
```javascript
const response = await fetch('/api/user/auth/2fa/setup', {
  method: 'POST'
})
const { qrCode, secret } = await response.json()
// Display qrCode to user
```

3. **Verify Code**
```javascript
const response = await fetch('/api/user/auth/2fa/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: '123456',
    secret: secret
  })
})
const { backupCodes } = await response.json()
// Show backup codes to user
```

### Managing Sessions

1. **List All Sessions**
```javascript
const response = await fetch('/api/user/sessions')
const { sessions } = await response.json()
```

2. **Revoke a Session**
```javascript
const response = await fetch(`/api/user/sessions/${sessionId}`, {
  method: 'DELETE'
})
```

3. **Revoke All Other Sessions**
```javascript
const response = await fetch('/api/user/sessions/revoke-all', {
  method: 'POST'
})
```

## Security Features

### Row Level Security (RLS)
All tables have RLS policies ensuring:
- Users can only access their own data
- System can insert/update records as needed
- No cross-user data leakage

### 2FA Best Practices
- Secrets are Base32 encoded and stored securely
- Backup codes are generated using cryptographically secure random bytes
- TOTP window allows 2 time steps for clock skew tolerance
- Users cannot disable 2FA while it's being used for login

### Session Security
- Session tokens are unique and tied to specific devices
- Current session cannot be revoked (prevents lockout)
- Last active timestamps auto-update on activity
- Sessions can be bulk revoked for security incidents

### Login History
- All login attempts are logged (successful and failed)
- Historical data retained for security auditing
- Automatic cleanup function for old records (90+ days)

## Dependencies

```json
{
  "dependencies": {
    "speakeasy": "^2.0.0",    // TOTP generation and verification
    "qrcode": "^1.5.0"         // QR code generation
  },
  "devDependencies": {
    "@types/speakeasy": "^2.0.0",
    "@types/qrcode": "^1.5.0"
  }
}
```

## Installation

1. **Install dependencies**
```bash
pnpm add speakeasy qrcode
pnpm add -D @types/speakeasy @types/qrcode
```

2. **Run migrations**
```bash
pnpm migrate
```

3. **Access the security page**
Navigate to `/dashboard/security` in your application.

## UI Components

### Security Settings Page
- **Three-tab interface**: 2FA, Active Sessions, Login History
- **Responsive design**: Works on mobile, tablet, and desktop
- **Real-time updates**: Refresh buttons for sessions and history
- **Smart timestamps**: Human-readable relative timestamps
- **Status indicators**: Visual badges for session/login status

### 2FA Setup Flow
1. **QR Code Step**: Display QR code and manual entry code
2. **Verification Step**: 6-digit code input with validation
3. **Backup Codes Step**: Display 8 backup codes with copy/download options
4. **Completion Step**: Success confirmation

### Session Management
- **Current session badge**: Highlights active session
- **Device icons**: Visual indicators for different devices
- **Location display**: Shows IP and geographic location
- **Bulk actions**: Revoke all button for quick security response

### Login History
- **Status badges**: Green for success, red for failed attempts
- **Chronological order**: Most recent first
- **Detailed information**: Device, location, IP, timestamp
- **Infinite scroll ready**: Supports pagination via limit parameter

## Error Handling

All API routes include comprehensive error handling:
- **401 Unauthorized**: User not authenticated
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side errors

UI includes:
- Toast notifications for all actions
- Loading states for async operations
- Confirmation dialogs for destructive actions
- Graceful fallbacks for missing data

## Future Enhancements

- [ ] WebAuthn/FIDO2 support for passwordless authentication
- [ ] Email notifications for new device logins
- [ ] IP-based location lookup for more accurate locations
- [ ] Device fingerprinting for enhanced security
- [ ] Suspicious activity detection
- [ ] Account recovery via backup codes
- [ ] 2FA enforcement for admin accounts
- [ ] Session duration limits and auto-logout

## Testing Checklist

- [ ] 2FA setup flow completes successfully
- [ ] QR code scans correctly in authenticator apps
- [ ] Verification code accepts valid TOTP codes
- [ ] Backup codes are unique and properly formatted
- [ ] 2FA can be disabled successfully
- [ ] Sessions list shows current device
- [ ] Session revocation works correctly
- [ ] Cannot revoke current session
- [ ] Revoke all sessions keeps current session
- [ ] Login history displays all attempts
- [ ] Failed logins are marked correctly
- [ ] Timestamps display in relative format
- [ ] Responsive design works on all screen sizes
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly

## Troubleshooting

### QR Code Not Generating
- Ensure `qrcode` package is installed
- Check server logs for QR generation errors
- Verify secret is properly base32 encoded

### TOTP Codes Not Verifying
- Check device time is synchronized
- Verify secret matches what was generated
- Increase time window in speakeasy.totp.verify

### Sessions Not Appearing
- Ensure session tracking middleware is active
- Check user_sessions table for data
- Verify RLS policies are correct

### Login History Empty
- Implement login tracking in authentication flow
- Check login_history table structure
- Verify INSERT policies are working

## Support

For issues or questions:
1. Check this documentation first
2. Review error logs in the browser console
3. Check Supabase logs for database errors
4. Verify all migrations have run successfully
5. Ensure all dependencies are installed

## License
Part of the SynergyCon 2.0 platform - All rights reserved.
