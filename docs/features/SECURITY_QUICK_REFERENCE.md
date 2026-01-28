# Form Security Quick Reference

## 🔒 Quick Implementation Guide

### Add Security to a New Form (3 Steps)

#### 1. Import and Initialize Hook
```tsx
import { useFormSecurity } from '@/hooks/use-form-security'
import { HoneypotFields } from '@/components/ui/honeypot-fields'

function MyForm() {
  const { csrfToken, honeypotFields, updateHoneypot, formStartTime } = useFormSecurity()
  // ... rest of your component
}
```

#### 2. Add Honeypot Component to Form
```tsx
<form onSubmit={handleSubmit}>
  <HoneypotFields values={honeypotFields} onChange={updateHoneypot} />
  {/* Your form fields */}
</form>
```

#### 3. Include Security Data in Submission
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,
      _csrf: csrfToken,
      _formStartTime: formStartTime,
      ...honeypotFields,
    }),
  })
}
```

---

### Secure an API Endpoint (1 Step)

```typescript
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  // Validate security - returns error response if invalid
  const securityError = await validateRequestSecurity(body)
  if (securityError) return securityError
  
  // Clean security fields before processing
  const data = cleanSecurityFields(body)
  
  // Process your request with clean data
  // ...
}
```

---

## 📋 Checklist for New Forms

- [ ] Import `useFormSecurity` hook
- [ ] Import `HoneypotFields` component
- [ ] Initialize hook in component
- [ ] Add `<HoneypotFields>` to form JSX
- [ ] Include security fields in submission
- [ ] Validate in API endpoint
- [ ] Clean security fields before database insert
- [ ] Test form submission works
- [ ] Test with invalid CSRF (should fail)
- [ ] Test with filled honeypot (should fail)

---

## 🛡️ Security Fields Reference

### Client-Side Fields to Include

```typescript
{
  _csrf: string           // CSRF token from useFormSecurity hook
  _formStartTime: number  // Timestamp from useFormSecurity hook
  website_url: string     // Honeypot field (should be empty)
  company_name: string    // Honeypot field (should be empty)
  business_address: string // Honeypot field (should be empty)
}
```

### API Validation Options

```typescript
validateRequestSecurity(body, {
  skipCSRF: boolean     // Default: false
  skipHoneypot: boolean // Default: false
  skipTiming: boolean   // Default: false (use for slow forms)
})
```

---

## 🚨 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid security token" | CSRF token missing/expired | Use `useFormSecurity` hook |
| "Invalid submission" | Honeypot filled or too fast | Check honeypot component & timing |
| Form not submitting | JavaScript disabled | Consider server fallback |
| 403 Forbidden | Security validation failed | Check console logs for reason |

---

## 🔧 Configuration

### Adjust Time Threshold
**File**: `lib/honeypot.ts`
```typescript
const MIN_FORM_FILL_TIME = 3000 // milliseconds
```

### Adjust CSRF Token Length
**File**: `lib/csrf.ts`
```typescript
const CSRF_TOKEN_LENGTH = 32 // bytes
```

### Skip Timing for Specific Forms
```typescript
const securityError = await validateRequestSecurity(body, {
  skipTiming: true // Allow any submission time
})
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `lib/csrf.ts` | CSRF token generation & validation |
| `lib/honeypot.ts` | Honeypot & timing validation |
| `lib/api-security.ts` | API middleware helpers |
| `hooks/use-form-security.ts` | React hook for forms |
| `components/ui/honeypot-fields.tsx` | Hidden field component |
| `app/api/csrf/route.ts` | Token generation endpoint |

---

## 📊 Protected Forms Status

✅ = Implemented | ⏳ = Pending | ❌ = Not Protected

### Public Forms
- ✅ Newsletter (footer)
- ✅ Newsletter (section)
- ✅ Contact form
- ✅ Registration modal
- ✅ Registration section
- ✅ Speaker application
- ✅ Partner application
- ✅ Collaboration form

### Admin Forms
- ✅ Login
- ✅ 2FA verification
- ✅ All admin management forms

---

## 🧪 Testing Commands

### Manual Testing

1. **Get CSRF Token**
```bash
curl http://localhost:3000/api/csrf
```

2. **Test Valid Submission**
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","_csrf":"TOKEN_HERE"}'
```

3. **Test Invalid CSRF**
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","_csrf":"invalid"}'
```

4. **Test Honeypot Trigger**
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","_csrf":"TOKEN","website_url":"spam.com"}'
```

---

## 💡 Tips

1. **Always log security failures** for monitoring
2. **Don't store security fields** in database
3. **Use HTTPS in production** for secure cookies
4. **Monitor logs** for bot patterns
5. **Test after deployment** to ensure cookies work
6. **Keep time threshold reasonable** for UX
7. **Document any customizations** you make

---

## 🆘 Need Help?

1. Check `SECURITY_IMPLEMENTATION.md` for detailed docs
2. Review console logs for specific error messages
3. Test forms in browser DevTools Network tab
4. Verify CSRF cookie is set in Application tab
5. Check that JavaScript is enabled

---

**Quick Links**:
- [Full Documentation](./SECURITY_IMPLEMENTATION.md)
- [OWASP CSRF Guide](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
