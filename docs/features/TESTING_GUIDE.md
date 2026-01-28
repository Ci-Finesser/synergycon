# Form Security Testing Guide

## Automated Testing

### Test Script
Run this in your browser console on any form page:

```javascript
// Test 1: Check if CSRF token is loaded
async function testCSRFToken() {
  console.log('🔍 Testing CSRF Token...')
  try {
    const response = await fetch('/api/csrf')
    const data = await response.json()
    if (data.token) {
      console.log('✅ CSRF token received:', data.token.substring(0, 10) + '...')
      return data.token
    } else {
      console.error('❌ No CSRF token returned')
      return null
    }
  } catch (error) {
    console.error('❌ CSRF token fetch failed:', error)
    return null
  }
}

// Test 2: Check if honeypot fields exist
function testHoneypotFields() {
  console.log('\n🔍 Testing Honeypot Fields...')
  const honeypotFields = {
    website_url: document.querySelector('input[name="website_url"]'),
    company_name: document.querySelector('input[name="company_name"]'),
    business_address: document.querySelector('input[name="business_address"]')
  }
  
  let allPresent = true
  for (const [name, field] of Object.entries(honeypotFields)) {
    if (field) {
      console.log(`✅ Honeypot field '${name}' found`)
      // Check if it's properly hidden
      const isHidden = field.offsetParent === null || 
                      window.getComputedStyle(field).display === 'none' ||
                      window.getComputedStyle(field).opacity === '0'
      if (isHidden) {
        console.log(`   ✅ Field is properly hidden`)
      } else {
        console.warn(`   ⚠️ Field might be visible!`)
      }
    } else {
      console.error(`❌ Honeypot field '${name}' not found`)
      allPresent = false
    }
  }
  return allPresent
}

// Test 3: Check form submission timing
let formStartTime = Date.now()
function testFormTiming() {
  console.log('\n🔍 Testing Form Timing...')
  const elapsed = Date.now() - formStartTime
  if (elapsed >= 3000) {
    console.log(`✅ Form timing valid: ${elapsed}ms`)
    return true
  } else {
    console.warn(`⚠️ Form would be rejected for quick submission: ${elapsed}ms (min: 3000ms)`)
    return false
  }
}

// Test 4: Submit test (with honeypot filled - should fail)
async function testHoneypotTrigger(csrfToken) {
  console.log('\n🔍 Testing Honeypot Detection...')
  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        _csrf: csrfToken,
        _formStartTime: Date.now() - 5000, // Valid timing
        website_url: 'https://spam-bot.com', // This should trigger detection
        company_name: '',
        business_address: ''
      })
    })
    
    const data = await response.json()
    if (response.status === 403) {
      console.log('✅ Honeypot correctly detected bot behavior')
      return true
    } else {
      console.error('❌ Honeypot failed to detect bot:', data)
      return false
    }
  } catch (error) {
    console.error('❌ Honeypot test failed:', error)
    return false
  }
}

// Test 5: Test rate limiting
async function testRateLimit(csrfToken) {
  console.log('\n🔍 Testing Rate Limiting...')
  const results = []
  
  // Try to submit multiple times quickly
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${i}@example.com`,
          _csrf: csrfToken,
          _formStartTime: Date.now() - 5000,
          website_url: '',
          company_name: '',
          business_address: ''
        })
      })
      
      results.push({
        attempt: i + 1,
        status: response.status,
        rateLimitRemaining: response.headers.get('X-RateLimit-Remaining')
      })
      
      console.log(`Attempt ${i + 1}: Status ${response.status}, Remaining: ${response.headers.get('X-RateLimit-Remaining')}`)
      
      if (response.status === 429) {
        console.log('✅ Rate limiting is working - blocked after multiple attempts')
        return true
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error)
    }
  }
  
  console.log('⚠️ Rate limiting not triggered (might need more attempts or different IP)')
  return false
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Form Security Tests\n')
  console.log('=' .repeat(50))
  
  const csrfToken = await testCSRFToken()
  const honeypotExists = testHoneypotFields()
  const timingValid = testFormTiming()
  
  if (csrfToken && honeypotExists) {
    await testHoneypotTrigger(csrfToken)
    // Note: Rate limit test will actually submit, so be careful
    // await testRateLimit(csrfToken)
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ Security tests completed!')
  console.log('\nNote: Rate limit test is commented out to avoid actual submissions.')
  console.log('Uncomment in the code if you want to test rate limiting.')
}

// Run tests
runAllTests()
```

## Manual Testing Checklist

### For Each Form:

#### Visual Inspection
- [ ] Form loads without errors
- [ ] All visible fields are displayed correctly
- [ ] No honeypot fields are visible to users
- [ ] Form styling is intact

#### Functionality Tests
- [ ] Form submits successfully with valid data
- [ ] Success message/redirect works
- [ ] Error messages display for invalid data
- [ ] Loading states work during submission

#### Security Tests
- [ ] Rapid submission (< 3 seconds) is blocked
- [ ] Invalid CSRF token is rejected
- [ ] Filled honeypot field is rejected
- [ ] Rate limit triggers after multiple submissions
- [ ] Security errors show generic messages (not revealing internals)

### Forms to Test:

#### Public Forms
- [ ] Newsletter (footer)
- [ ] Newsletter (section)
- [ ] Contact form (footer dialog)
- [ ] Registration modal
- [ ] Registration section
- [ ] Speaker application
- [ ] Partner application
- [ ] Collaboration form

#### Admin Forms
- [ ] Admin login
- [ ] 2FA verification
- [ ] Schedule creation
- [ ] Speaker management
- [ ] Sponsor management
- [ ] Gallery management

## Testing Commands

### 1. Valid Submission Test
```bash
# Get CSRF token
TOKEN=$(curl -s http://localhost:3000/api/csrf | jq -r '.token')

# Test valid submission
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"_csrf\": \"$TOKEN\",
    \"_formStartTime\": $(($(date +%s) * 1000 - 5000)),
    \"website_url\": \"\",
    \"company_name\": \"\",
    \"business_address\": \"\"
  }"
```

### 2. Invalid CSRF Test (Should Fail)
```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "_csrf": "invalid_token",
    "_formStartTime": '$(( $(date +%s) * 1000 - 5000 ))',
    "website_url": "",
    "company_name": "",
    "business_address": ""
  }'
```

### 3. Honeypot Test (Should Fail)
```bash
TOKEN=$(curl -s http://localhost:3000/api/csrf | jq -r '.token')

curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"_csrf\": \"$TOKEN\",
    \"_formStartTime\": $(($(date +%s) * 1000 - 5000)),
    \"website_url\": \"https://spam.com\",
    \"company_name\": \"\",
    \"business_address\": \"\"
  }"
```

### 4. Timing Test (Should Fail)
```bash
TOKEN=$(curl -s http://localhost:3000/api/csrf | jq -r '.token')

curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"_csrf\": \"$TOKEN\",
    \"_formStartTime\": $(date +%s)000,
    \"website_url\": \"\",
    \"company_name\": \"\",
    \"business_address\": \"\"
  }"
```

### 5. Rate Limit Test (Should Fail After Multiple Attempts)
```bash
TOKEN=$(curl -s http://localhost:3000/api/csrf | jq -r '.token')

# First request - should succeed
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test1@example.com\",
    \"_csrf\": \"$TOKEN\",
    \"_formStartTime\": $(($(date +%s) * 1000 - 5000)),
    \"website_url\": \"\",
    \"company_name\": \"\",
    \"business_address\": \"\"
  }"

# Second request immediately - should be rate limited
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test2@example.com\",
    \"_csrf\": \"$TOKEN\",
    \"_formStartTime\": $(($(date +%s) * 1000 - 5000)),
    \"website_url\": \"\",
    \"company_name\": \"\",
    \"business_address\": \"\"
  }"
```

## Expected Responses

### Successful Submission
```json
{
  "success": true,
  "message": "Successfully subscribed!"
}
```

### Invalid CSRF Token
```json
{
  "error": "Invalid security token"
}
```

### Honeypot Triggered
```json
{
  "error": "Invalid submission"
}
```

### Too Quick Submission
```json
{
  "error": "Invalid submission"
}
```

### Rate Limited
```json
{
  "error": "You have already subscribed recently. Please try again later.",
  "retryAfter": 3540
}
```

## Monitoring Logs

### Enable detailed logging in development:
```bash
# In your terminal while running dev server
# Watch for security violations
tail -f .next/server.log | grep -i "security\|rate"
```

### Look for these log entries:
- `[Security] Invalid CSRF token` - CSRF violation
- `[Security] Bot detected: ...` - Honeypot triggered
- `[Security] Rate limit exceeded` - Rate limit hit
- `[RateLimit] Blocked request from ...` - Detailed rate limit info

## Performance Testing

Check that security doesn't impact performance:
- [ ] Forms load within 2 seconds
- [ ] CSRF token fetched within 500ms
- [ ] Form submission completes within 3 seconds (excluding actual API processing)
- [ ] No visible lag when typing in forms
- [ ] Mobile performance is acceptable

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers (Chrome Mobile, Safari iOS)

## Production Checklist

Before deploying:
- [ ] All tests pass
- [ ] HTTPS is enabled (required for secure cookies)
- [ ] Rate limits are appropriate for production traffic
- [ ] Monitoring/logging is configured
- [ ] Error messages don't reveal internal details
- [ ] Documentation is updated

## Troubleshooting

### Forms not submitting
1. Check browser console for errors
2. Verify CSRF token is being fetched
3. Check Network tab for failed requests
4. Verify cookies are being set (Application tab)

### False positives (legitimate users blocked)
1. Adjust timing threshold in `lib/honeypot.ts`
2. Consider skipping timing for slow forms
3. Review rate limits - may be too strict

### Rate limiting not working
1. Verify you're testing from the same IP
2. Check if requests are being proxied
3. Review rate limit configuration
4. Check server logs for entries

---

**Last Updated**: December 29, 2025
