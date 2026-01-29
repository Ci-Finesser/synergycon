/**
 * Admin Tickets API
 * Manage ticket types for the event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logSecurityEvent } from '@/lib/security-logger'
import { verifyAdminSession, createUnauthorizedResponse } from '@/lib/admin-auth'
import type {
  AdminTicketListResponse,
  AdminTicketResponse,
  TicketCreateRequest,
  TicketUpdateRequest,
  TicketType,
} from '@/types/ticket'

/**
 * GET /api/admin/tickets
 * List all tickets with optional filters
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<AdminTicketListResponse | { error: string }>> {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return createUnauthorizedResponse('Invalid admin session')
    }

    const supabase = await createServerClient()
    const { searchParams } = new URL(req.url)

    // Build query
    let query = supabase.from('ticket_types').select('*', { count: 'exact' })

    // Apply filters
    const category = searchParams.get('category')
    if (category) {
      query = query.eq('category', category)
    }

    const duration = searchParams.get('duration')
    if (duration) {
      query = query.eq('duration', duration)
    }

    const isActive = searchParams.get('is_active')
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const search = searchParams.get('search')
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Order by display_order
    query = query.order('display_order', { ascending: true })

    const { data: tickets, error, count } = await query

    if (error) {
      console.error('[Admin Tickets] Query error:', error)
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }

    logSecurityEvent({
      type: 'payment_admin_query',
      endpoint: '/api/admin/tickets',
      details: 'Admin queried tickets list',
    })

    return NextResponse.json<AdminTicketListResponse>({
      success: true,
      tickets: tickets || [],
      total: count || 0,
    })
  } catch (error) {
    console.error('[Admin Tickets] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/tickets
 * Create a new ticket type
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<AdminTicketResponse>> {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerClient()
    const body: TicketCreateRequest = await req.json()

    // Validate required fields
    if (!body.ticket_id || !body.name || body.price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert ticket
    const { data: ticket, error } = await supabase
      .from('ticket_types')
      .insert([
        {
          ticket_id: body.ticket_id,
          name: body.name,
          description: body.description || null,
          price: body.price,
          benefits: body.benefits || [],
          available_quantity: body.available_quantity || null,
          category: body.category || null,
          duration: body.duration || null,
          display_order: body.display_order || 0,
          valid_from: body.valid_from || null,
          valid_until: body.valid_until || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('[Admin Tickets] Create error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create ticket' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'payment_admin_update',
      endpoint: '/api/admin/tickets',
      details: `Created ticket: ${body.name}`,
    })

    return NextResponse.json<AdminTicketResponse>({
      success: true,
      ticket: ticket as TicketType,
    })
  } catch (error) {
    console.error('[Admin Tickets] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/tickets
 * Update an existing ticket type
 */
export async function PATCH(
  req: NextRequest
): Promise<NextResponse<AdminTicketResponse>> {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerClient()
    const body: TicketUpdateRequest = await req.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
        { status: 400 }
      )
    }

    // Build update object
    const updates: any = {}
    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.price !== undefined) updates.price = body.price
    if (body.benefits !== undefined) updates.benefits = body.benefits
    if (body.available_quantity !== undefined)
      updates.available_quantity = body.available_quantity
    if (body.is_active !== undefined) updates.is_active = body.is_active
    if (body.category !== undefined) updates.category = body.category
    if (body.duration !== undefined) updates.duration = body.duration
    if (body.display_order !== undefined) updates.display_order = body.display_order
    if (body.valid_from !== undefined) updates.valid_from = body.valid_from
    if (body.valid_until !== undefined) updates.valid_until = body.valid_until

    const { data: ticket, error } = await supabase
      .from('ticket_types')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('[Admin Tickets] Update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update ticket' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'payment_admin_update',
      endpoint: '/api/admin/tickets',
      details: `Updated ticket: ${body.id}`,
    })

    return NextResponse.json<AdminTicketResponse>({
      success: true,
      ticket: ticket as TicketType,
    })
  } catch (error) {
    console.error('[Admin Tickets] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/tickets
 * Delete a ticket type
 */
export async function DELETE(
  req: NextRequest
): Promise<NextResponse<AdminTicketResponse>> {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession()
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerClient()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('ticket_types').delete().eq('id', id)

    if (error) {
      console.error('[Admin Tickets] Delete error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete ticket' },
        { status: 500 }
      )
    }

    logSecurityEvent({
      type: 'payment_admin_update',
      endpoint: '/api/admin/tickets',
      details: `Deleted ticket: ${id}`,
    })

    return NextResponse.json<AdminTicketResponse>({
      success: true,
    })
  } catch (error) {
    console.error('[Admin Tickets] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
