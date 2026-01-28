# Admin Session Management - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Admin User Interface                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  Admin Login     │         │  Sessions Page   │             │
│  │  /admin/login    │         │  /admin/sessions │             │
│  └────────┬─────────┘         └────────┬─────────┘             │
│           │                           │                         │
│           │ (email/password)         │ (view sessions)         │
│           └───────────┬───────────────┘                         │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Endpoints                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POST /api/admin/auth/login                                    │
│  ├─ Validates credentials                                      │
│  └─ Creates session (createSession)                            │
│                                                                 │
│  GET /api/admin/sessions                                       │
│  ├─ Validates current session                                  │
│  └─ Returns all active sessions                                │
│                                                                 │
│  DELETE /api/admin/sessions                                    │
│  ├─ Actions: revoke, revoke_all, logout                       │
│  └─ Updates or deletes sessions                               │
│                                                                 │
│  POST /api/admin/sessions                                      │
│  ├─ Action: refresh                                            │
│  └─ Updates last_activity                                      │
│                                                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                Session Manager Core                             │
├─────────────────────────────────────────────────────────────────┤
│  lib/session-tracker.ts                                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Session Functions                                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • generateSessionToken()    - Create 32-byte token      │  │
│  │ • parseUserAgent()          - Extract device info       │  │
│  │ • getClientIP()             - Get request IP            │  │
│  │ • getLocationFromIP()       - Optional geolocation      │  │
│  │ • createSession()           - Insert new session        │  │
│  │ • validateSession()         - Check & update activity   │  │
│  │ • getActiveSessions()       - List all sessions         │  │
│  │ • revokeSession()           - Delete session            │  │
│  │ • revokeAllOtherSessions() - Batch revoke             │  │
│  │ • logout()                  - End current session       │  │
│  │ • cleanupExpiredSessions()  - Remove old sessions      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Client-Side Storage & Cookies                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HTTP-Only Cookie: admin_session_token                         │
│  ├─ Name: admin_session_token                                 │
│  ├─ Value: <32-byte hex token>                               │
│  ├─ HttpOnly: YES (JS cannot access)                          │
│  ├─ Secure: YES (HTTPS only in production)                    │
│  ├─ SameSite: lax (CSRF protection)                          │
│  └─ Max-Age: 604800 (7 days)                                  │
│                                                                 │
│  Legacy Cookie: admin_session (for backward compatibility)    │
│  ├─ Value: JSON with admin info                               │
│  └─ HttpOnly: YES                                             │
│                                                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Database Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL                                            │
│                                                                 │
│  Table: admin_sessions                                         │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Column              │ Type       │ Purpose                 ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ id                  │ UUID       │ Primary key             ││
│  │ admin_id            │ UUID       │ FK to admins            ││
│  │ session_token       │ TEXT       │ Session identifier      ││
│  │ device_name         │ TEXT       │ Human-readable device   ││
│  │ device_type         │ TEXT       │ desktop|mobile|tablet   ││
│  │ browser             │ TEXT       │ Chrome|Firefox|Safari   ││
│  │ os                  │ TEXT       │ Windows|macOS|Linux etc ││
│  │ ip_address          │ TEXT       │ Client IP               ││
│  │ user_agent          │ TEXT       │ Full browser string     ││
│  │ location_city       │ TEXT       │ Optional location       ││
│  │ location_country    │ TEXT       │ Optional country        ││
│  │ is_current          │ BOOLEAN    │ Computed (not stored)   ││
│  │ login_time          │ TIMESTAMPTZ│ Session creation        ││
│  │ last_activity       │ TIMESTAMPTZ│ Last request timestamp  ││
│  │ expires_at          │ TIMESTAMPTZ│ Session expiration      ││
│  │ created_at          │ TIMESTAMPTZ│ Record creation         ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Indexes:                                                      │
│  • idx_admin_sessions_admin_id (for user sessions)            │
│  • idx_admin_sessions_session_token (for validation)          │
│  • idx_admin_sessions_expires_at (for cleanup)                │
│  • idx_admin_sessions_last_activity (for monitoring)          │
│                                                                 │
│  Row Level Security (RLS):                                     │
│  • SELECT: User can view own sessions                          │
│  • DELETE: User can delete own sessions                        │
│  • INSERT: System can create sessions (service role)           │
│  • UPDATE: User or system can update sessions                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────────────┐
│   Admin Login   │
│  /admin/login   │
└────────┬────────┘
         │
         │ 1. POST email/password
         ▼
┌─────────────────────────────────┐
│ POST /api/admin/auth/login      │
├─────────────────────────────────┤
│ • Validate CSRF & honeypot      │
│ • Check rate limits             │
│ • Verify credentials            │
└────────┬────────────────────────┘
         │
         │ 2. If valid
         ▼
┌─────────────────────────────────┐
│   createSession(adminId)        │
├─────────────────────────────────┤
│ • Generate 32-byte token        │
│ • Parse user agent              │
│ • Get client IP                 │
│ • Get location (optional)       │
│ • Set expiration (7 days)       │
│ • Insert into database          │
│ • Set HTTP-only cookie          │
└────────┬────────────────────────┘
         │
         │ 3. Session created
         ▼
┌─────────────────────────────────┐
│ Return 200 OK                   │
│ + admin_session_token cookie    │
│ + session_id in response        │
└─────────────────────────────────┘
```

## Session Validation Flow

```
┌──────────────────────┐
│   Admin Makes       │
│   API Request       │
└──────────┬───────────┘
           │
           │ Request includes:
           │ • Cookies (admin_session_token)
           │ • Request headers (User-Agent, IP)
           ▼
┌──────────────────────────────────┐
│ validateSession(token?)          │
├──────────────────────────────────┤
│ • Get token from param or cookie │
│ • Query sessions table           │
│ • Check if expired               │
│ • If valid:                      │
│   ├─ Update last_activity        │
│   └─ Return session info         │
│ • If invalid/expired:            │
│   └─ Return null                 │
└──────────┬───────────────────────┘
           │
     ┌─────┴─────┐
     │           │
   Valid       Invalid
     │           │
     ▼           ▼
 Continue   Redirect to
 Request    Login Page
     │
     └──► Update last_activity
          every request
```

## Session Revocation Flow

```
┌─────────────────────────┐
│  Admin UI Action        │
│  Click "Revoke" Button  │
└────────┬────────────────┘
         │
         │ DELETE /api/admin/sessions
         │ {action: "revoke", session_id: "xyz"}
         ▼
┌──────────────────────────────┐
│ Session Revocation Handler   │
├──────────────────────────────┤
│ • Validate current session   │
│ • Verify ownership           │
│ • Check not current session  │
│ • Delete from database       │
└────────┬─────────────────────┘
         │
         │ Session deleted
         ▼
┌──────────────────────────────┐
│ Target Device Behavior:      │
├──────────────────────────────┤
│ • Next request with token    │
│ • validateSession() fails    │
│ • Redirects to /admin/login  │
│ • User must re-authenticate  │
└──────────────────────────────┘
```

## Device Fingerprinting Flow

```
┌──────────────────────┐
│ Browser User Agent   │
│ (from request)       │
└────────┬─────────────┘
         │
         │ Example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)
         │          AppleWebKit/537.36 (KHTML, like Gecko)
         │          Chrome/121.0.0.0 Safari/537.36"
         ▼
┌──────────────────────────────────┐
│ parseUserAgent(ua)               │
├──────────────────────────────────┤
│ Device Type Detection            │
│ ├─ /mobile/i       → "mobile"    │
│ ├─ /tablet|ipad/i  → "tablet"    │
│ └─ else            → "desktop"   │
│                                  │
│ Browser Detection                │
│ ├─ /edg/i          → "Edge"      │
│ ├─ /chrome/i       → "Chrome"    │
│ ├─ /firefox/i      → "Firefox"   │
│ ├─ /safari/i       → "Safari"    │
│ └─ /opr|opera/i    → "Opera"     │
│                                  │
│ OS Detection                     │
│ ├─ /windows/i      → "Windows"   │
│ ├─ /mac os|macos/i → "macOS"     │
│ ├─ /linux/i        → "Linux"     │
│ ├─ /android/i      → "Android"   │
│ └─ /iphone|ipad/i  → "iOS"       │
│                                  │
│ Result: device_name             │
│ "Chrome on Windows"             │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Stored in Database               │
│ ├─ device_name: "Chrome on W.."  │
│ ├─ device_type: "desktop"        │
│ ├─ browser: "Chrome"             │
│ ├─ os: "Windows"                 │
│ └─ user_agent: full string       │
└──────────────────────────────────┘
```

## Component Hierarchy

```
/admin/sessions (Page)
│
├─ AdminNavigation
│  ├─ "Sessions" Link
│  ├─ "Settings" Link
│  └─ "Logout" Button
│
└─ ActiveSessions Component (Client)
   │
   ├─ Summary Stats Cards
   │  ├─ Total Sessions
   │  ├─ Active Devices
   │  └─ Other Sessions
   │
   ├─ Current Session Card (Green Badge)
   │  ├─ Device Icon + Name
   │  ├─ Last Activity
   │  ├─ Login Time
   │  ├─ IP Address
   │  ├─ Location
   │  └─ Browser/OS Info
   │
   ├─ Other Sessions Cards
   │  ├─ Device Icon + Name
   │  ├─ Last Activity
   │  ├─ Login Time
   │  ├─ IP Address
   │  └─ "Revoke" Button
   │
   ├─ Action Buttons
   │  ├─ "Refresh"
   │  └─ "Log Out All Others"
   │
   └─ Empty State (No Sessions)
```

## Data Flow Diagram

```
User Login                Server              Database            UI
────────────────────────────────────────────────────────────────────

   │
   ├──POST /api/admin/auth/login───┐
   │  (email, password)             │
   │                                ├──createSession()──┐
   │                                │  • Generate token │
   │                                │  • Parse UA       │
   │                                │  • Get IP         │
   │                                │                   ├──INSERT──┐
   │                                │                   │          │
   │                                │                   │    admin_sessions
   │                                │◄──────────────────┤          │
   │                                │  session_id       │          │
   │                                │                   └──────────┘
   │◄───────────────────────────────┤
   │  200 OK + cookie               │
   │  + session_id                  │
   │
   │
   ├──GET /admin/sessions────────────┐
   │                                 ├──validateSession()──┐
   │                                 │  • Check token      │
   │                                 │  • Check expires    │
   │                                 │                     ├──UPDATE──┐
   │                                 │                     │          │
   │                                 │                     │ last_activity
   │                                 │◄────────────────────┤          │
   │                                 │  session info       │          │
   │                                 │                     └──────────┘
   │                                 │
   │                                 ├──getActiveSessions()──┐
   │                                 │                       ├──SELECT──┐
   │                                 │                       │          │
   │                                 │                       │ all sessions
   │                                 │                       │ for admin
   │                                 │◄──────────────────────┤          │
   │                                 │  sessions[]          │          │
   │                                 │                       └──────────┘
   │◄───────────────────────────────┤
   │  JSON: sessions[]               │
   │
   │
   │  [Render Sessions UI]──────────────────────────────────┐
   │  ├─ Current session card (green)                      │
   │  ├─ Other sessions list                              │
   │  └─ Revoke buttons                                   │
   │
   │
   ├──DELETE /api/admin/sessions────┐
   │  (action: "revoke",            │
   │   session_id: "xyz")           ├──revokeSession()─────┐
   │                                │                      ├──DELETE──┐
   │                                │                      │          │
   │                                │                      │ by id
   │                                │◄─────────────────────┤          │
   │                                │  success             │          │
   │                                │                      └──────────┘
   │◄───────────────────────────────┤
   │  200 OK                        │
   │  "Session revoked"             │
   │
   │ [Refresh sessions list]
   │
   └─ Device logged out
      (next request fails)
```

## Security Model

```
┌─────────────────────────────────────────────────────┐
│                 Security Layers                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Layer 1: Transport Security                        │
│ ├─ HTTPS (enforced in production)                  │
│ ├─ TLS 1.2+ (modern cipher suites)                 │
│ └─ Certificate validation                          │
│                                                     │
│ Layer 2: Cookie Security                           │
│ ├─ HttpOnly flag (prevent XSS access)              │
│ ├─ Secure flag (HTTPS only)                        │
│ ├─ SameSite=lax (CSRF protection)                  │
│ └─ Unpredictable token (32 bytes)                  │
│                                                     │
│ Layer 3: Session Validation                        │
│ ├─ Token format validation                         │
│ ├─ Expiration checking                             │
│ ├─ Admin ownership verification                    │
│ └─ Database query with indexes                     │
│                                                     │
│ Layer 4: Attack Prevention                         │
│ ├─ CSRF tokens (from earlier implementation)       │
│ ├─ Honeypot validation (from earlier)              │
│ ├─ Rate limiting (from earlier)                    │
│ ├─ 2FA requirement (existing)                      │
│ └─ Password hashing (existing)                     │
│                                                     │
│ Layer 5: Database Security                         │
│ ├─ Row Level Security (RLS) policies               │
│ ├─ Encrypted connections                           │
│ ├─ Automatic backups                               │
│ └─ Audit logging (optional)                        │
│                                                     │
│ Layer 6: Monitoring & Response                     │
│ ├─ Session activity logging                        │
│ ├─ Anomaly detection (can add)                     │
│ ├─ Real-time revocation                            │
│ └─ Admin notifications (can add)                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│           Production Environment                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐           ┌──────────────┐        │
│  │   Client     │ HTTPS     │    Next.js   │        │
│  │   Browser    │◄─────────►│    Server    │        │
│  │              │           │              │        │
│  │ ✓ HttpOnly   │           │ ✓ Validate   │        │
│  │   Cookies    │           │   Session    │        │
│  │              │           │ ✓ Parse UA   │        │
│  └──────────────┘           │ ✓ Get IP     │        │
│                             └──────┬───────┘        │
│                                    │                │
│                    ┌───────────────┼───────────────┐│
│                    │               │               ││
│                    ▼               ▼               ▼│
│  ┌─────────────────────────────────────────────────┐│
│  │          Supabase (PostgreSQL)                  ││
│  ├─────────────────────────────────────────────────┤│
│  │                                                 ││
│  │  admin_sessions table                          ││
│  │  ├─ Encrypted at rest                          ││
│  │  ├─ RLS policies enforced                      ││
│  │  ├─ Automatic backups (daily)                  ││
│  │  ├─ Point-in-time recovery                     ││
│  │  └─ Audit logging                              ││
│  │                                                 ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
│  Optional Integrations:                             │
│  ├─ Redis (distributed sessions)                   │
│  ├─ IP Geolocation API                             │
│  ├─ Email Service (alerts)                         │
│  ├─ Monitoring (Sentry, DataDog)                   │
│  └─ Analytics (session patterns)                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

This architecture provides comprehensive session management with multiple security layers and optional enhancements for production deployments.
