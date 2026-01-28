/**
 * Ticket Transfer API Route
 * POST /api/tickets/[id]/transfer - Transfer ticket to another user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendTicketTransferEmail } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const ticketId = id
    const body = await req.json()
    const { to_email, reason } = body

    if (!to_email) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      )
    }

    // Fetch ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Check if ticket can be transferred
    if (ticket.status !== 'active') {
      return NextResponse.json(
        { error: `Cannot transfer ${ticket.status} ticket` },
        { status: 400 }
      )
    }

    if (ticket.validated_at) {
      return NextResponse.json(
        { error: 'Cannot transfer validated ticket' },
        { status: 400 }
      )
    }

    // Find recipient user by email
    const { data: recipientUser, error: recipientError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', to_email)
      .single()

    if (recipientError || !recipientUser) {
      return NextResponse.json(
        { error: 'Recipient user not found. They must be registered on the platform.' },
        { status: 404 }
      )
    }

    const recipientUserId = recipientUser.id

    // Create transfer record
    const { error: transferError } = await supabase
      .from('ticket_transfers')
      .insert({
        ticket_id: ticketId,
        from_user_id: user.id,
        to_user_id: recipientUserId,
        reason: reason || null,
      })

    if (transferError) {
      console.error('Error creating transfer record:', transferError)
      return NextResponse.json(
        { error: 'Failed to create transfer record' },
        { status: 500 }
      )
    }

    // Update ticket ownership
    const { data: transferredTicket, error: updateError } = await supabase
      .from('tickets')
      .update({
        user_id: recipientUserId,
        transferred_from: user.id,
        transferred_at: new Date().toISOString(),
        attendee_email: to_email,
      })
      .eq('id', ticketId)
      .select()
      .single()

    if (updateError) {
      console.error('Error transferring ticket:', updateError)
      return NextResponse.json(
        { error: 'Failed to transfer ticket' },
        { status: 500 }
      )
    }

    // Send notification email to recipient
    const recipientProfileResponse = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('user_id', recipientUserId)
      .single()

    const senderProfileResponse = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single()

    const recipientName = recipientProfileResponse.data?.full_name || to_email
    const senderName = senderProfileResponse.data?.full_name || user.email || 'Someone'

    const emailResult = await sendTicketTransferEmail(
      to_email,
      recipientName,
      senderName,
      transferredTicket.ticket_number || 'N/A',
      transferredTicket.ticket_type || 'Standard'
    )

    if (!emailResult.success) {
      console.warn(`[Ticket Transfer] Failed to send notification email: ${emailResult.error}`)
      // Continue anyway - transfer is complete
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket transferred successfully',
      ticket: transferredTicket,
    })
  } catch (error) {
    console.error('Error in ticket transfer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
