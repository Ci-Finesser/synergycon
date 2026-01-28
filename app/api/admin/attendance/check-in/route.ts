import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { verifyTicketQRData } from '@/lib/qrcode'
import { createAuditLog } from '@/lib/audit'

const schema = z.object({
  qrData: z.string(),
  location: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminSession()

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { qrData, location, notes } = schema.parse(body)

    // Verify QR code
    const verification = verifyTicketQRData(qrData)

    if (!verification.valid) {
      return NextResponse.json({ error: verification.error }, { status: 400 })
    }

    const ticketData = verification.data!
    const supabase = createAdminClient()

    // Get ticket with user info
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_orders!inner (
          customer_name,
          customer_email
        )
      `)
      .eq('id', ticketData.ticket_id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
      return NextResponse.json({ error: 'Ticket is not valid' }, { status: 400 })
    }

    // Check for duplicate check-in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: existingCheckin } = await supabase
      .from('attendance_records')
      .select('id, check_in_time')
      .eq('ticket_id', ticket.id)
      .gte('check_in_time', today.toISOString())
      .is('check_out_time', null)
      .single()

    if (existingCheckin) {
      return NextResponse.json({
        error: 'Already checked in',
        checkInTime: existingCheckin.check_in_time,
        attendee: {
          name: ticket.ticket_orders?.customer_name,
          email: ticket.ticket_orders?.customer_email,
          ticketType: ticket.ticket_type,
        },
      }, { status: 400 })
    }

    // Create attendance record
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance_records')
      .insert({
        ticket_id: ticket.id,
        user_id: ticket.user_id,
        event_day: today.toISOString().split('T')[0],
        checked_in_by: admin.id,
        entry_point: location,
        notes,
      })
      .select()
      .single()

    if (attendanceError) {
      console.error('Check-in error:', attendanceError)
      return NextResponse.json({ error: 'Failed to check in' }, { status: 500 })
    }

    // Update ticket status
    await supabase
      .from('tickets')
      .update({
        status: 'used',
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        checked_in_by: admin.id,
      })
      .eq('id', ticket.id)

    await createAuditLog({
      actorId: admin.id,
      actorType: 'admin',
      actorEmail: admin.email,
      action: 'ticket.check_in',
      resourceType: 'ticket',
      resourceId: ticket.id,
      details: {
        ticketNumber: ticket.ticket_number,
        attendeeName: ticket.ticket_orders?.customer_name,
        location,
      },
    })

    return NextResponse.json({
      success: true,
      attendee: {
        name: ticket.ticket_orders?.customer_name || 'Unknown',
        email: ticket.ticket_orders?.customer_email,
        ticketType: ticket.ticket_type,
        ticketNumber: ticket.ticket_number,
      },
      checkInTime: attendance.check_in_time,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
