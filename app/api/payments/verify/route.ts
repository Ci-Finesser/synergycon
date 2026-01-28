/**
 * Payment Verification API Route
 * 
 * Verifies a payment transaction with the selected provider (Flutterwave or Paystack)
 */

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { getPaymentProvider } from '@/lib/payments/payment-factory'
import { createServerClient } from '@/lib/supabase/server'
import { sendTicketConfirmationEmail, sendWelcomeEmail } from '@/lib/email'
import { generateProfileSlug, generateProfileUrl } from '@/lib/utils'
import type { PaymentProvider } from '@/lib/payments/types'

// Request validation schema
const VerifyPaymentSchema = z.object({
  provider: z.enum(['flutterwave', 'paystack']),
  reference: z.string().min(1),
  transactionId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate security
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.STANDARD,
    })
    if (securityError) return securityError

    // Clean security fields and validate
    const cleanData = cleanSecurityFields(body)
    const validation = VerifyPaymentSchema.safeParse(cleanData)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { provider, reference, transactionId } = validation.data

    // Get payment provider
    const paymentProvider = getPaymentProvider(provider as PaymentProvider)

    if (!paymentProvider.isConfigured) {
      return NextResponse.json(
        { success: false, error: `Payment provider ${provider} is not configured` },
        { status: 500 }
      )
    }

    // Verify payment with provider
    const result = await paymentProvider.verify({
      reference,
      transactionId,
    })

    // Track profile creation status (used in response)
    let isNewUser = false
    let profileCreationFailed = false
    let profileCreationError = ''

    // If payment verified successfully, update order status
    if (result.success && result.status === 'successful') {
      const supabase = await createServerClient()

      // Extract order ID from metadata
      const orderId = result.metadata?.orderId as string
      let orderData: Record<string, unknown> | null = null

      if (orderId) {
        const { error: orderError, data: updatedOrder } = await supabase
          .from('ticket_orders')
          .update({
            fulfillment_status: 'fulfilled',
            payment_status: 'paid',
            paid_at: result.paidAt?.toISOString() || new Date().toISOString(),
          })
          .eq('order_number', orderId)
          .select('*')
          .single()

        if (orderError) {
          console.error('[Payment Verify API] Failed to update order:', orderError)
        } else {
          orderData = updatedOrder
        }
      }

      // Also save/update payment record
      await supabase.from('payments').upsert(
        {
          reference: result.reference,
          provider: result.provider,
          status: result.status,
          amount: result.amount,
          currency: result.currency,
          customer_email: result.customer.email,
          customer_name: result.customer.name,
          customer_phone: result.customer.phone || null,
          paid_at: result.paidAt?.toISOString(),
          channel: result.channel,
          metadata: result.metadata,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'reference' }
      )

      // Check if user profile exists, create if not
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id, email')
        .eq('email', result.customer.email)
        .single()

      if (!existingUser) {
        // Create new user profile with generated user_id
        const newUserId = uuidv4()
        const profileSlug = generateProfileSlug(result.customer.name, result.customer.email)
        const { error: userError } = await supabase.from('user_profiles').insert({
          user_id: newUserId,
          email: result.customer.email,
          full_name: result.customer.name,
          phone: result.customer.phone || null,
          user_type: 'attendee',
          profile_slug: profileSlug,
          profile_url: generateProfileUrl(profileSlug),
          organization: (orderData?.organization as string) || null,
          industry: (orderData?.industry as string) || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (userError) {
          console.error('[Payment Verify API] Failed to create user profile:', userError)
          profileCreationFailed = true
          profileCreationError = userError.message || 'Failed to create user profile'
        } else {
          console.log('[Payment Verify API] Created new user profile for:', result.customer.email)
          isNewUser = true // Only mark as new user if profile was created successfully
        }
      }

      // Create registration record for unified tracking
      const { error: registrationError } = await supabase
        .from('registrations')
        .insert({
          full_name: result.customer.name,
          email: result.customer.email,
          phone_number: result.customer.phone || null,
          organization: (orderData?.organization as string) || null,
          role: (orderData?.role as string) || null,
          industry: (orderData?.industry as string) || null,
          registration_source: 'ticket_purchase',
          status: 'confirmed',
          payment_status: 'paid',
          order_id: orderId || null,
          total_amount: result.amount,
        })

      if (registrationError) {
        // Log but don't fail - registration tracking is non-critical
        console.error('[Payment Verify API] Failed to create registration record:', registrationError)
      }

      // Extract ticket info for email
      const tickets = (orderData?.metadata as Record<string, unknown>)?.tickets as Array<{ name: string; quantity: number; price: number }> || []
      const ticketSummary = tickets.map((t) => 
        `${t.quantity}x ${t.name}`
      ).join(', ') || 'SynergyCon 2026 Tickets'

      // Send ticket confirmation email (receipt)
      sendTicketConfirmationEmail({
        email: result.customer.email,
        name: result.customer.name,
        orderNumber: orderId || result.reference,
        amount: result.amount,
        currency: result.currency,
        tickets: ticketSummary,
        paidAt: result.paidAt || new Date(),
      }).then((emailResult) => {
        if (emailResult.success) {
          console.log('[Payment Verify API] Ticket confirmation email sent:', emailResult.id)
        } else {
          console.error('[Payment Verify API] Failed to send ticket confirmation:', emailResult.error)
        }
      })

      // Send welcome email for new users
      if (isNewUser) {
        sendWelcomeEmail({
          email: result.customer.email,
          name: result.customer.name,
        }).then((emailResult) => {
          if (emailResult.success) {
            console.log('[Payment Verify API] Welcome email sent:', emailResult.id)
          } else {
            console.error('[Payment Verify API] Failed to send welcome email:', emailResult.error)
          }
        })
      }
    }

    // Prepare response with profile creation status
    const isPaymentSuccessful = result.success && result.status === 'successful'
    
    return NextResponse.json({
      success: result.success,
      provider: result.provider,
      reference: result.reference,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      customer: result.customer,
      paidAt: result.paidAt?.toISOString(),
      verified: isPaymentSuccessful,
      error: result.error,
      // Profile creation status (only relevant for successful payments)
      ...(isPaymentSuccessful && {
        isNewUser,
        profileCreationFailed,
        profileCreationError: profileCreationError || undefined,
        userData: profileCreationFailed ? {
          email: result.customer.email,
          name: result.customer.name,
          phone: result.customer.phone,
        } : undefined,
      }),
    })
  } catch (error) {
    console.error('[Payment Verify API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET handler for checking payment status by reference
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference') || searchParams.get('tx_ref')
    const provider = searchParams.get('provider') as PaymentProvider | null

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Missing transaction reference' },
        { status: 400 }
      )
    }

    // Try to get from database first
    const supabase = await createServerClient()
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .single()

    if (payment) {
      return NextResponse.json({
        success: true,
        payment: {
          reference: payment.reference,
          provider: payment.provider,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          customer_email: payment.customer_email,
          customer_name: payment.customer_name,
          customer_phone: payment.customer_phone,
          paid_at: payment.paid_at,
          created_at: payment.created_at,
          updated_at: payment.updated_at,
        },
      })
    }

    // If not in database and provider specified, verify with provider
    if (provider) {
      const paymentProvider = getPaymentProvider(provider)
      const result = await paymentProvider.verify({ reference })

      return NextResponse.json({
        success: result.success,
        payment: {
          reference: result.reference,
          provider: result.provider,
          status: result.status,
          amount: result.amount,
          currency: result.currency,
          customer_email: result.customer.email,
          customer_name: result.customer.name,
          customer_phone: result.customer.phone,
          paid_at: result.paidAt?.toISOString(),
        },
      })
    }

    return NextResponse.json(
      { success: false, error: 'Payment not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('[Payment Status API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
