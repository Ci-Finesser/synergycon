/**
 * Admin Ticket Validation API
 * Validate and check-in tickets for attendees
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logSecurityEvent } from '@/lib/security-logger'
import type {
  TicketValidationRequest,
  TicketValidationResponse,
  TicketCheckResponse,
} from '@/types/ticket'

/**
 * POST /api/admin/tickets/validate
 * Validate a ticket and mark as checked-in
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<TicketValidationResponse>> {
  try {
    // Check admin authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerClient()
    const body: TicketValidationRequest = await req.json()

    if (!body.ticket_number) {
      return NextResponse.json(
        { success: false, error: 'Ticket number is required' },
        { status: 400 }
      )
    }

    // Check if ticket exists in payments/orders
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, ticket_orders(*)')
      .contains('ticket_numbers', [body.ticket_number])
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ticket not found',
          message: 'This ticket number does not exist in our system',
        },
        { status: 404 }
      )
    }

    // Check if already validated
    const { data: existingValidation } = await supabase
      .from('ticket_validations')
      .select('*')
      .eq('ticket_number', body.ticket_number)
      .eq('is_valid', true)
      .single()

    const alreadyValidated = !!existingValidation
    const validationCount = await supabase
      .from('ticket_validations')
      .select('id', { count: 'exact' })
      .eq('ticket_number', body.ticket_number)
      .eq('is_valid', true)

    // Get admin user ID
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Create validation record
    const { data: validation, error: validationError } = await supabase
      .from('ticket_validations')
      .insert([
        {
          ticket_number: body.ticket_number,
          order_id: body.order_id || payment.order_id,
          attendee_name: body.attendee_name || payment.customer_name,
          attendee_email: body.attendee_email || payment.customer_email,
          validated_by: user?.id,
          validation_location: body.validation_location,
          validation_notes: body.validation_notes,
          check_in_time: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (validationError) {
      console.error('[Ticket Validation] Error:', validationError)
      return NextResponse.json(
        { success: false, error: 'Failed to validate ticket' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'payment_admin_update',
      endpoint: '/api/admin/tickets/validate',
      details: `Validated ticket: ${body.ticket_number}`,
    })

    return NextResponse.json<TicketValidationResponse>({
      success: true,
      validation,
      ticket_info: {
        ticket_type: payment.ticket_orders?.[0]?.ticket_type || 'Unknown',
        attendee_name: payment.customer_name,
        order_id: payment.order_id,
        already_validated: alreadyValidated,
        validation_count: (validationCount.count || 0) + 1,
      },
      message: alreadyValidated
        ? 'Warning: This ticket was already validated'
        : 'Ticket validated successfully',
    })
  } catch (error) {
    console.error('[Ticket Validation] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/tickets/validate?ticket_number={number}
 * Check ticket status without validating
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<TicketCheckResponse>> {
  try {
    // Check admin authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const ticketNumber = searchParams.get('ticket_number')

    if (!ticketNumber) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Ticket number is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Check if ticket exists
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, ticket_orders(*)')
      .contains('ticket_numbers', [ticketNumber])
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Ticket not found in system',
      })
    }

    // Get validation history
    const { data: validations } = await supabase
      .from('ticket_validations')
      .select('*')
      .eq('ticket_number', ticketNumber)
      .eq('is_valid', true)
      .order('validated_at', { ascending: false })

    const alreadyValidated = (validations?.length || 0) > 0
    const lastValidation = validations?.[0]

    return NextResponse.json<TicketCheckResponse>({
      success: true,
      valid: true,
      ticket_info: {
        ticket_number: ticketNumber,
        order_id: payment.order_id,
        ticket_type: payment.ticket_orders?.[0]?.ticket_type || 'Unknown',
        attendee_name: payment.customer_name,
        attendee_email: payment.customer_email,
        already_validated: alreadyValidated,
        validation_count: validations?.length || 0,
        last_validated_at: lastValidation?.validated_at,
      },
    })
  } catch (error) {
    console.error('[Ticket Check] Error:', error)
    return NextResponse.json(
      { success: false, valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
