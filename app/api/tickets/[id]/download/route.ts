/**
 * Ticket Download API Route
 * GET /api/tickets/[id]/download - Generate and download ticket PDF
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateQRCode } from '@/lib/qrcode'

export async function GET(
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
      // Call database function to generate QR data
      const { data: qrData } = await supabase.rpc('generate_ticket_qr_data', {
        ticket_id: ticketId,
      })
      qrCodeData = qrData || `TICKET:${ticket.ticket_number}:${ticket.attendee_email}`
      
      // Update ticket with QR code
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

    // Generate HTML for PDF (simple ticket design)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .ticket { border: 2px solid #000; padding: 30px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #8B5CF6; }
          .qr-code { text-align: center; margin: 20px 0; }
          .qr-code img { max-width: 200px; }
          .details { margin-top: 20px; }
          .details div { margin: 10px 0; padding: 10px; background: #f5f5f5; }
          .details strong { display: inline-block; width: 150px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1>SynergyCon 2.0</h1>
            <p>Your Event Ticket</p>
          </div>
          
          <div class="qr-code">
            <img src="${qrCodeImage}" alt="QR Code" />
            <p><strong>Ticket #${ticket.ticket_number}</strong></p>
          </div>
          
          <div class="details">
            <div><strong>Attendee:</strong> ${ticket.attendee_name}</div>
            <div><strong>Email:</strong> ${ticket.attendee_email}</div>
            <div><strong>Ticket Type:</strong> ${ticket.ticket_type.toUpperCase()}</div>
            <div><strong>Event Date:</strong> ${ticket.event_date}</div>
            <div><strong>Order ID:</strong> ${ticket.order_id}</div>
            <div><strong>Status:</strong> ${ticket.status.toUpperCase()}</div>
            ${ticket.seat_number ? `<div><strong>Seat:</strong> ${ticket.seat_number}</div>` : ''}
          </div>
          
          <div class="footer">
            <p>Please present this ticket at the event entrance</p>
            <p>Purchase Date: ${new Date(ticket.purchase_date).toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Return HTML content that can be converted to PDF on client side
    // Or use a library like puppeteer for server-side PDF generation
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="ticket-${ticket.ticket_number}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating ticket download:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
