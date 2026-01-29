/**
 * Order Pending Email API Route
 * POST /api/register/email - Send order confirmation email for pending orders
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendOrderPendingEmail } from '@/lib/email'
import { z } from 'zod'

const emailRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  orderNumber: z.string().min(1),
  tickets: z.string().min(1),
  totalAmount: z.number().positive(),
  currency: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate request body
    const validationResult = emailRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { email, name, orderNumber, tickets, totalAmount, currency } = validationResult.data

    // Send the order pending email
    const result = await sendOrderPendingEmail({
      email,
      name,
      orderNumber,
      tickets,
      totalAmount,
      currency,
    })

    if (!result.success) {
      console.error('[Register Email] Failed to send:', result.error)
      return NextResponse.json(
        { error: 'Failed to send confirmation email', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.id,
    })
  } catch (error) {
    console.error('[Register Email] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
