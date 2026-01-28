#!/usr/bin/env bash
# PAYMENT_TYPES_QUICK_EXAMPLES.md - Quick reference for using payment types

# ============================================================================
# QUICK REFERENCE: Payment Types Usage Examples
# ============================================================================

## 1. CLIENT-SIDE: Using Payment Hook

### Import the hook and types
```tsx
import { useFlutterwavePayment } from '@/hooks/use-flutterwave-payment'
import type { PaymentInitRequest, PaymentMetadata, TicketItem } from '@/types/payment'

function CheckoutComponent() {
  const {
    initializePayment,
    verifyPayment,
    paymentLink,
    isInitializing,
    isError,
    errorMessage,
  } = useFlutterwavePayment()

  // Initialize payment
  const handleCheckout = async () => {
    // Define tickets
    const tickets: TicketItem[] = [
      {
        ticket_id: 'std-1day',
        ticket_name: 'Standard Pass - 1 Day',
        ticket_tier: 'standard',
        ticket_duration: '1-day',
        quantity: 2,
        unit_price: 15000,
        subtotal: 30000,
      },
      {
        ticket_id: 'vip-3day',
        ticket_name: 'VIP Pass - 3 Days',
        ticket_tier: 'vip',
        ticket_duration: '3-day',
        quantity: 1,
        unit_price: 50000,
        subtotal: 50000,
      },
    ]

    // Create metadata
    const meta: PaymentMetadata = {
      order_id: 'ORD-' + Date.now(),
      tickets,
      total_quantity: 3,
      user_id: userId,
      session_id: sessionId,
    }

    // Create payment request
    const paymentRequest: PaymentInitRequest = {
      orderId: meta.order_id,
      amount: 80000, // Total: 30000 + 50000
      customer: {
        email: 'customer@example.com',
        name: 'John Doe',
        phone: '+2348012345678',
      },
      meta,
    }

    // Initialize payment
    const result = await initializePayment(paymentRequest)
    
    if (result.success) {
      // Payment link opened in new window
      // User completes payment on Flutterwave
      // Then verify payment when user returns
    }
  }

  // Verify payment after user returns
  const handleVerifyPayment = async (transactionId: string, txRef: string) => {
    const result = await verifyPayment(transactionId, txRef)
    
    if (result.success && result.verified) {
      // Payment verified - update order status
      console.log('Payment verified!', result.order_id)
    }
  }

  return (
    <div>
      <button onClick={handleCheckout} disabled={isInitializing}>
        {isInitializing ? 'Processing...' : 'Checkout'}
      </button>
      {isError && <p>{errorMessage}</p>}
    </div>
  )
}
```

## 2. SERVER-SIDE API ROUTE: Payment Initialization

```typescript
// app/api/payments/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server'
import type {
  PaymentInitRequest,
  PaymentInitResponse,
  FlutterwavePaymentRequest,
  PaymentMetadata,
} from '@/types/payment'
import { initializeFlutterwavePayment } from '@/lib/flutterwave/client'
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Parse and type request body
    const body: PaymentInitRequest = await req.json()

    // Validate security
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.STRICT,
    })
    if (securityError) return securityError

    // Clean security fields
    const cleanData = cleanSecurityFields(body) as Omit<PaymentInitRequest, '_csrf' | '_formStartTime'>

    // Validate required fields
    if (!cleanData.orderId || !cleanData.amount || !cleanData.customer) {
      return NextResponse.json<PaymentInitResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate amount
    if (cleanData.amount <= 0 || cleanData.amount > 10000000) {
      return NextResponse.json<PaymentInitResponse>(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Create Flutterwave payment request
    const flwRequest: FlutterwavePaymentRequest = {
      tx_ref: `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      amount: cleanData.amount,
      currency: 'NGN',
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-callback`,
      customer: {
        email: cleanData.customer.email,
        name: cleanData.customer.name,
        phonenumber: cleanData.customer.phone,
      },
      meta: cleanData.meta,
    }

    // Initialize payment
    const result = await initializeFlutterwavePayment(flwRequest)

    if (!result.success) {
      return NextResponse.json<PaymentInitResponse>(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // Return typed response
    return NextResponse.json<PaymentInitResponse>({
      success: true,
      payment_link: result.paymentLink,
      tx_ref: result.txRef,
    })
  } catch (error) {
    return NextResponse.json<PaymentInitResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 3. SERVER-SIDE API ROUTE: Payment Verification

```typescript
// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import type { PaymentVerifyRequest, PaymentVerifyResponse } from '@/types/payment'
import { verifyFlutterwavePayment } from '@/lib/flutterwave/client'
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest): Promise<NextResponse<PaymentVerifyResponse>> {
  try {
    // Parse typed request
    const body: PaymentVerifyRequest = await req.json()

    // Validate security
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.STANDARD,
    })
    if (securityError) return securityError

    // Clean fields
    const cleanData = cleanSecurityFields(body) as Omit<PaymentVerifyRequest, '_csrf' | '_formStartTime'>

    if (!cleanData.transactionId || !cleanData.txRef) {
      return NextResponse.json<PaymentVerifyResponse>(
        { success: false, verified: false, error: 'Missing fields' },
        { status: 400 }
      )
    }

    // Verify payment
    const result = await verifyFlutterwavePayment(
      cleanData.transactionId,
      cleanData.txRef
    )

    if (!result.success) {
      return NextResponse.json<PaymentVerifyResponse>(
        { success: false, verified: false, error: result.error },
        { status: 500 }
      )
    }

    // Update order if verified
    if (result.verified && result.order_id) {
      const supabase = await createServerClient()
      await supabase
        .from('ticket_orders')
        .update({ status: 'confirmed', payment_status: 'paid' })
        .eq('order_id', result.order_id)
    }

    // Return typed response
    return NextResponse.json<PaymentVerifyResponse>({
      success: true,
      verified: result.verified || false,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      order_id: result.order_id,
    })
  } catch (error) {
    return NextResponse.json<PaymentVerifyResponse>(
      { success: false, verified: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
```

## 4. WEBHOOK HANDLING

```typescript
// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import type { FlutterwaveWebhookPayload } from '@/types/payment'
import { verifyWebhookSignature, processFlutterwaveWebhook } from '@/lib/flutterwave/client'

export async function POST(req: NextRequest) {
  try {
    // Get signature
    const signature = req.headers.get('verif-hash')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Get raw body
    const rawBody = await req.text()

    // Verify signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse typed payload
    const payload: FlutterwaveWebhookPayload = JSON.parse(rawBody)

    // Handle charge.completed event
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      // Process successful payment
      const result = await processFlutterwaveWebhook(payload)
      
      if (!result.success) {
        console.error('Failed to process webhook:', result.error)
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
      }
    }

    // Return success to Flutterwave
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

## 5. DATABASE OPERATIONS

```typescript
// lib/database-operations.ts
import type { PaymentRecord, TicketOrder, TicketItem, PaymentMetadata } from '@/types/payment'
import { createServerClient } from '@/lib/supabase/server'

// Store payment record
export async function storePaymentRecord(payment: PaymentRecord) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('payments')
    .insert([{
      order_id: payment.order_id,
      tx_ref: payment.tx_ref,
      flw_ref: payment.flw_ref,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      customer_email: payment.customer_email,
      customer_name: payment.customer_name,
      customer_phone: payment.customer_phone,
      meta: payment.meta,
    }])
    .select()
    .single()

  if (error) throw error
  return data as PaymentRecord
}

// Get order by ID
export async function getOrderById(orderId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('ticket_orders')
    .select('*')
    .eq('order_id', orderId)
    .single()

  if (error) throw error
  return data as TicketOrder
}

// Create order
export async function createOrder(order: TicketOrder) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('ticket_orders')
    .insert([{
      order_id: order.order_id,
      user_id: order.user_id,
      total_amount: order.total_amount,
      currency: order.currency,
      quantity: order.quantity,
      status: 'pending',
      payment_status: 'unpaid',
    }])
    .select()
    .single()

  if (error) throw error
  return data as TicketOrder
}

// Update order status
export async function updateOrderStatus(orderId: string, status: 'confirmed' | 'completed' | 'cancelled') {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('ticket_orders')
    .update({ status })
    .eq('order_id', orderId)
    .select()
    .single()

  if (error) throw error
  return data as TicketOrder
}
```

## 6. FORM SUBMISSION PATTERN

```typescript
// React component with payment
const handleSubmit = async (formData: FormData) => {
  // Step 1: Create order in database
  const order: TicketOrder = {
    order_id: `ORD-${Date.now()}`,
    user_id: userId,
    total_amount: calculateTotal(),
    currency: 'NGN',
    quantity: selectedTickets.length,
    status: 'pending',
    payment_status: 'unpaid',
  }

  // Step 2: Prepare payment metadata
  const tickets: TicketItem[] = selectedTickets.map(t => ({
    ticket_id: t.id,
    ticket_name: t.name,
    ticket_tier: t.tier,
    ticket_duration: t.duration,
    quantity: t.quantity,
    unit_price: t.price,
    subtotal: t.price * t.quantity,
  }))

  const meta: PaymentMetadata = {
    order_id: order.order_id,
    tickets,
    total_quantity: selectedTickets.reduce((sum, t) => sum + t.quantity, 0),
  }

  // Step 3: Prepare payment request
  const paymentRequest: PaymentInitRequest = {
    orderId: order.order_id,
    amount: calculateTotal(),
    customer: {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
    },
    meta,
  }

  // Step 4: Initialize payment
  const result = await initializePayment(paymentRequest)
  
  if (result.success) {
    // Payment link opened - wait for callback
  }
}
```

## 7. ERROR HANDLING

```typescript
import type { PaymentVerifyResult } from '@/types/payment'

async function handlePaymentResult(result: PaymentVerifyResult) {
  if (!result.success) {
    // Network or server error
    showError('Payment verification failed: ' + result.error)
    return
  }

  if (!result.verified) {
    // Payment failed
    showError('Payment was not successful. Please try again.')
    return
  }

  // Payment successful
  showSuccess(`Payment of ${result.amount} ${result.currency} verified!`)
}
```

## 8. TYPE GUARD FUNCTIONS (Optional)

```typescript
import type { PaymentRecord, PaymentStatus } from '@/types/payment'

// Check if payment is successful
function isPaymentSuccessful(payment: PaymentRecord): boolean {
  return payment.status === 'successful'
}

// Check if payment is pending
function isPaymentPending(payment: PaymentRecord): boolean {
  return payment.status === 'pending'
}

// Get payment status badge color
function getStatusColor(status: PaymentStatus): string {
  const colors = {
    pending: 'yellow',
    processing: 'blue',
    successful: 'green',
    failed: 'red',
    cancelled: 'gray',
  }
  return colors[status]
}
```

## 9. VALIDATION HELPERS

```typescript
import type { PaymentMetadata, TicketItem } from '@/types/payment'

// Validate metadata
function validatePaymentMetadata(meta: PaymentMetadata): boolean {
  if (!meta.order_id) return false
  if (!Array.isArray(meta.tickets) || meta.tickets.length === 0) return false
  if (meta.total_quantity <= 0) return false
  return meta.tickets.every(validateTicketItem)
}

// Validate ticket item
function validateTicketItem(ticket: TicketItem): boolean {
  return !!(
    ticket.ticket_id &&
    ticket.ticket_name &&
    ['standard', 'vip'].includes(ticket.ticket_tier) &&
    ['1-day', '3-day'].includes(ticket.ticket_duration) &&
    ticket.quantity > 0 &&
    ticket.unit_price > 0 &&
    ticket.subtotal === ticket.unit_price * ticket.quantity
  )
}
```

## Files Location Reference

| Feature | File | Type |
|---------|------|------|
| Type Definitions | `types/payment.ts` | Central source |
| Hook Usage | `hooks/use-flutterwave-payment.tsx` | Client hook |
| Init API | `app/api/payments/initialize/route.ts` | Server API |
| Verify API | `app/api/payments/verify/route.ts` | Server API |
| Webhook | `app/api/payments/webhook/route.ts` | Server API |
| Client Library | `lib/flutterwave/client.ts` | Server utilities |
| Config | `lib/flutterwave/config.ts` | Configuration |

