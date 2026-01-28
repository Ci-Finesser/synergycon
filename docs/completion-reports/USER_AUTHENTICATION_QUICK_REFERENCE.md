# User Authentication - Quick Reference

## 🚀 Quick Start

### For Users

1. **Login:** Navigate to `/login`
2. **Enter Email:** Receive 6-digit OTP
3. **Verify:** Enter OTP code
4. **Dashboard:** Access your profile

### For Developers

```bash
# Install dependencies
npm install qrcode @types/qrcode

# Run migration
node scripts/migrate.js

# Start dev server
npm run dev
```

---

## 📍 Key URLs

| Purpose | URL | Auth Required |
|---------|-----|---------------|
| Login | `/login` | No |
| Dashboard | `/dashboard` | Yes |
| Public Profile | `/profile/{slug}` | No |
| Logout | POST `/api/user/auth/logout` | Yes |

---

## 🔑 Authentication Flow

```
1. User enters email → POST /api/user/auth/login
2. System sends OTP (6-digit, 10 min expiry)
3. User enters OTP → POST /api/user/auth/verify-otp
4. System creates session (30 days)
5. Redirects to /dashboard
```

---

## 🎯 API Endpoints

### Login (Send OTP)
```http
POST /api/user/auth/login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify OTP
```http
POST /api/user/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "purpose": "login"
}
```

### Generate QR Code
```http
GET /api/user/profile/qr-code
Cookie: session_token={token}
```

### Get Public Profile
```http
GET /api/user/profile/{slug}
```

---

## 🗄️ Database Tables

### `user_profiles`
- **Purpose:** User profile data
- **Key Fields:** `email`, `profile_slug`, `profile_url`, `qr_code_data`
- **RLS:** Public read for public profiles, authenticated write for own profile

### `otp_verifications`
- **Purpose:** Temporary OTP storage
- **Expiry:** 10 minutes
- **Max Attempts:** 5

### `user_sessions`
- **Purpose:** Active session tracking
- **Expiry:** 30 days
- **Security:** HTTP-only cookies

---

## 🎨 Components

### Login Page
```tsx
import LoginPage from "@/app/login/page"
// Features: Email input, OTP input, resend timer
```

### Dashboard
```tsx
import DashboardPage from "@/app/dashboard/page"
// Features: Profile card, share URL, QR code generation
```

### Public Profile
```tsx
import ProfilePage from "@/app/profile/[slug]/page"
// Features: Bio, social links, contact info
```

---

## 🏪 State Management

### Auth Store
```tsx
import { useAuthStore } from "@/lib/stores/auth-store"

const { session, isAuthenticated, setSession, clearSession } = useAuthStore()

// Check if logged in
if (isAuthenticated) {
  console.log(session.email)
}

// Login
setSession({
  id: "uuid",
  email: "user@example.com",
  user_type: "attendee",
  ...
})

// Logout
clearSession()
```

---

## 🔒 Security Features

- ✅ **Passwordless:** No passwords to manage
- ✅ **OTP Expiry:** 10-minute time limit
- ✅ **Rate Limiting:** Prevents brute force
- ✅ **CSRF Protection:** All POST endpoints
- ✅ **HTTP-Only Cookies:** Session cookies not accessible via JS
- ✅ **RLS Policies:** Database-level access control
- ✅ **Session Tracking:** IP address & user agent logged

---

## 🎭 User Types

| Type | Description |
|------|-------------|
| `attendee` | Regular conference attendees |
| `speaker` | Conference speakers |
| `partner` | Sponsors and partners |
| `admin` | Administrative users |

---

## 📊 Profile Features

### Shareable Profile URL
```
https://synergycon.live/profile/john-doe
```
- Unique per user
- SEO-friendly slug
- Auto-generated from name or email

### QR Code
- 400x400px PNG
- Encodes profile URL
- Downloadable
- Stored in database

### Privacy Settings
- Public/Private toggle
- Allow messaging
- Receive notifications

---

## 🛠️ Common Tasks

### Create User Profile
```sql
INSERT INTO user_profiles (
  user_id, email, full_name, user_type, profile_slug, profile_url
) VALUES (
  'uuid',
  'user@example.com',
  'John Doe',
  'attendee',
  'john-doe',
  'https://synergycon.live/profile/john-doe'
);
```

### Generate QR Code
```tsx
const handleGenerateQR = async () => {
  const res = await fetch("/api/user/profile/qr-code")
  const data = await res.json()
  setQrCode(data.qr_code) // Base64 data URL
}
```

### Share Profile
```tsx
const handleShare = async () => {
  await navigator.share({
    title: `${name}'s Profile`,
    url: profile_url,
  })
}
```

---

## 🐛 Debugging

### Check OTP in Console (Dev Mode)
```
[Login] OTP for user@example.com: 123456
```

### Verify Session Cookie
```javascript
document.cookie // Should see session_token
```

### Test Profile Generation
```sql
SELECT generate_profile_slug('John Doe', 'john@example.com');
-- Returns: john-doe
```

---

## ⚙️ Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://synergycon.live
RESEND_API_KEY=... # For sending OTP emails
```

---

## 📈 Metrics to Track

- Total users registered
- Login success rate
- OTP verification attempts
- Profile views
- QR code scans (requires analytics)
- Session duration
- Most active user types

---

## 🚨 Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "No account found" | Email not in database | Register first |
| "Invalid or expired code" | Wrong OTP or timeout | Request new OTP |
| "Too many attempts" | 5+ failed verifications | Wait and request new OTP |
| "Unauthorized" | No session cookie | Log in again |
| "Profile not found" | Invalid slug or private profile | Check URL |

---

## 🎉 Testing Checklist

- [ ] Send OTP to email
- [ ] Verify 6-digit OTP
- [ ] Handle expired OTP
- [ ] Handle invalid OTP
- [ ] Create session after verification
- [ ] Redirect to dashboard
- [ ] Display profile information
- [ ] Generate QR code
- [ ] Download QR code
- [ ] Share profile URL
- [ ] View public profile
- [ ] Logout successfully
- [ ] Clear session on logout

---

## 🔗 Related Pages

- [Full Documentation](USER_AUTHENTICATION_COMPLETE.md)
- [Ticket Management](TICKET_MANAGEMENT_COMPLETE.md)
- [Admin Security](ADMIN_SECURITY_IMPLEMENTATION_COMPLETE.md)

---

**Status:** ✅ Ready for Production  
**Version:** 1.0  
**Last Updated:** January 3, 2026
