# 🚀 Reserve Branch Implementation - Quick Start Guide

**Last Updated**: January 7, 2026  
**Status**: Ready for Testing  
**Time to Complete**: 10-15 minutes

---

## ⚡ Quick Setup (3 Commands)

```bash
# 1. Install new dependencies
pnpm install otplib bcryptjs @types/bcryptjs

# 2. Run database migrations
pnpm supabase db push

# 3. Start development server
pnpm dev
```

---

## 📋 Pre-Flight Checklist

### Environment Variables
Check your `.env.local` has:
```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (required for OTP)
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Verify Supabase Connection
```bash
pnpm supabase status
```

Should show: `✓ Connected to project`

---

## 🧪 Testing Guide

### Test 1: OTP Authentication Flow (5 min)

**Step 1: Send OTP**
```bash
# Open browser to http://localhost:3000/login
# Enter your email
# Click "Continue"
```

**Expected Result:**
- ✅ Email received with 6-digit code
- ✅ UI changes to OTP input screen
- ✅ Console shows no errors

**Step 2: Verify OTP**
```bash
# Enter 6-digit code from email
# Click "Sign In"
```

**Expected Result:**
- ✅ Redirected to dashboard
- ✅ Session created in `user_sessions` table
- ✅ User can access protected pages

### Test 2: Audit Logging (2 min)

**Check Audit Logs:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

**Expected Result:**
- ✅ Login event logged
- ✅ IP address captured
- ✅ User agent recorded
- ✅ Timestamp accurate

### Test 3: Ticket QR Code (3 min)

**Prerequisites:** User must have a ticket

**Step 1: Navigate to Tickets**
```bash
# Go to http://localhost:3000/dashboard/tickets
```

**Step 2: Generate QR Code**
```bash
# Click "View QR Code" on any ticket
```

**Expected Result:**
- ✅ Modal opens with QR code
- ✅ QR code image displayed
- ✅ Download button works
- ✅ Console shows no errors

### Test 4: Admin Check-In (5 min)

**Prerequisites:** Admin session + ticket QR data

**Step 1: Admin Login**
```bash
# Login as admin user
# Navigate to admin panel
```

**Step 2: Scan Ticket QR**
```bash
# Use POST /api/admin/attendance/check-in
curl -X POST http://localhost:3000/api/admin/attendance/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "ticket-uuid-here",
    "entry_point": "Main Gate"
  }'
```

**Expected Result:**
```json
{
  "success": true,
  "attendance": {
    "id": "...",
    "ticket_id": "...",
    "check_in_time": "2026-01-07T...",
    "entry_point": "Main Gate"
  }
}
```

### Test 5: Security Metrics (2 min)

**View Security Dashboard:**
```bash
curl http://localhost:3000/api/admin/security
```

**Expected Result:**
```json
{
  "success": true,
  "metrics": {
    "failedLogins24h": 0,
    "activeSessions": 1,
    "otpAttempts24h": 1,
    "suspiciousActivity": []
  },
  "recentLogs": [...]
}
```

---

## 🔍 Database Verification

### Check New Tables

```sql
-- OTP codes table
SELECT * FROM otp_codes ORDER BY created_at DESC LIMIT 5;

-- Attendance records
SELECT * FROM attendance_records ORDER BY created_at DESC LIMIT 5;

-- Audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;

-- User sessions
SELECT * FROM user_sessions WHERE expires_at > NOW() LIMIT 5;

-- Enterprise accounts
SELECT * FROM enterprise_accounts;
```

### Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('otp_codes', 'attendance_records', 'audit_logs', 'user_sessions');

-- Should all show: rowsecurity = true
```

---

## 🐛 Troubleshooting

### Issue: "OTP email not received"

**Check:**
1. Resend API key is correct in `.env.local`
2. Email address is valid
3. Check spam folder
4. Verify Resend dashboard for delivery status

**Debug Query:**
```sql
SELECT * FROM otp_codes 
WHERE email = 'your-email@example.com' 
ORDER BY created_at DESC LIMIT 1;
```

**Fix:** If code exists but email not received, check Resend configuration.

---

### Issue: "Unauthorized" when accessing dashboard

**Check:**
1. User session exists:
```sql
SELECT * FROM user_sessions 
WHERE user_id = 'your-user-id' 
AND expires_at > NOW();
```

2. Cookie is set in browser:
```javascript
// Open browser console
document.cookie.split('; ').find(row => row.startsWith('session_token'))
```

**Fix:** If no session, re-login. If cookie missing, check cookie settings.

---

### Issue: "Table does not exist"

**Symptom:** Database queries fail with "relation does not exist"

**Fix:**
```bash
# Run migrations
pnpm supabase db push

# Verify tables created
pnpm supabase db diff

# If still failing, check Supabase dashboard
```

---

### Issue: "Cannot find module 'otplib'"

**Fix:**
```bash
pnpm install otplib bcryptjs @types/bcryptjs
```

---

### Issue: QR code not generating

**Check:**
1. Ticket exists and belongs to user
2. QR code library is working:
```typescript
// Test in Node REPL
const QRCode = require('qrcode')
QRCode.toDataURL('test').then(console.log)
```

**Fix:** Ensure `qrcode` package is installed: `pnpm install qrcode`

---

## 📊 Validation Checklist

Use this to verify implementation:

### Core Features
- [ ] OTP emails sending successfully
- [ ] OTP codes verifying correctly
- [ ] User sessions created on login
- [ ] Sessions persisting across page reloads
- [ ] Logout clearing sessions
- [ ] Dashboard accessible after login
- [ ] Protected routes redirecting to login

### Admin Features
- [ ] QR code check-in working
- [ ] Attendance records created
- [ ] Audit logs populating
- [ ] Security metrics displaying
- [ ] Session management API working

### Database
- [ ] All 4 new tables created
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Foreign keys working
- [ ] No migration errors

### Security
- [ ] Audit logs capturing events
- [ ] Failed login attempts tracked
- [ ] IP addresses logged
- [ ] Sessions expiring correctly
- [ ] OTP codes single-use

---

## 🎯 Common Workflows

### Register New User with OTP

```typescript
// 1. Send OTP
const res1 = await fetch('/api/user/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', purpose: 'login' })
})

// 2. Get code from email (check inbox)

// 3. Verify OTP
const res2 = await fetch('/api/user/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com', 
    code: '123456', 
    purpose: 'login' 
  })
})

// 4. Access dashboard
window.location.href = '/dashboard'
```

### Admin Check-In Flow

```typescript
// 1. Scan QR code (get ticket data)
const qrData = JSON.parse(scannedData)

// 2. Submit check-in
const res = await fetch('/api/admin/attendance/check-in', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ticket_id: qrData.ticketId,
    entry_point: 'Main Gate'
  })
})

// 3. Show confirmation
if (res.ok) {
  alert('Check-in successful!')
}
```

### View Audit Logs

```typescript
// Fetch recent logs
const res = await fetch('/api/admin/audit-logs?limit=50')
const data = await res.json()

// Filter by user
const res2 = await fetch('/api/admin/audit-logs?actor_id=user-uuid')

// Filter by action
const res3 = await fetch('/api/admin/audit-logs?action=login')
```

---

## 📈 Performance Tips

### 1. Index Usage
The migrations include indexes on:
- `otp_codes(email, purpose)`
- `attendance_records(ticket_id)`
- `audit_logs(actor_id, action, resource_type)`

These should make queries fast. Monitor with:
```sql
EXPLAIN ANALYZE SELECT * FROM audit_logs WHERE actor_id = 'uuid';
```

### 2. Cleanup Jobs
Set up cron jobs to clean up old data:
```sql
-- Delete expired OTP codes (run daily)
DELETE FROM otp_codes WHERE expires_at < NOW();

-- Archive old audit logs (run monthly)
INSERT INTO audit_logs_archive SELECT * FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete expired sessions (run daily)
DELETE FROM user_sessions WHERE expires_at < NOW();
```

### 3. Caching
Consider caching:
- Security metrics (5 minute TTL)
- User session lookups (1 minute TTL)
- Audit log counts (10 minute TTL)

---

## 🔒 Security Reminders

1. **Never expose service role key** in client-side code
2. **Validate all inputs** before database queries
3. **Rate limit** OTP endpoints (prevent abuse)
4. **Monitor audit logs** for suspicious patterns
5. **Rotate secrets** regularly

---

## 🎓 Next Steps

After verifying everything works:

1. **Enhance existing routes** (verify-otp, logout)
2. **Add UI components** for admin features
3. **Write integration tests**
4. **Deploy to staging**
5. **User acceptance testing**
6. **Production deployment**

---

## 📞 Quick Reference

### Important Files
- **OTP Logic**: `lib/auth/otp.ts`
- **Session Logic**: `lib/auth/user-session.ts`
- **Audit Logic**: `lib/audit.ts`
- **Send OTP API**: `app/api/user/auth/send-otp/route.ts`
- **Check-in API**: `app/api/admin/attendance/check-in/route.ts`

### Database Tables
- **otp_codes**: OTP storage
- **user_sessions**: Session management
- **attendance_records**: Check-in tracking
- **audit_logs**: Security events
- **enterprise_accounts**: Corporate clients

### Key Functions
```typescript
// Send OTP
createAndSendOTP(email, purpose)

// Verify OTP
verifyOTP(email, code, purpose)

// Create session
createUserSession(userId, metadata)

// Get current user
getCurrentUser()

// Log audit event
createAuditLog({ actor_id, action, resource_type })
```

---

## ✅ You're Ready!

If all tests pass, you've successfully implemented the reserve branch features! 🎉

**Questions?** Check:
- [Full Implementation Guide](RESERVE_BRANCH_IMPLEMENTATION_COMPLETE.md)
- [Consolidated Porting Guide](RESERVE_TO_MAIN_CONSOLIDATED_PORTING_GUIDE.md)
- [Migration Documentation](docs/migration/MIGRATION_GUIDE.md)

