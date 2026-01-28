# Form Security Implementation Guide

## Overview

This document describes the comprehensive security measures implemented to protect all forms in the SynergyCon website against CSRF attacks and automated bot submissions.

## Security Features

### 1. CSRF (Cross-Site Request Forgery) Protection

**Purpose**: Prevents malicious websites from submitting requests on behalf of authenticated users.

**Implementation**:
- **Token Generation**: Cryptographically secure random tokens (64 hex characters)
- **Storage**: HTTP-only cookies with strict SameSite policy
- **Validation**: Constant-time comparison to prevent timing attacks
- **Expiration**: 24-hour token lifetime

**Files**:
- `lib/csrf.ts` - Core CSRF utilities
- `app/api/csrf/route.ts` - Token generation endpoint

### 2. Honeypot Bot Protection

**Purpose**: Catches automated bots by including hidden fields that humans won't see or fill.

**Implementation**:
- **Three-Layer Approach**:
  1. `website_url` - Hidden with `display: none`
  2. `company_name` - Positioned off-screen
  3. `business_address` - Zero opacity overlay
  
- **Field Attributes**:
  - `aria-hidden="true"` - Hidden from screen readers
  - `tabIndex={-1}` - Excluded from tab navigation
  - `autoComplete="off"` - Prevents browser autofill

**Files**:
- `lib/honeypot.ts` - Honeypot validation utilities
- `components/ui/honeypot-fields.tsx` - React component

### 3. Time-Based Validation

**Purpose**: Detects bots that submit forms too quickly (< 3 seconds).

**Implementation**:
- Form start time captured on component mount
- Validated against submission time on server
- Minimum fill time: 3000ms

## Usage

### For Client-Side Forms

```tsx
import { useFormSecurity } from '@/hooks/use-form-security'
import { HoneypotFields } from '@/components/ui/honeypot-fields'

function MyForm() {
  const { csrfToken, honeypotFields, updateHoneypot, formStartTime } = useFormSecurity()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const response = await fetch('/api/my-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Your form data
        email: formData.email,
        name: formData.name,
        // Security fields
        _csrf: csrfToken,
        _formStartTime: formStartTime,
        ...honeypotFields,
      }),
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Add honeypot fields */}
      <HoneypotFields values={honeypotFields} onChange={updateHoneypot} />
      
      {/* Your regular form fields */}
      <input type="email" name="email" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### For API Routes

**Method 1: Manual Validation**

```typescript
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate security
    const securityError = await validateRequestSecurity(body)
    if (securityError) return securityError
    
    // Clean security fields
    const cleanData = cleanSecurityFields(body)
    
    // Process request with cleanData
    // ...
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
```

**Method 2: Using Secure Wrapper**

```typescript
import { securePost } from '@/lib/api-security'

export const POST = securePost(async (req, body) => {
  // body is already validated and cleaned
  // Process your request
  return NextResponse.json({ success: true })
})
```

### Optional: Skip Validations

For specific routes where certain validations aren't needed:

```typescript
const securityError = await validateRequestSecurity(body, {
  skipCSRF: false,     // Keep CSRF validation
  skipHoneypot: false, // Keep honeypot validation
  skipTiming: true,    // Skip timing validation (for slow users)
})
```

## Protected Forms

### Public Forms
✅ Newsletter subscription (footer & dedicated section)
✅ Contact form (footer dialog)
✅ Registration modal
✅ Registration section
✅ Speaker application
✅ Partner application
✅ Collaboration form

### Admin Forms
✅ Admin login
✅ 2FA verification
✅ Schedule management
✅ Speaker management
✅ Sponsor management
✅ Gallery management

## API Endpoints Protected

✅ `/api/newsletter/subscribe` - Newsletter subscription
✅ `/api/admin/auth/login` - Admin authentication (can skip timing)
✅ All other form submission endpoints

## Security Benefits

1. **CSRF Protection**
   - Prevents cross-site request forgery attacks
   - Validates that requests originate from your application
   - HTTP-only cookies prevent XSS token theft

2. **Bot Prevention**
   - Multiple honeypot fields reduce false positives
   - Time-based validation catches rapid automated submissions
   - Semantic HTML attributes prevent accessibility tools from exposing traps

3. **User Experience**
   - No visible impact on legitimate users
   - No additional form fields to fill
   - Minimal performance overhead
   - Graceful degradation if JavaScript disabled

4. **Logging & Monitoring**
   - All security violations are logged
   - Bot attempts recorded with reason
   - Easy to audit and improve detection

## Testing

### Testing CSRF Protection

```bash
# Should fail without CSRF token
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Should succeed with valid token
# (Token must be obtained from /api/csrf first)
```

### Testing Honeypot

```bash
# Should fail when honeypot field is filled
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "_csrf":"valid-token",
    "website_url":"https://bot-site.com"
  }'
```

### Testing Timing

```bash
# Should fail when submitted too quickly
# (Set _formStartTime to current timestamp)
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "_csrf":"valid-token",
    "_formStartTime":'$(date +%s)000'
  }'
```

## Maintenance

### Adjusting Time Threshold

Edit `lib/honeypot.ts`:
```typescript
const MIN_FORM_FILL_TIME = 3000 // Adjust as needed (milliseconds)
```

### Adding New Honeypot Fields

Edit `lib/honeypot.ts`:
```typescript
export const HONEYPOT_FIELDS = {
  website: 'website_url',
  company: 'company_name',
  address: 'business_address',
  newField: 'new_field_name', // Add new field
} as const
```

### Customizing CSRF Token

Edit `lib/csrf.ts`:
```typescript
const CSRF_TOKEN_LENGTH = 32 // Adjust token length
```

## Best Practices

1. **Always use `useFormSecurity` hook** for new forms
2. **Include `HoneypotFields` component** in every form
3. **Validate on server-side** using `validateRequestSecurity`
4. **Log security violations** for monitoring
5. **Clean security fields** before database insertion
6. **Don't store security fields** in database
7. **Test forms** after implementation
8. **Monitor logs** for suspicious patterns

## Troubleshooting

### Issue: "Invalid security token"
**Cause**: CSRF token expired or missing
**Solution**: Ensure `useFormSecurity` hook is used and token is included in submission

### Issue: "Invalid submission" (honeypot)
**Cause**: Honeypot field was filled or form submitted too quickly
**Solution**: Check that fields are properly hidden and form timing is reasonable

### Issue: Forms not submitting
**Cause**: Client-side JavaScript disabled
**Solution**: Consider server-side fallback for critical forms

### Issue: False positives
**Cause**: Legitimate users filling forms very quickly
**Solution**: Adjust `MIN_FORM_FILL_TIME` or skip timing validation for specific forms

## Security Audit Checklist

- [ ] All public forms use `useFormSecurity` hook
- [ ] All forms include `HoneypotFields` component
- [ ] All API endpoints validate security
- [ ] CSRF tokens are HTTP-only cookies
- [ ] Honeypot fields are properly hidden
- [ ] Security violations are logged
- [ ] No security fields stored in database
- [ ] Production uses HTTPS for secure cookies
- [ ] Time threshold is reasonable for UX
- [ ] Tests cover security scenarios

## Future Enhancements

1. **Rate Limiting**: Add IP-based rate limiting for endpoints
2. **CAPTCHA Integration**: Add reCAPTCHA for high-risk forms
3. **Anomaly Detection**: ML-based bot detection patterns
4. **Fingerprinting**: Browser fingerprinting for additional validation
5. **Metrics Dashboard**: Real-time security metrics and alerts

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Bot Detection Best Practices](https://www.cloudflare.com/learning/bots/how-to-detect-bots/)
- [Web Security Guidelines](https://developer.mozilla.org/en-US/docs/Web/Security)

---

**Last Updated**: December 29, 2025  
**Maintained By**: Development Team  
**Version**: 1.0.0
