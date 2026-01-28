/**
 * Ticket QR Code API Route
 * GET /api/tickets/[id]/qr - Generate or refresh QR code
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateQRCode, generateQRCodeBuffer } from '@/lib/qrcode'

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
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json' // json or image

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

    // Generate or refresh QR code data
    const { data: qrData } = await supabase.rpc('generate_ticket_qr_data', {
      ticket_id: ticketId,
    })

    const qrCodeData = qrData || `TICKET:${ticket.ticket_number}:${ticket.attendee_email}:${ticket.event_date}`

    // Update ticket with new QR code
    await supabase
      .from('tickets')
      .update({ qr_code: qrCodeData })
      .eq('id', ticketId)

    // Return based on format
    if (format === 'image') {
      // Generate QR code image as PNG buffer
      const qrBuffer = await generateQRCodeBuffer(qrCodeData, {
        width: 400,
        margin: 2,
      })

      return new NextResponse(new Blob([qrBuffer as BlobPart]), {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `inline; filename="ticket-${ticket.ticket_number}-qr.png"`,
        },
      })
    } else {
      // Return data URL for embedding
      const qrDataUrl = await generateQRCode(qrCodeData, {
        width: 400,
        margin: 2,
      })

      return NextResponse.json({
        success: true,
        qr_code: qrCodeData,
        qr_image: qrDataUrl,
        ticket_number: ticket.ticket_number,
      })
    }
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
