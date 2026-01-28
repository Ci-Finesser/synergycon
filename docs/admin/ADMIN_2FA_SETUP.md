# Admin Two-Factor Authentication (2FA)

## Overview

The SynergyCon admin panel now includes **mandatory email-based two-factor authentication (2FA)** for all admin accounts. This adds an extra layer of security by requiring admins to verify their identity with a 6-digit code sent to their email each time they log in.

## Features

### 🔐 Compulsory 2FA
- All admin accounts must have 2FA enabled
- First-time admins are automatically guided through setup
- Cannot access admin dashboard without completing 2FA verification

### 📧 Email-Based Verification
- 6-digit codes sent via email using Resend
- Codes expire after 10 minutes
- Can resend codes if needed
- Clean, branded email templates

### 🎯 User-Friendly Flow
- Seamless integration with existing login
- Clear step-by-step setup process
- Visual feedback and error handling
- Test code functionality in settings

## How It Works

### For First-Time Admins

1. **Login**: Enter email and password at `/admin/login`
2. **Auto-Redirect**: Redirected to `/admin/2fa-setup` automatically
3. **Enable 2FA**: Click "Enable 2FA" to receive a code via email
4. **Verify**: Enter the 6-digit code to complete setup
5. **Access**: Redirected to admin dashboard

### For Existing Admins

1. **Login**: Enter email and password at `/admin/login`
2. **Code Sent**: System automatically sends verification code
3. **Verify**: Enter 6-digit code on the same page
4. **Access**: Redirected to admin dashboard

### Session Management

- Admin sessions last 7 days
- `twoFactorVerified` flag in session cookie
- Middleware enforces 2FA verification for all admin routes
- Sessions expire and require re-authentication

## Implementation Details

### Database Schema

**Tables:**
- `admin_2fa_secrets` - Stores 2FA configuration per admin
- `admin_2fa_codes` - Stores generated OTP codes with expiration

**Functions:**
- `generate_2fa_code(admin_id)` - Generates 6-digit code
- `verify_2fa_code(admin_id, code)` - Validates code
- `enable_admin_2fa(admin_id)` - Enables 2FA for admin
- `check_admin_2fa_status(admin_id)` - Checks if 2FA is enabled
- `cleanup_expired_2fa_codes()` - Removes expired codes

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/auth/2fa/send-code` | POST | Send verification code via email |
| `/api/admin/auth/2fa/verify-code` | POST | Verify submitted code |
| `/api/admin/auth/2fa/enable` | POST | Enable 2FA for admin |
| `/api/admin/auth/2fa/status` | GET | Check 2FA status |

### UI Components

- **TwoFactorVerification** (`components/admin/two-factor-verification.tsx`)
  - Inline verification during login
  - Code input with auto-formatting
  - Resend and back options

- **TwoFactorSettings** (`components/admin/two-factor-settings.tsx`)
  - Settings page component
  - Status display
  - Test code functionality

### Pages

- `/admin/login` - Enhanced with 2FA verification step
- `/admin/2fa-setup` - First-time 2FA setup wizard
- `/admin/settings` - Account settings with 2FA management

### Middleware Protection

The middleware (`lib/supabase/middleware.ts`) now:
- Checks for `twoFactorVerified` flag in admin session
- Redirects to `/admin/2fa-setup` if not verified
- Allows access only after successful 2FA verification
- Excludes login and 2FA setup pages from checks

## Setup Instructions

### 1. Run Database Migration

Execute the SQL migration to create tables and functions:

```sql
-- Run this in your Supabase SQL editor
-- File: scripts/015_create_admin_2fa.sql
```

Or via Supabase CLI:
```bash
supabase db push scripts/015_create_admin_2fa.sql
```

### 2. Configure Email Service

Ensure Resend API key is set in environment variables:

```env
RESEND_API_KEY=your_resend_api_key_here
```

Update the sender email in `/api/admin/auth/2fa/send-code/route.ts` if needed:
```typescript
from: "SynergyCon Admin <noreply@synergycon.live>"
```

### 3. Test the Flow

1. Log out of admin panel
2. Log in with admin credentials
3. If first time: Complete 2FA setup
4. If returning: Verify with emailed code
5. Access admin dashboard

### 4. Verify Settings Page

Navigate to `/admin/settings` to:
- View 2FA status
- Send test codes
- Review security information

## Security Considerations

### ✅ Implemented
- Codes expire after 10 minutes
- One-time use codes (marked as used after verification)
- HTTP-only session cookies
- Secure cookie flags in production
- Row-level security on database tables
- Server-side validation

### 🔄 Recommended Enhancements
- Rate limiting on code generation
- Account lockout after failed attempts
- Audit logging for authentication events
- SMS backup verification option
- Recovery codes for email access loss
- IP-based suspicious login detection

## Troubleshooting

### Code Not Received
1. Check spam/junk folder
2. Verify Resend API key is valid
3. Check email service logs in Resend dashboard
4. Ensure sender email is verified in Resend

### Cannot Access Admin Panel
1. Clear browser cookies
2. Try logging in again
3. Check middleware logs for redirect loops
4. Verify database functions are created

### Session Expires Too Quickly
1. Check cookie maxAge setting (currently 7 days)
2. Verify secure cookie settings match environment
3. Check browser cookie settings

### Database Errors
1. Ensure migration ran successfully
2. Check RLS policies are enabled
3. Verify admin table exists and has correct schema
4. Test database functions manually

## Maintenance

### Clean Up Expired Codes

Run periodically (e.g., via cron job):

```sql
SELECT cleanup_expired_2fa_codes();
```

Or set up a Supabase Edge Function for automated cleanup.

### Monitor Usage

Check 2FA usage stats:

```sql
-- Count active 2FA users
SELECT COUNT(*) FROM admin_2fa_secrets WHERE is_enabled = true;

-- Recent code generations
SELECT COUNT(*) FROM admin_2fa_codes 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Failed verification attempts (codes that expired unused)
SELECT COUNT(*) FROM admin_2fa_codes 
WHERE is_used = false AND expires_at < NOW();
```

## User Experience

### Email Template

Admins receive branded emails with:
- Clear subject: "Your 2FA Verification Code"
- Large, centered 6-digit code
- Expiration notice (10 minutes)
- Security notice about unsolicited codes

### UI/UX Features

- **Visual Indicators**: Shield icons and color-coded status
- **Auto-formatting**: Code input strips non-digits
- **Inline Validation**: Real-time feedback on code length
- **Loading States**: Clear loading indicators during API calls
- **Error Messages**: User-friendly error explanations
- **Success Feedback**: Confirmation messages on successful actions

## Future Enhancements

Potential additions for enhanced security:

1. **Authenticator App Support** (TOTP)
   - Google Authenticator, Authy integration
   - QR code generation for setup
   - 30-second rotating codes

2. **Backup Codes**
   - Generate 10 one-time backup codes
   - Download/print for safekeeping
   - Use when email unavailable

3. **Security Notifications**
   - Email alerts for new login locations
   - Failed login attempt notifications
   - Session management (view/revoke active sessions)

4. **Advanced Options**
   - Remember device for 30 days
   - Trusted IP addresses
   - Conditional 2FA based on risk

## Support

For issues or questions:
- Check logs: Browser console, server logs, Supabase logs
- Review this documentation
- Test with a fresh admin account
- Verify all migration steps completed

---

**Last Updated**: December 29, 2025
**Version**: 1.0.0
