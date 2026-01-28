# SynergyCon 2.0 Auth System - Quick Reference

## Core Concepts

### SessionDTO Pattern
API responses use `SessionDTO` interface for clean state management:
```typescript
// From API endpoint
{
  user: { id, email, user_type, ... },
  profile: { full_name, avatar_url, ... },
  session_token: "token...",
  expires_at: "2024-01-30T..."
}

// Directly into store
useAuthStore().setSession(sessionDTO)
```

### Type-Safe User Access
```typescript
import { useAuthStore } from '@/lib/stores/auth-store'

const { user, profile, isAuthenticated } = useAuthStore()

// user: User | null
// profile: UserProfile | null
// isAuthenticated: boolean
```

## Common Tasks

### Protect a Component
```typescript
'use client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { redirect } from 'next/navigation'

export default function ProtectedPage() {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    redirect('/login')
  }
  
  return <div>Protected content</div>
}
```

### Check User Role
```typescript
import { isAdmin, isSpeaker, isSponsor } from '@/types/user'

const { user } = useAuthStore()

if (isAdmin(user)) {
  // Show admin features
}

if (isSpeaker(user)) {
  // Show speaker features  
}

if (isSponsor(user)) {
  // Show sponsor features
}
```

### Display User Info
```typescript
const { user, profile } = useAuthStore()

// User data
user.email                    // Email address
user.user_type               // 'individual' | 'enterprise'
new Date(user.created_at)    // Account creation date

// Profile data
profile.full_name            // Full name
profile.avatar_url           // Avatar image URL
profile.public_name          // Public-facing name
profile.organization         // Company/organization
profile.public_bio           // Public biography
```

### Handle Logout
```typescript
const { logout } = useAuthStore()

async function handleLogout() {
  try {
    await logout()  // Calls API + clears state
    router.push('/') 
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
```

### Check Session Validity
```typescript
import { useAuthStore } from '@/lib/stores/auth-store'
import { useEffect } from 'react'

export default function App() {
  const { checkSessionValidity } = useAuthStore()
  
  useEffect(() => {
    // Auto-logout if session expired
    const isValid = checkSessionValidity()
    if (!isValid) {
      router.push('/login')
    }
  }, [])
}
```

## API Integration

### Auth Endpoints
```bash
# Login - Send OTP
POST /api/user/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "_csrf": "token...",
  "_honeypot": {}
}

# Verify OTP & Create Session
POST /api/user/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "_csrf": "token..."
}

# Logout - Clear Session
POST /api/user/auth/logout
Authorization: Bearer {sessionToken}
```

### Response Format
```typescript
// Success response
{
  success: true,
  data: {
    user: { ... },
    profile: { ... },
    session_token: "...",
    expires_at: "2024-01-30T..."
  }
}

// Error response
{
  success: false,
  error: "Invalid code"
}
```

## Database Schema

### Core Tables
```sql
-- Users
id, email, user_type, email_verified, created_at, updated_at, last_login_at

-- Profiles
id, user_id, full_name, phone, avatar_url, bio,
public_name, public_title, public_company, public_bio, 
organization, role, industry

-- Sessions
id, user_id, session_token, ip_address, user_agent, expires_at

-- OTP Codes
id, email, code, purpose, attempts, expires_at, used

-- Audit Logs
id, user_id, action_category, action_description, entity_type, severity
```

## Type Definitions

### User Types
```typescript
// Union of all user types
User = Attendee | Speaker | AdminUser | Sponsor

// Individual user
interface Attendee extends User {
  user_type: 'individual'
  full_name: string
  phone: string
  organization?: string
}

// Enterprise user
interface Sponsor extends User {
  user_type: 'enterprise'
  name: string
  logo_url: string
  tier: SponsorshipTier
}
```

### Profile
```typescript
interface UserProfile {
  id: string
  user_id: string
  
  // Personal
  full_name: string
  phone?: string
  avatar_url?: string
  bio?: string
  
  // Public (on profile page)
  public_name?: string
  public_title?: string
  public_company?: string
  public_bio?: string
  public_linkedin_url?: string
  
  // Private (not shared)
  organization?: string
  role?: string
  industry?: string
  dietary_requirements?: string
}
```

### Session
```typescript
interface UserSession {
  id: string
  user_id: string
  session_token: string
  ip_address?: string
  user_agent?: string
  expires_at: Date
  created_at: Date
  last_activity_at: Date
}
```

## Security Features

### CSRF Protection
```typescript
// In forms
<input type="hidden" name="_csrf" value={csrfToken} />

// In API calls
const res = await fetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify({
    _csrf: csrfToken,
    ...data
  })
})
```

### Rate Limiting
```typescript
// Configured per endpoint
RATE_LIMITS.STRICT   // Auth endpoints (5 req/min)
RATE_LIMITS.NEWSLETTER  // Newsletter (10 req/min)
```

### Honeypot
```typescript
// Invisible honeypot field
<input 
  type="hidden" 
  name="_honeypot" 
  value=""
  tabIndex={-1}
/>
```

### Audit Logging
```typescript
// Automatically logged
- Login attempts
- OTP generation/verification
- Session creation/deletion
- Profile updates
- Admin actions
```

## Troubleshooting

### Session Expires
```typescript
// App automatically logs user out
// Force check:
const isValid = useAuthStore().checkSessionValidity()

// Or call logout:
await useAuthStore().logout()
```

### Type Errors
```typescript
// Use type guards
if (isAdmin(user)) {
  // user is safely typed as AdminUser
  user.permissions  // ✅ Available
}

// Or check user_type
if (user?.user_type === 'enterprise') {
  // It's a Sponsor
}
```

### Missing Profile Data
```typescript
// Check both user and profile
const { user, profile } = useAuthStore()

if (user && profile) {
  // Both loaded, safe to use
}
```

## File Locations

```
lib/
  stores/
    auth-store.ts          # Main auth store
  supabase/
    client.ts              # Browser client
    server.ts              # Server client

types/
  user.ts                  # All type definitions

app/
  login/page.tsx           # Login page
  dashboard/page.tsx       # User dashboard
  profile/[slug]/page.tsx  # Public profile page
  api/user/
    auth/
      login/route.ts       # POST login
      verify-otp/route.ts  # POST verify OTP
      logout/route.ts      # POST logout
    profile/
      [slug]/route.ts      # GET public profile
      qr-code/route.ts     # GET QR code

components/
  ui/
    avatar.tsx             # Avatar component
    input-otp.tsx          # OTP input
  social-login-buttons.tsx # OAuth buttons
```

## Next: Implement These Features

### Email OTP Delivery (HIGH PRIORITY)
```typescript
// Currently: OTP logged to console
// Needed: Send via Resend email service

import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'auth@synergycon.live',
  to: email,
  subject: 'Your SynergyCon Login Code',
  html: `Your verification code: ${code}`
})
```

### OAuth Providers
```typescript
// Google OAuth
POST /api/user/auth/oauth/google

// GitHub OAuth  
POST /api/user/auth/oauth/github

// Both need:
// - Provider credentials
// - Token exchange logic
// - User creation/update
// - Session creation
```

### Profile Editing
```typescript
// New component: components/profile-editor.tsx
// New API: POST /api/user/profile/update

// Allow users to edit:
// - Avatar upload
// - Full name, bio
// - Public profile fields
// - Social links
// - Organization info
```

## Environment Setup

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Optional (for later)
RESEND_API_KEY=...
GOOGLE_CLIENT_ID=...
GITHUB_CLIENT_ID=...
```

## Testing Checklist

- [ ] Login with valid email sends OTP
- [ ] OTP verification creates session
- [ ] Session token stored in HTTP-only cookie
- [ ] Dashboard accessible only when authenticated
- [ ] Profile data loads correctly
- [ ] Logout clears session from store
- [ ] Expired sessions auto-logout
- [ ] Type guards work correctly
- [ ] Public profile page is SEO-friendly
- [ ] QR code generates & downloads
