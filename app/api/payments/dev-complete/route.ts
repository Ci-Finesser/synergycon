/**
 * Development-Only Payment Completion API
 * 
 * This endpoint simulates a successful payment for testing purposes.
 * ONLY works in development mode (NODE_ENV !== 'production')
 * 
 * Features:
 * - Bypasses actual payment processing
 * - Creates/updates order with confirmed status
 * - Creates user profile if not exists
 * - Sends ticket confirmation email (receipt)
 * - Sends welcome email for new users
 */

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-logger'
import { createAdminClient } from '@/lib/supabase/server'
import { sendTicketConfirmationEmail, sendWelcomeEmail } from '@/lib/email'
import { generateProfileSlug, generateProfileUrl } from '@/lib/utils'

// Only allow in development
const isDevelopment = process.env.NODE_ENV !== 'production'

// Request validation schema
const DevCompleteSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(['NGN', 'USD', 'GHS', 'KES', 'ZAR']).default('NGN'),
  customer: z.object({
    email: z.string().email(),
    name: z.string().min(2),
    phone: z.string().optional(),
  }),
  meta: z.record(z.unknown()).optional(),
})

export async function POST(req: NextRequest) {
  // Block in production
  if (!isDevelopment) {
    logSecurityEvent({
      type: 'api_blocked',
      endpoint: req.url,
      details: 'Dev-complete endpoint accessed in production mode',
    })
    return NextResponse.json(
      { success: false, error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()

    // In dev mode, skip CSRF validation for easier testing
    // Security is already ensured by blocking this endpoint in production
    const securityError = await validateRequestSecurity(req, body, {
      rateLimit: RATE_LIMITS.STANDARD,
      skipCSRF: true,  // Skip CSRF in dev for easier testing
      skipHoneypot: true,  // Skip honeypot for dev testing
    })
    if (securityError) return securityError

    // Clean security fields and validate
    const cleanData = cleanSecurityFields(body)
    const validation = DevCompleteSchema.safeParse(cleanData)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { orderId, amount, currency, customer, meta } = validation.data

    // Generate a mock reference
    const reference = `DEV-${orderId}-${Date.now()}`

    // Use admin client to bypass RLS for dev operations
    const supabase = createAdminClient()

    // Update order to fulfilled status
    const { error: orderError, data: orderData } = await supabase
      .from('ticket_orders')
      .update({
        fulfillment_status: 'fulfilled',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('order_number', orderId)
      .select('*')
      .single()

    if (orderError) {
      console.error('[Dev Complete] Failed to update order:', orderError)
      return NextResponse.json(
        { success: false, error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    // Create mock payment record
    await supabase.from('payments').upsert(
      {
        reference,
        provider: 'flutterwave',
        status: 'successful',
        amount,
        currency,
        customer_email: customer.email,
        customer_name: customer.name,
        customer_phone: customer.phone || null,
        paid_at: new Date().toISOString(),
        channel: 'dev-bypass',
        metadata: { orderId, ...meta, devMode: true },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'reference' }
    )

    // Check if user profile exists, create if not
    let isNewUser = false
    let profileCreationFailed = false
    let profileCreationError = ''
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', customer.email)
      .single()

    if (!existingUser) {
      // Create new user profile with generated user_id
      const newUserId = randomUUID()
      const profileSlug = generateProfileSlug(customer.name, customer.email)
      const { error: userError } = await supabase.from('user_profiles').insert({
        user_id: newUserId,
        email: customer.email,
        full_name: customer.name,
        phone: customer.phone || null,
        user_type: 'attendee',
        profile_slug: profileSlug,
        profile_url: generateProfileUrl(profileSlug),
        organization: (orderData?.organization as string) || null,
        industry: (orderData?.industry as string) || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (userError) {
        console.error('[Dev Complete] Failed to create user profile:', userError)
        profileCreationFailed = true
        profileCreationError = userError.message || 'Failed to create user profile'
      } else {
        console.log('[Dev Complete] Created new user profile for:', customer.email)
        isNewUser = true // Only mark as new user if profile was created successfully
      }
    }

    // Extract ticket info from order metadata
    const tickets = orderData?.metadata?.tickets || []
    const ticketSummary = tickets.map((t: { name: string; quantity: number; price: number }) => 
      `${t.quantity}x ${t.name}`
    ).join(', ') || 'SynergyCon 2026 Tickets'

    // Send ticket confirmation email (receipt)
    const receiptResult = await sendTicketConfirmationEmail({
      email: customer.email,
      name: customer.name,
      orderNumber: orderId,
      amount,
      currency,
      tickets: ticketSummary,
      paidAt: new Date(),
    })

    if (receiptResult.success) {
      console.log('[Dev Complete] Ticket confirmation email sent:', receiptResult.id)
    } else {
      console.error('[Dev Complete] Failed to send ticket confirmation:', receiptResult.error)
    }

    // Send welcome email for new users
    if (isNewUser) {
      const welcomeResult = await sendWelcomeEmail({
        email: customer.email,
        name: customer.name,
      })

      if (welcomeResult.success) {
        console.log('[Dev Complete] Welcome email sent:', welcomeResult.id)
      } else {
        console.error('[Dev Complete] Failed to send welcome email:', welcomeResult.error)
      }
    }

    logSecurityEvent({
      type: 'api_success',
      endpoint: req.url,
      details: `Dev payment completed: ${orderId}, ref: ${reference}, newUser: ${isNewUser}`,
    })

    return NextResponse.json({
      success: true,
      reference,
      orderId,
      status: 'successful',
      amount,
      currency,
      customer,
      isNewUser,
      profileCreationFailed,
      profileCreationError: profileCreationFailed ? profileCreationError : undefined,
      userData: profileCreationFailed ? {
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        organization: orderData?.organization,
        industry: orderData?.industry,
        role: orderData?.role,
        attendanceReason: orderData?.attendance_reason,
        expectations: orderData?.expectations,
        dietaryRequirements: orderData?.dietary_requirements,
      } : undefined,
      message: 'Development payment completed successfully',
    })
  } catch (error) {
    console.error('[Dev Complete API] Error:', error)
    logSecurityEvent({
      type: 'api_error',
      endpoint: req.url,
      details: `Dev complete exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
