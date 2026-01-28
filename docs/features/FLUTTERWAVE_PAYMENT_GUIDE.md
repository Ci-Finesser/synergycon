# Flutterwave Payment Gateway Integration Guide

## Overview

This guide covers the complete Flutterwave payment integration for SynergyCon 2.0 registration checkout. The implementation is robust, secure, and scalable, following Next.js 16 and React 19 best practices.

## Features

✅ **Secure Payment Processing**
- CSRF token validation
- Rate limiting
- Honeypot bot detection
- Webhook signature verification
- Server-side payment verification

✅ **Robust Error Handling**
- Timeout protection (10s for initialization/verification)
- Detailed error messages
- Automatic retry mechanisms
- Payment status tracking

✅ **Scalable Architecture**
- Modular design with separation of concerns
- TypeScript type safety throughout
- Database integration for payment records
- Webhook support for async updates

✅ **User Experience**
- Real-time payment status updates
- Modal-based payment flow
- Payment callback handling
- Success/failure notifications

## Architecture

### File Structure

```
lib/flutterwave/
├── types.ts          # TypeScript interfaces and types
├── config.ts         # Configuration and environment variables
└── client.ts         # Server-side payment utilities

app/api/payments/
├── initialize/route.ts   # Payment initialization endpoint
├── verify/route.ts       # Payment verification endpoint
└── webhook/route.ts      # Webhook handler endpoint

app/register/
├── page.tsx              # Main registration page (updated)
└── payment/
    └── callback/
        └── page.tsx      # Payment callback handler

hooks/
└── use-flutterwave-payment.tsx  # React hook for payments

components/
└── payment-modal.tsx     # Payment status modal
```

## Setup Instructions

### 1. Get Flutterwave API Credentials

1. Sign up at [Flutterwave Dashboard](https://dashboard.flutterwave.com/)
2. Navigate to **Settings > API**
3. Copy your:
   - Public Key (test/production)
   - Secret Key (test/production)
   - Encryption Key (optional)

### 2. Configure Webhook

1. In Flutterwave Dashboard, go to **Settings > Webhooks**
2. Set webhook URL to: `https://yourdomain.com/api/payments/webhook`
3. Generate a webhook secret hash
4. Save the configuration

### 3. Update Environment Variables

Add to `.env.local`:

```bash
# Flutterwave Configuration
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxxxxxxxxx
FLUTTERWAVE_WEBHOOK_SECRET_HASH=your_webhook_secret_hash
```

**Security Notes:**
- Never commit `.env.local` to git
- Use test keys in development
- Rotate keys if exposed
- Store production keys in secure environment variable management (Vercel, AWS Secrets Manager, etc.)

### 4. Create Database Tables

Run this migration to create the `payments` table:

```sql
-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  tx_ref TEXT NOT NULL UNIQUE,
  flw_ref TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL CHECK (status IN ('pending', 'successful', 'failed', 'cancelled')),
  payment_type TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_tx_ref ON payments(tx_ref);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_customer_email ON payments(customer_email);

-- Add payment fields to ticket_orders table
ALTER TABLE ticket_orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE ticket_orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
```

Save as `supabase/migrations/YYYYMMDDHHMMSS_add_flutterwave_payments.sql` and run:

```bash
pnpm migrate
```

### 5. Install Dependencies (if needed)

No additional dependencies required! Uses built-in Node.js crypto and Next.js fetch.

## Usage

### Basic Payment Flow

The payment flow is automatically integrated into the registration page:

1. **User fills registration form** (Steps 1-2)
2. **User proceeds to payment** (Step 3)
3. **Click "Complete Purchase"**:
   - Order created in database (status: pending)
   - Payment initialized with Flutterwave
   - Payment modal opens
   - User redirected to Flutterwave payment page
4. **User completes payment** on Flutterwave
5. **Flutterwave redirects back** to `/register/payment/callback`
6. **Payment verified** automatically
7. **Order status updated** to confirmed
8. **Success page displayed** (Step 4)

### Manual Payment Initialization (Advanced)

```typescript
import { useFlutterwavePayment } from '@/hooks/use-flutterwave-payment'

function MyComponent() {
  const { initializePayment, verifyPayment } = useFlutterwavePayment()

  const handlePay = async () => {
    const result = await initializePayment({
      orderId: 'SYN2-12345',
      amount: 50000,
      customer: {
        email: 'user@example.com',
        name: 'John Doe',
        phone: '+2348012345678',
      },
      meta: {
        order_id: 'SYN2-12345',
        ticket_type: 'VIP',
        ticket_quantity: 1,
      },
    })

    if (result.success) {
      console.log('Payment link:', result.paymentLink)
    }
  }

  return <button onClick={handlePay}>Pay Now</button>
}
```

## API Endpoints

### POST /api/payments/initialize

Initialize a new payment transaction.

**Request:**
```json
{
  "orderId": "SYN2-12345",
  "amount": 50000,
  "customer": {
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+2348012345678"
  },
  "meta": {
    "order_id": "SYN2-12345",
    "ticket_type": "VIP",
    "ticket_quantity": 1
  },
  "_csrf": "csrf_token",
  "_formStartTime": 1234567890
}
```

**Response:**
```json
{
  "success": true,
  "payment_link": "https://checkout.flutterwave.com/...",
  "tx_ref": "SYN2-12345-1234567890-ABC123"
}
```

### POST /api/payments/verify

Verify a payment transaction.

**Request:**
```json
{
  "transactionId": "123456",
  "txRef": "SYN2-12345-1234567890-ABC123",
  "_csrf": "csrf_token"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "status": "successful",
  "amount": 50000,
  "currency": "NGN",
  "order_id": "SYN2-12345"
}
```

### GET /api/payments/verify?tx_ref=xxx

Check payment status.

**Response:**
```json
{
  "success": true,
  "payment": {
    "tx_ref": "SYN2-12345-1234567890-ABC123",
    "order_id": "SYN2-12345",
    "status": "successful",
    "amount": 50000,
    "currency": "NGN",
    "created_at": "2026-01-02T...",
    "verified_at": "2026-01-02T..."
  }
}
```

### POST /api/payments/webhook

Webhook endpoint for Flutterwave notifications.

**Headers:**
```
verif-hash: webhook_signature
```

**Payload:**
```json
{
  "event": "charge.completed",
  "data": {
    "id": 123456,
    "tx_ref": "SYN2-12345-1234567890-ABC123",
    "flw_ref": "FLW_REF_123",
    "amount": 50000,
    "currency": "NGN",
    "status": "successful",
    "customer": {
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

## Security Features

### 1. CSRF Protection
All payment API endpoints validate CSRF tokens to prevent cross-site request forgery attacks.

### 2. Rate Limiting
- **Initialize endpoint**: STRICT rate limit (5 requests per 5 minutes per IP)
- **Verify endpoint**: STANDARD rate limit (20 requests per minute per IP)

### 3. Webhook Signature Verification
All webhook payloads are verified using HMAC-SHA256 signature validation.

### 4. Honeypot & Bot Detection
Payment initialization includes honeypot validation to detect automated submissions.

### 5. Timeout Protection
All API calls have 10-second timeouts to prevent hanging requests.

### 6. Server-Side Verification
Payment verification always happens server-side, never trusting client-side data.

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Payment service configuration error" | Missing API keys | Add keys to `.env.local` |
| "Invalid security token" | CSRF validation failed | Refresh page and try again |
| "Rate limit exceeded" | Too many requests | Wait before retrying |
| "Payment verification failed" | Transaction not found | Check transaction ID |
| "Webhook signature invalid" | Wrong webhook secret | Update webhook secret |

### Error Recovery

The payment flow includes automatic retry mechanisms:
- Failed initialization can be retried via modal
- Payment status can be re-checked
- Webhook failures are logged for manual review

## Testing

### Test Mode

Flutterwave provides test cards for development:

**Test Card Details:**
- Card Number: `5531886652142950`
- CVV: `564`
- Expiry: Any future date
- PIN: `3310`
- OTP: `12345`

### Test Webhook

Use ngrok or similar tool to test webhooks locally:

```bash
# Start ngrok
ngrok http 3000

# Update webhook URL in Flutterwave to:
# https://your-ngrok-url.ngrok.io/api/payments/webhook
```

### Test Flow

1. Fill registration form with test data
2. Use test amount (e.g., ₦100)
3. Complete payment with test card
4. Verify order status changes to "confirmed"
5. Check payments table for record

## Monitoring & Logging

### Security Events
All payment-related security events are logged via `lib/security-logger.ts`:
- Payment initialization
- Payment verification
- Webhook processing
- Security violations

### Payment Status Tracking
Monitor payment status in database:

```sql
-- Check payment statistics
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM payments
GROUP BY status;

-- Recent failed payments
SELECT * FROM payments
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

## Production Checklist

- [ ] Replace test API keys with production keys
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Configure production webhook URL in Flutterwave
- [ ] Test payment flow end-to-end
- [ ] Set up payment monitoring alerts
- [ ] Enable automatic email receipts
- [ ] Test webhook delivery
- [ ] Review rate limit settings
- [ ] Set up backup payment verification cron job
- [ ] Document refund procedures

## Troubleshooting

### Payment Not Verifying

1. Check payment record in database
2. Verify webhook is configured correctly
3. Check Flutterwave dashboard for transaction status
4. Review server logs for errors
5. Manually verify via Flutterwave API

### Webhook Not Received

1. Verify webhook URL is publicly accessible
2. Check Flutterwave webhook logs
3. Ensure webhook secret hash is correct
4. Check server logs for rejected webhooks

### Payment Link Not Opening

1. Check browser popup blocker
2. Verify payment initialization succeeded
3. Check console for errors
4. Ensure public key is correct

## Support

- **Flutterwave Docs**: https://developer.flutterwave.com/docs
- **Flutterwave Support**: support@flutterwave.com
- **Dashboard**: https://dashboard.flutterwave.com

## Changelog

### v1.0.0 (2026-01-02)
- Initial Flutterwave integration
- Payment initialization, verification, and webhook handling
- Complete security implementation
- Database schema and migrations
- Comprehensive documentation
