/**
 * Payment Webhook API Route
 * 
 * Handles webhook notifications from Flutterwave and Paystack
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPaymentProvider } from '@/lib/payments/payment-factory'
import { createServerClient } from '@/lib/supabase/server'
import { logSecurityEvent } from '@/lib/security-logger'
import type { PaymentProvider } from '@/lib/payments/types'

/**
 * Detect provider from webhook headers/payload
 */
function detectProvider(req: NextRequest): PaymentProvider | null {
  // Paystack uses x-paystack-signature header
  if (req.headers.get('x-paystack-signature')) {
    return 'paystack'
  }

  // Flutterwave uses verif-hash header
  if (req.headers.get('verif-hash')) {
    return 'flutterwave'
  }

  return null
}

/**
 * Get signature from request headers based on provider
 */
function getSignature(req: NextRequest, provider: PaymentProvider): string | null {
  if (provider === 'paystack') {
    return req.headers.get('x-paystack-signature')
  }
  if (provider === 'flutterwave') {
    return req.headers.get('verif-hash')
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    // Detect provider from headers
    const provider = detectProvider(req)

    if (!provider) {
      logSecurityEvent({
        type: 'webhook_rejected',
        endpoint: '/api/payments/webhook',
        details: 'Could not detect payment provider from headers',
      })

      return NextResponse.json(
        { error: 'Unknown provider' },
        { status: 400 }
      )
    }

    // Get signature from headers
    const signature = getSignature(req, provider)

    if (!signature) {
      logSecurityEvent({
        type: 'webhook_rejected',
        endpoint: '/api/payments/webhook',
        details: `Missing ${provider} webhook signature`,
      })

      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Get raw body for signature verification
    const rawBody = await req.text()

    // Get payment provider instance
    const paymentProvider = getPaymentProvider(provider)

    // Verify webhook signature
    const isValid = paymentProvider.verifyWebhook(rawBody, signature)

    if (!isValid) {
      logSecurityEvent({
        type: 'webhook_rejected',
        endpoint: '/api/payments/webhook',
        details: `Invalid ${provider} webhook signature`,
      })

      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody)
    const event = paymentProvider.parseWebhook(payload)

    // Log webhook event
    logSecurityEvent({
      type: 'webhook_received',
      endpoint: '/api/payments/webhook',
      details: `${provider}: ${event.event} for ${event.data.reference}`,
    })

    // Process webhook - update payment record
    const supabase = await createServerClient()

    // Upsert payment record
    const { error: paymentError } = await supabase.from('payments').upsert(
      {
        reference: event.data.reference,
        provider,
        status: event.data.status,
        amount: event.data.amount,
        currency: event.data.currency,
        customer_email: event.data.customer.email,
        customer_name: event.data.customer.name,
        customer_phone: event.data.customer.phone || null,
        paid_at: event.data.paidAt?.toISOString(),
        metadata: event.data.metadata,
        webhook_payload: event.rawPayload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'reference' }
    )

    if (paymentError) {
      console.error('[Payment Webhook] Failed to save payment:', paymentError)
    }

    // Handle successful payment - update order
    if (event.data.status === 'successful') {
      const orderId = event.data.metadata?.orderId as string

      if (orderId) {
        const { error: orderError } = await supabase
          .from('ticket_orders')
          .update({
            fulfillment_status: 'fulfilled',
            payment_status: 'paid',
            paid_at: event.data.paidAt?.toISOString() || new Date().toISOString(),
          })
          .eq('order_number', orderId)

        if (orderError) {
          console.error('[Payment Webhook] Failed to update order:', orderError)
        }
      }

      // Update registration if applicable
      if (event.data.metadata?.registrationId) {
        await supabase
          .from('registrations')
          .update({
            payment_status: 'paid',
            payment_reference: event.data.reference,
            updated_at: new Date().toISOString(),
          })
          .eq('id', event.data.metadata.registrationId)
      }
    }

    // Return success to provider
    return NextResponse.json({ status: 'success', received: true })
  } catch (error) {
    console.error('[Payment Webhook API] Error:', error)

    logSecurityEvent({
      type: 'webhook_processing_failed',
      endpoint: '/api/payments/webhook',
      details: error instanceof Error ? error.message : 'Unknown error',
    })

    // Still return 200 to prevent webhook retries for parse errors
    return NextResponse.json(
      { status: 'error', message: 'Processing error' },
      { status: 200 }
    )
  }
}
