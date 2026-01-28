/**
 * Ticket Validation API Route
 * POST /api/tickets/[id]/validate - Validate ticket (check-in)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    // Get current user (must be admin)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const ticketId = id
    const body = await req.json()
    const { location, notes } = body

    // Fetch ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Check if ticket is valid (using database function)
    const { data: isValid } = await supabase.rpc('is_ticket_valid', {
      ticket_id: ticketId,
    })

    if (!isValid) {
      let reason = 'Invalid ticket'
      if (ticket.status !== 'active') {
        reason = `Ticket is ${ticket.status}`
      } else if (ticket.validated_at) {
        reason = 'Ticket already used'
      }

      return NextResponse.json(
        { error: reason, ticket },
        { status: 400 }
      )
    }

    // Update ticket as validated
    const { data: validatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update({
        validated_at: new Date().toISOString(),
        validated_by: user.id,
        status: 'used',
      })
      .eq('id', ticketId)
      .select()
      .single()

    if (updateError) {
      console.error('Error validating ticket:', updateError)
      return NextResponse.json(
        { error: 'Failed to validate ticket' },
        { status: 500 }
      )
    }

    // Create validation record
    const { error: validationError } = await supabase
      .from('ticket_validations')
      .insert({
        ticket_number: ticket.ticket_number,
        order_id: ticket.order_id,
        attendee_name: ticket.attendee_name,
        attendee_email: ticket.attendee_email,
        validated_by: user.id,
        validation_location: location || 'Main Entrance',
        validation_notes: notes,
        check_in_time: new Date().toISOString(),
        is_valid: true,
      })

    if (validationError) {
      console.error('Error creating validation record:', validationError)
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket validated successfully',
      ticket: validatedTicket,
    })
  } catch (error) {
    console.error('Error in ticket validation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
