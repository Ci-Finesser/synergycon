# SynergyCon 2.0 Payment Types & Integration Guide

## Overview

This document outlines the comprehensive payment type system implemented across the SynergyCon 2.0 platform. All payment-related types are centralized in `types/payment.ts` to ensure consistency and maintainability.

## Core Type Structure

### 1. Payment Configuration Types

```typescript
type PaymentProvider = 'flutterwave' | 'stripe' | 'paystack'
type PaymentCurrency = 'NGN' | 'USD' | 'GBP' | 'EUR'
type PaymentEnvironment = 'test' | 'production'
```

**Usage**: Configure payment providers and supported currencies across the platform.

### 2. Request/Response Types

#### PaymentInitRequest
Used when initiating a payment from the client:
```typescript
{
  orderId: string
  amount: number
  customer: {
    email: string
    name: string
    phone: string
  }
  meta?: PaymentMetadata
  _csrf?: string
  _formStartTime?: number
}
```

**Used in**: 
- Hook: `use-flutterwave-payment.tsx` - `initializePayment()`
- API: `app/api/payments/initialize/route.ts`

#### PaymentVerifyRequest
Used when verifying a completed payment:
```typescript
{
  transactionId: string
  txRef: string
  _csrf?: string
  _formStartTime?: number
}
```

**Used in**:
- Hook: `use-flutterwave-payment.tsx` - `verifyPayment()`
- API: `app/api/payments/verify/route.ts` (POST)

#### PaymentInitResponse
Server response for payment initialization:
```typescript
{
  success: boolean
  payment_link?: string
  tx_ref?: string
  error?: string
}
```

#### PaymentVerifyResponse
Server response for payment verification:
```typescript
{
  success: boolean
  verified: boolean
  status?: PaymentStatus
  amount?: number
  currency?: PaymentCurrency
  tx_ref?: string
  order_id?: string
  message?: string
  error?: string
}
```

### 3. Payment Status Types

```typescript
type PaymentStatus = 'pending' | 'processing' | 'successful' | 'failed' | 'cancelled'
type OrderPaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
```

**Usage**: Track payment and order lifecycle throughout the system.

### 4. Core Data Structures

#### TicketItem
Represents a single ticket in a payment:
```typescript
{
  ticket_id: string
  ticket_name: string
  ticket_tier: 'standard' | 'vip'
  ticket_duration: '1-day' | '3-day'
  quantity: number
  unit_price: number
  subtotal: number
}
```

**Used in**: Payment metadata, order records

#### PaymentMetadata
Contains order and ticket information:
```typescript
{
  order_id: string
  tickets: TicketItem[]
  total_quantity: number
  user_id?: string
  session_id?: string
  coupon_code?: string
}
```

#### PaymentRecord
Database representation of a payment:
```typescript
{
  id?: string
  order_id: string
  tx_ref: string
  flw_ref?: string
  amount: number
  currency: PaymentCurrency
  status: PaymentStatus
  payment_type?: string
  customer_email: string
  customer_name: string
  customer_phone: string
  meta?: Partial<PaymentMetadata>
  created_at?: string
  updated_at?: string
  verified_at?: string
}
```

**Used in**: Database operations, payment lookups

#### TicketOrder
Database representation of an order:
```typescript
{
  id?: string
  order_id: string
  user_id: string
  total_amount: number
  currency: PaymentCurrency
  quantity: number
  status: OrderStatus
  payment_status: OrderPaymentStatus
  payment_method?: PaymentProvider
  created_at?: string
  updated_at?: string
  paid_at?: string
  fulfilled_at?: string
  cancelled_at?: string
}
```

### 5. Hook State & Results

#### PaymentHookState
State management for payment operations:
```typescript
{
  isInitializing: boolean
  isVerifying: boolean
  isSuccess: boolean
  isError: boolean
  errorMessage: string | null
  paymentLink: string | null
  txRef: string | null
}
```

**Used in**: `use-flutterwave-payment.tsx` hook state

#### PaymentInitResult
Result returned from `initializePayment()`:
```typescript
{
  success: boolean
  paymentLink?: string
  txRef?: string
  error?: string
}
```

#### PaymentVerifyResult
Result returned from `verifyPayment()`:
```typescript
{
  success: boolean
  verified: boolean
  status?: PaymentStatus
  amount?: number
  currency?: PaymentCurrency
  tx_ref?: string
  order_id?: string
  orderId?: string
  error?: string
}
```

### 6. Flutterwave-Specific Types

#### FlutterwavePaymentRequest
Payload sent to Flutterwave API:
```typescript
{
  tx_ref: string
  amount: number
  currency: PaymentCurrency
  redirect_url: string
  customer: {
    email: string
    name: string
    phonenumber: string
  }
  customizations?: {
    title?: string
    description?: string
    logo?: string
  }
  meta?: Partial<PaymentMetadata>
  payment_options?: string
}
```

#### FlutterwaveWebhookPayload
Received from Flutterwave webhooks:
```typescript
{
  event: 'charge.completed' | 'transfer.completed' | 'transfer.failed'
  data: {
    id: number
    tx_ref: string
    flw_ref: string
    amount: number
    currency: PaymentCurrency
    status: 'successful' | 'failed'
    customer: {
      email: string
      name: string
    }
    meta?: Partial<PaymentMetadata>
    created_at: string
  }
}
```

## Payment Flow Architecture

### 1. Initialization Flow

```
Client Component (register/page.tsx)
    ↓
useFlutterwavePayment hook
    ↓ initializePayment()
/api/payments/initialize (POST)
    ↓ validateRequestSecurity()
lib/flutterwave/client.ts::initializeFlutterwavePayment()
    ↓
Flutterwave API
    ↓
PaymentRecord stored in database
    ↓
Return payment_link & tx_ref
    ↓
Client opens payment link in new window
```

### 2. Verification Flow

```
Flutterwave Redirect
    ↓
Client calls /api/payments/verify (GET/POST)
    ↓
useFlutterwavePayment::verifyPayment()
    ↓
lib/flutterwave/client.ts::verifyFlutterwavePayment()
    ↓
Flutterwave API /verify endpoint
    ↓
Update PaymentRecord status
Update TicketOrder status
    ↓
Return verification result to client
```

### 3. Webhook Flow

```
Flutterwave Webhook
    ↓
/api/payments/webhook (POST)
    ↓ verifyWebhookSignature()
lib/flutterwave/client.ts::processFlutterwaveWebhook()
    ↓
Update PaymentRecord
Update TicketOrder
Log security event
    ↓
Return success response
```

## Usage Examples

### In React Components

```tsx
import { useFlutterwavePayment } from '@/hooks/use-flutterwave-payment'
import type { PaymentInitRequest, PaymentMetadata } from '@/types/payment'

function RegisterComponent() {
  const { initializePayment, verifyPayment } = useFlutterwavePayment()

  const handlePayment = async () => {
    const meta: PaymentMetadata = {
      order_id: 'ORD-123',
      tickets: [
        {
          ticket_id: 'std-day-1',
          ticket_name: 'Standard 1-Day Pass',
          ticket_tier: 'standard',
          ticket_duration: '1-day',
          quantity: 2,
          unit_price: 15000,
          subtotal: 30000,
        }
      ],
      total_quantity: 2,
    }

    const paymentRequest: PaymentInitRequest = {
      orderId: 'ORD-123',
      amount: 30000,
      customer: {
        email: 'user@example.com',
        name: 'John Doe',
        phone: '+2348012345678',
      },
      meta,
    }

    const result = await initializePayment(paymentRequest)
    if (result.success) {
      // Payment link opened, wait for verification
    }
  }
}
```

### In API Routes

```typescript
import type { PaymentVerifyRequest, PaymentVerifyResponse } from '@/types/payment'

export async function POST(req: NextRequest): Promise<NextResponse<PaymentVerifyResponse>> {
  const body: PaymentVerifyRequest = await req.json()
  
  // Validate and process...
  
  return NextResponse.json<PaymentVerifyResponse>({
    success: true,
    verified: true,
    status: 'successful',
    amount: 30000,
    currency: 'NGN',
    order_id: 'ORD-123',
  })
}
```

### Database Operations

```typescript
import type { PaymentRecord, TicketOrder } from '@/types/payment'

// Store payment record
const paymentRecord: PaymentRecord = {
  order_id: 'ORD-123',
  tx_ref: 'TXN-REF-123',
  amount: 30000,
  currency: 'NGN',
  status: 'pending',
  customer_email: 'user@example.com',
  customer_name: 'John Doe',
  customer_phone: '+2348012345678',
}

// Store order
const order: TicketOrder = {
  order_id: 'ORD-123',
  user_id: 'user-123',
  total_amount: 30000,
  currency: 'NGN',
  quantity: 2,
  status: 'pending',
  payment_status: 'pending',
  payment_method: 'flutterwave',
}
```

## Type Safety Best Practices

### 1. Always Import Types from Central Location

```typescript
// ✓ Correct
import type { PaymentRecord, PaymentMetadata } from '@/types/payment'

// ✗ Avoid
import type { PaymentRecord } from '@/lib/flutterwave/types'
```

### 2. Use Type-Safe API Responses

```typescript
// ✓ Correct
return NextResponse.json<PaymentVerifyResponse>({ ... })

// ✗ Avoid
return NextResponse.json({ ... })
```

### 3. Preserve Type Information in Data Flow

```typescript
// ✓ Correct - Type preserved through flow
const meta: PaymentMetadata = { ... }
const request: PaymentInitRequest = { ..., meta }

// ✗ Avoid - Type lost
const meta = { ... }
const request = { ..., meta }
```

## Extending the Payment System

### Adding a New Payment Provider

1. Update `PaymentProvider` type in `types/payment.ts`:
```typescript
type PaymentProvider = 'flutterwave' | 'stripe' | 'paystack' | 'new-provider'
```

2. Create provider-specific types in `lib/[provider]/types.ts`
3. Export commonly used types from centralized location
4. Implement provider client in `lib/[provider]/client.ts`
5. Create API routes in `app/api/payments/[provider]/`

### Adding New Payment Status

Update `PaymentStatus` type:
```typescript
type PaymentStatus = 'pending' | 'processing' | 'successful' | 'failed' | 'cancelled' | 'refunded'
```

### Adding New Metadata Fields

Extend `PaymentMetadata` interface:
```typescript
export interface PaymentMetadata {
  order_id: string
  tickets: TicketItem[]
  total_quantity: number
  user_id?: string
  session_id?: string
  coupon_code?: string
  discount_amount?: number  // New field
  promo_code?: string        // New field
}
```

## Security Considerations

All payment API routes include:
- CSRF token validation
- Rate limiting
- Honeypot validation
- Security event logging

See `lib/api-security.ts` for implementation details.

## Testing

### Mock Payment Types

```typescript
const mockPayment: PaymentRecord = {
  order_id: 'TEST-ORD-123',
  tx_ref: 'TEST-TXN-123',
  amount: 30000,
  currency: 'NGN',
  status: 'successful',
  customer_email: 'test@example.com',
  customer_name: 'Test User',
  customer_phone: '+2348012345678',
  created_at: new Date().toISOString(),
  verified_at: new Date().toISOString(),
}
```

## File Reference Map

| File | Types | Usage |
|------|-------|-------|
| `types/payment.ts` | All payment types | Central type definitions |
| `lib/flutterwave/types.ts` | Flutterwave re-exports | Provider-specific types |
| `hooks/use-flutterwave-payment.tsx` | PaymentHookState, PaymentInitResult, etc. | Client-side payment operations |
| `app/api/payments/initialize/route.ts` | PaymentInitRequest/Response | Payment initialization |
| `app/api/payments/verify/route.ts` | PaymentVerifyRequest/Response | Payment verification |
| `app/api/payments/webhook/route.ts` | FlutterwaveWebhookPayload | Webhook handling |
| `lib/flutterwave/client.ts` | PaymentRecord, PaymentVerifyResult, etc. | Server-side operations |

