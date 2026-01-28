/**
 * Ticket Email API Route
 * POST /api/tickets/[id]/email - Email ticket to attendee
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateQRCode } from '@/lib/qrcode'
import { getResend, isResendConfigured } from '@/lib/resend'

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

    // Generate QR code if not exists
    let qrCodeData = ticket.qr_code
    if (!qrCodeData) {
      const { data: qrData } = await supabase.rpc('generate_ticket_qr_data', {
        ticket_id: ticketId,
      })
      qrCodeData = qrData || `TICKET:${ticket.ticket_number}:${ticket.attendee_email}`
      
      await supabase
        .from('tickets')
        .update({ qr_code: qrCodeData })
        .eq('id', ticketId)
    }

    // Generate QR code image
    const qrCodeImage = await generateQRCode(qrCodeData, {
      width: 300,
      margin: 2,
    })

    // Send email via Resend
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">SynergyCon 2.0</h1>
          <p style="color: white; margin: 10px 0 0 0;">Your Event Ticket</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Hi ${ticket.attendee_name},</p>
          <p>Your ticket for SynergyCon 2.0 is ready! Please find your ticket details below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="${qrCodeImage}" alt="QR Code" style="max-width: 200px;" />
            <p style="font-size: 18px; font-weight: bold; margin-top: 10px;">Ticket #${ticket.ticket_number}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <p><strong>Ticket Type:</strong> ${ticket.ticket_type.toUpperCase()}</p>
            <p><strong>Event Date:</strong> ${ticket.event_date}</p>
            <p><strong>Order ID:</strong> ${ticket.order_id}</p>
            <p><strong>Status:</strong> ${ticket.status.toUpperCase()}</p>
            ${ticket.seat_number ? `<p><strong>Seat Number:</strong> ${ticket.seat_number}</p>` : ''}
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #FFF3CD; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px;">
              <strong>Important:</strong> Please present this QR code at the event entrance for check-in.
            </p>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; background: #333; color: white; font-size: 12px;">
          <p>Purchase Date: ${new Date(ticket.purchase_date).toLocaleDateString()}</p>
          <p>For questions or support, contact us at support@synergycon.live</p>
        </div>
      </div>
    `

    // Check if Resend is configured before attempting to send
    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 503 }
      )
    }

    const resend = getResend()
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'SynergyCon <tickets@synergycon.live>',
      to: ticket.attendee_email,
      subject: `Your SynergyCon 2.0 Ticket - ${ticket.ticket_number}`,
      html: emailHtml,
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket emailed successfully',
      emailId: emailData?.id,
    })
  } catch (error) {
    console.error('Error in ticket email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
