/**
 * Team Purchase API Route
 * POST /api/tickets/purchase-team - Purchase tickets for team members
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'
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
    const { members, ticket_type, order_id } = body

    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: 'Team members array is required' },
        { status: 400 }
      )
    }

    if (!ticket_type || !order_id) {
      return NextResponse.json(
        { error: 'Ticket type and order ID are required' },
        { status: 400 }
      )
    }

    // Validate ticket type is enterprise
    if (ticket_type !== 'enterprise') {
      return NextResponse.json(
        { error: 'Team purchase is only available for enterprise tickets' },
        { status: 400 }
      )
    }

    const createdTickets: any[] = []
    const createdMembers: any[] = []

    // Create tickets and team members
    for (const member of members) {
      const ticketNumber = `SYN2-${randomBytes(6).toString('hex').toUpperCase()}`

      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          order_id,
          user_id: user.id,
          ticket_type: 'enterprise',
          status: 'active',
          attendee_name: member.name,
          attendee_email: member.email,
          ticket_number: ticketNumber,
          event_date: 'March 20-22, 2026',
          price: 0, // Enterprise tickets are part of package
          metadata: {
            team_purchase: true,
            purchased_for: user.id,
          },
        })
        .select()
        .single()

      if (ticketError) {
        console.error('Error creating ticket:', ticketError)
        continue
      }

      createdTickets.push(ticket)

      // Create team member record
      const { data: teamMember, error: memberError } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          name: member.name,
          email: member.email,
          ticket_id: ticket.id,
          status: 'sent',
        })
        .select()
        .single()

      if (memberError) {
        console.error('Error creating team member:', memberError)
        continue
      }

      createdMembers.push(teamMember)

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
        'Enterprise Access'
      )

      if (!emailResult.success) {
        console.warn(`[Team Purchase] Failed to send email to ${member.email}: ${emailResult.error}`)
        // Continue anyway - ticket is created
      }
    }

    if (createdTickets.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create tickets' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'team_tickets_purchased',
      endpoint: req.url,
      details: `Team purchase: ${createdTickets.length} tickets created by ${user.email}`,
    })

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdTickets.length} tickets`,
      tickets: createdTickets,
      teamMembers: createdMembers,
    })
  } catch (error) {
    console.error('Error in team purchase:', error)

    logSecurityEvent({
      type: 'api_handler_exception',
      endpoint: req.url,
      details: `Team purchase error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
