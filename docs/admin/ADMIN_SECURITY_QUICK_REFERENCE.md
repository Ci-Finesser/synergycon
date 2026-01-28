# 🔒 Admin Security Quick Reference

## Access Control

### Public Routes (Allowed)
- `/` - Homepage
- `/speakers`, `/schedule`, `/partners`, `/gallery`
- `/register`, `/apply-speaker`, `/become-partner`

### Protected Routes (Require Auth + 2FA)
- `/admin/*` - All admin dashboard pages
- `/api/admin/*` - All admin API endpoints

### Exceptions (No Auth Required)
- `/admin/login` - Admin login page (rate-limited)
- `/admin/2fa-setup` - Two-factor setup (requires initial auth)

---

## Security Features At-a-Glance

| Feature | Status | Details |
|---------|--------|---------|
| 🔗 **Hidden Access** | ✅ Active | No public links to admin |
| 🔐 **Authentication** | ✅ Active | Session + 2FA required |
| 🤖 **Bot Detection** | ✅ Active | User-Agent + headers analyzed |
| ⏱️ **Rate Limiting** | ✅ Active | 5 attempts / 15 minutes |
| 🚫 **Robots.txt** | ✅ Active | Admin routes disallowed |
| 🛡️ **Security Headers** | ✅ Active | X-Robots-Tag, X-Frame-Options |
| 📊 **Security Logging** | ✅ Active | All events tracked |

---

## Quick Commands

### Test Admin Security
```bash
# Should redirect to login (302)
curl -I http://localhost:3000/admin

# Should return 401 Unauthorized
curl http://localhost:3000/api/admin/users

# Should show "Disallow: /admin/"
curl http://localhost:3000/robots.txt | grep admin
```

### Check Bot Detection
```bash
# Should return 403 Forbidden
curl -A "curl/7.64.1" http://localhost:3000/admin/login

# Should return 403 Forbidden
curl -A "python-requests/2.28.0" http://localhost:3000/admin
```

### Verify Security Headers
```bash
# Should show X-Robots-Tag, X-Frame-Options
curl -I http://localhost:3000/admin/login | grep -i "x-"
```

---

## Code Usage

### Server Components (Admin Pages)
```typescript
import { getAdminUser } from "@/lib/admin-auth"

export default async function AdminPage() {
  let adminUser
  try {
    adminUser = await getAdminUser()
  } catch (error) {
    redirect("/admin/login")
  }
  
  // User authenticated with 2FA ✅
  return <div>Welcome {adminUser.full_name}</div>
}
```

### API Routes (Admin Endpoints)
```typescript
import { verifyAdminSession, createUnauthorizedResponse } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const adminUser = await verifyAdminSession()
  if (!adminUser) {
    return createUnauthorizedResponse()
  }
  
  // User authenticated with 2FA ✅
  // Process request...
}
```

---

## Security Event Types

| Event | Meaning | Action |
|-------|---------|--------|
| `UNAUTHORIZED_ADMIN_ACCESS` | No session cookie | Redirect to login |
| `INVALID_SESSION_STRUCTURE` | Malformed session data | Redirect to login |
| `2FA_NOT_VERIFIED` | Missing 2FA verification | Redirect to 2FA setup |
| `SESSION_PARSE_ERROR` | Corrupted session JSON | Redirect to login |
| `BOT_DETECTION` | Bot/scraper detected | Block with 403 |
| `SUSPICIOUS_HEADERS` | Proxy/VPN detected | Block with 403 |

---

## Troubleshooting

### "Access Denied" on Admin Login
**Cause:** Bot detection triggered  
**Solution:** Use a standard browser (not curl/wget)

### Can't Access Admin After Login
**Cause:** 2FA not verified  
**Solution:** Complete 2FA setup at `/admin/2fa-setup`

### Rate Limited on Login
**Cause:** Too many failed attempts (5 in 15 min)  
**Solution:** Wait 15 minutes or contact security team

### Session Expired
**Cause:** Idle timeout (30 min) or max session (24 hrs)  
**Solution:** Log in again

---

## Files Reference

| File | Purpose |
|------|---------|
| `lib/admin-auth.ts` | Auth utility functions |
| `lib/supabase/middleware.ts` | Route protection |
| `lib/bot-detection.ts` | Bot/scraper detection |
| `public/robots.txt` | Search engine rules |
| `docs/ADMIN_SECURITY_GUIDE.md` | Full security docs |

---

## Emergency Contacts

### Security Incident
1. Check logs: Console → Filter by `[SECURITY]`
2. Review active sessions: `/admin/sessions`
3. Revoke suspicious sessions
4. Contact security team

### Lockout Recovery
1. Wait for rate limit to expire (15 min)
2. Try from different IP if urgent
3. Contact admin to whitelist IP (if available)

---

## Best Practices

✅ **DO:**
- Use strong, unique passwords
- Enable 2FA on all accounts
- Review security logs weekly
- Keep sessions short-lived
- Use secure networks only
- Report suspicious activity

❌ **DON'T:**
- Share admin credentials
- Disable 2FA
- Use admin accounts on public WiFi
- Ignore security warnings
- Bypass rate limits
- Use automated tools on admin routes

---

**Quick Links:**
- 📖 [Full Security Guide](ADMIN_SECURITY_GUIDE.md)
- 📋 [Implementation Summary](../implementation/ADMIN_SECURITY_IMPLEMENTATION_COMPLETE.md)
- 🏗️ [Architecture Blueprint](../architecture/Project_Architecture_Blueprint.md)

**Last Updated:** 2026-01-02
