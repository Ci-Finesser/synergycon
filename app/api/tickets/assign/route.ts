/**
 * Ticket Assignment API Route
 * POST /api/tickets/assign - Assign ticket to team member
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendTeamTicketPurchaseEmail } from '@/lib/email'
import { logSecurityEvent } from '@/lib/security-logger'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { memberId, ticketId } = body

    if (!memberId || !ticketId) {
      return NextResponse.json(
        { error: 'Member ID and Ticket ID are required' },
        { status: 400 }
      )
    }

    // Verify team member belongs to user
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    // Verify ticket belongs to user
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

    // Check if ticket is already assigned
    const { data: existingAssignment } = await supabase
      .from('team_members')
      .select('*')
      .eq('ticket_id', ticketId)
      .single()

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Ticket already assigned' },
        { status: 400 }
      )
    }

    // Assign ticket to team member
    const { data: updatedMember, error: updateError } = await supabase
      .from('team_members')
      .update({
        ticket_id: ticketId,
        status: 'sent',
      })
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      console.error('Error assigning ticket:', updateError)
      return NextResponse.json(
        { error: 'Failed to assign ticket' },
        { status: 500 }
      )
    }

    // Send email notification to team member
    const organizerProfile = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single()

    const organizerName = organizerProfile.data?.full_name || user.email || 'Your team organizer'

    const emailResult = await sendTeamTicketPurchaseEmail(
      member.email,
      member.name,
      organizerName,
      ticket.ticket_type || 'Ticket'
    )

    if (!emailResult.success) {
      console.warn(`[Ticket Assign] Failed to send email to ${member.email}: ${emailResult.error}`)
      // Continue anyway - assignment is complete
    }

    logSecurityEvent({
      type: 'ticket_assigned',
      endpoint: req.url,
      details: `Ticket ${ticketId} assigned to ${member.email} by ${user.email}`,
    })

    return NextResponse.json({
      success: true,
      member: updatedMember,
    })
  } catch (error) {
    console.error('Error in ticket assignment:', error)

    logSecurityEvent({
      type: 'api_handler_exception',
      endpoint: req.url,
      details: `Ticket assignment error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
