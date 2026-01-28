/**
 * Payment Initialization API Route
 * 
 * Initializes a payment transaction with selected provider (Flutterwave or Paystack)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-logger'
import { getPaymentProvider, getDefaultProvider } from '@/lib/payments/payment-factory'
import type { PaymentProvider, Currency } from '@/lib/payments/types'

// Request validation schema
const InitializePaymentSchema = z.object({
  provider: z.enum(['flutterwave', 'paystack']).optional(),
  orderId: z.string().min(1),
  amount: z.number().positive().max(10000000), // Max 10M NGN
  currency: z.enum(['NGN', 'USD', 'GHS', 'KES', 'ZAR']).default('NGN'),
  customer: z.object({
    email: z.string().email(),
    name: z.string().min(2),
    phone: z.string().optional(),
  }),
  meta: z.record(z.unknown()).optional(),
  description: z.string().optional(),
  callbackUrl: z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate security (CSRF + rate limiting + honeypot)
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.STRICT,
    })
    if (securityError) return securityError

    // Clean security fields and validate
    const cleanData = cleanSecurityFields(body)
    const validation = InitializePaymentSchema.safeParse(cleanData)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { provider, orderId, amount, currency, customer, meta, description, callbackUrl } = validation.data

    // Get payment provider (use specified or default)
    let selectedProvider: PaymentProvider
    try {
      selectedProvider = provider || getDefaultProvider()
    } catch {
      return NextResponse.json(
        { success: false, error: 'No payment providers configured' },
        { status: 500 }
      )
    }

    const paymentProvider = getPaymentProvider(selectedProvider)

    if (!paymentProvider.isConfigured) {
      return NextResponse.json(
        { success: false, error: `Payment provider ${selectedProvider} is not configured` },
        { status: 500 }
      )
    }

    // Initialize payment with the provider
    const result = await paymentProvider.initialize({
      amount,
      currency: currency as Currency,
      customer: {
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
      },
      metadata: {
        orderId,
        ...meta,
      },
      description: description || 'SynergyCon 2026 Ticket Purchase',
      callbackUrl: callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/register/payment/callback`,
    })

    if (!result.success) {
      logSecurityEvent({
        type: 'api_error',
        endpoint: req.url,
        details: `Payment init failed: ${result.error || 'Unknown error'}`,
      })
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to initialize payment' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'api_success',
      endpoint: req.url,
      details: `Payment initialized: ${selectedProvider}, ref: ${result.reference}`,
    })

    return NextResponse.json({
      success: true,
      provider: result.provider,
      authorizationUrl: result.authorizationUrl,
      payment_link: result.authorizationUrl, // Legacy compatibility
      reference: result.reference,
      tx_ref: result.reference, // Legacy compatibility
      accessCode: result.accessCode,
    })
  } catch (error) {
    console.error('[Payment Init API] Error:', error)
    logSecurityEvent({
      type: 'api_error',
      endpoint: req.url,
      details: `Payment init exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
