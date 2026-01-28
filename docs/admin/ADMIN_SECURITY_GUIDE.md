# Admin Security Guide

## Overview
SynergyCon website implements multiple layers of security to protect the admin interface from unauthorized access, bots, and scrapers.

## Security Layers

### 1. **Obfuscation**
- ✅ No public links to admin interface
- ✅ No discovery through sitemap or robots.txt
- ✅ Admin routes not indexed by search engines

### 2. **Authentication**
- ✅ Secure session-based authentication
- ✅ Two-Factor Authentication (2FA) required
- ✅ Session validation on every request
- ✅ Automatic session timeout

### 3. **Authorization**
- ✅ Role-based access control
- ✅ User permissions validation
- ✅ Action-level authorization checks

### 4. **Middleware Protection**
All admin routes (`/admin/*` and `/api/admin/*`) are protected by Next.js middleware that:
- Validates session cookies
- Checks 2FA verification status
- Logs security events
- Redirects unauthorized access
- Validates session structure

### 5. **Bot & Scraper Protection**

#### Security Headers
```
X-Robots-Tag: noindex, nofollow, noarchive, nosnippet
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

#### Rate Limiting
- Login attempts: 5 per 15 minutes per IP
- API calls: Configurable per endpoint
- Honeypot fields detect automated submissions
- CSRF token validation on all mutations

#### Browser Fingerprinting Detection
- User-Agent validation
- Headless browser detection
- Suspicious automation tool detection
- Known bot patterns blocked

### 6. **API Security**
Every admin API route implements:
```typescript
// Security validation
const securityError = await validateRequestSecurity(req, body, {
  rateLimit: RATE_LIMITS.STRICT,
})
if (securityError) return securityError

// Admin session verification
const adminUser = await verifyAdminSession()
if (!adminUser) {
  return createUnauthorizedResponse()
}
```

### 7. **Logging & Monitoring**
Security events are logged including:
- Unauthorized access attempts
- Invalid session attempts
- 2FA failures
- Session parse errors
- Rate limit violations

## Protected Routes

### Admin Pages
- `/admin/*` - All admin dashboard pages (requires auth + 2FA)
- `/admin/login` - Login page (public, but rate limited)
- `/admin/2fa-setup` - 2FA setup (requires initial auth)

### Admin API Routes
- `/api/admin/*` - All admin API endpoints (requires auth + 2FA)
- `/api/admin/login` - Login endpoint (public, but rate limited)
- `/api/admin/2fa` - 2FA verification endpoints

## Session Management

### Session Structure
```typescript
interface AdminUser {
  id: string
  email: string
  full_name: string
  role: string
  twoFactorVerified: boolean
  sessionId?: string
  lastActivity?: string
}
```

### Session Validation
1. Check cookie exists
2. Parse JSON (fail if invalid)
3. Verify required fields (id, email, full_name)
4. Check 2FA verification status
5. Update last activity timestamp

### Session Expiry
- Idle timeout: 30 minutes
- Maximum session: 24 hours
- Auto-logout on suspicious activity

## Best Practices

### For Developers
1. Always use `getAdminUser()` utility in server components
2. Use `verifyAdminSession()` in API routes
3. Never expose admin routes in public navigation
4. Always validate and sanitize user input
5. Use CSRF tokens for all mutations
6. Implement honeypot fields in forms

### For Administrators
1. Use strong, unique passwords
2. Enable 2FA on all accounts
3. Never share credentials
4. Review security logs regularly
5. Report suspicious activity immediately
6. Use secure networks only

## Incident Response

### If Unauthorized Access Detected
1. Review security logs at `/admin/security` (if implemented)
2. Revoke compromised sessions
3. Force password reset for affected users
4. Review and update security configurations
5. Document incident and lessons learned

### If Bot Activity Detected
1. Check rate limit logs
2. Add IP to blocklist if persistent
3. Update bot detection patterns
4. Review honeypot field effectiveness

## Testing Security

### Manual Testing
```bash
# Test unauthorized access (should redirect to login)
curl -I https://yourdomain.com/admin

# Test missing session (should return 401)
curl https://yourdomain.com/api/admin/users

# Test rate limiting (should block after limit)
for i in {1..10}; do curl -X POST https://yourdomain.com/api/admin/login; done
```

### Automated Testing
- Penetration testing recommended quarterly
- Security audit before major releases
- Vulnerability scanning on dependencies

## Security Headers Explained

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Robots-Tag` | noindex, nofollow | Prevents search engine indexing |
| `X-Frame-Options` | DENY | Prevents clickjacking attacks |
| `X-Content-Type-Options` | nosniff | Prevents MIME type sniffing |
| `Referrer-Policy` | no-referrer | Hides referrer information |
| `Permissions-Policy` | restrictive | Disables unnecessary browser features |

## Utilities Reference

### `lib/admin-auth.ts`
- `verifyAdminSession()` - Validate session, returns AdminUser or null
- `getAdminUser()` - Get user or throw error
- `createUnauthorizedResponse()` - Return 401 response
- `createForbiddenResponse()` - Return 403 response

### `lib/api-security.ts`
- `validateRequestSecurity()` - CSRF + honeypot + rate limit validation
- `cleanSecurityFields()` - Remove security fields from data

### `lib/rate-limit.ts`
- `RATE_LIMITS.STRICT` - 5 requests per 15 minutes
- `RATE_LIMITS.MODERATE` - 10 requests per 5 minutes

## Updates & Maintenance

### Regular Tasks
- [ ] Review security logs weekly
- [ ] Update dependencies monthly
- [ ] Audit user sessions monthly
- [ ] Test security measures quarterly
- [ ] Review and update this guide quarterly

### Version History
- v1.0.0 (2026-01-02) - Initial comprehensive security implementation

---

**Security Contact**: For security concerns, contact the security team immediately.
