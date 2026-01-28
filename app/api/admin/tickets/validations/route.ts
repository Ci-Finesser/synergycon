/**
 * Admin Ticket Validation History API
 * View validation history and statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { TicketValidation, ValidationStats } from '@/types/ticket'

/**
 * GET /api/admin/tickets/validations
 * Get validation history with filters
 */
export async function GET(req: NextRequest) {
  try {
    // Check admin authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerClient()
    const { searchParams } = new URL(req.url)

    // Get query parameters
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const ticketNumber = searchParams.get('ticket_number')
    const orderId = searchParams.get('order_id')
    const date = searchParams.get('date')

    // Build query
    let query = supabase
      .from('ticket_validations')
      .select('*', { count: 'exact' })
      .order('validated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (ticketNumber) {
      query = query.eq('ticket_number', ticketNumber)
    }

    if (orderId) {
      query = query.eq('order_id', orderId)
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      query = query
        .gte('validated_at', startDate.toISOString())
        .lt('validated_at', endDate.toISOString())
    }

    const { data: validations, error, count } = await query

    if (error) {
      console.error('[Validations] Query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch validations' },
        { status: 500 }
      )
    }

    // Get statistics
    const { data: stats } = await supabase.from('validation_stats').select('*')

    return NextResponse.json({
      success: true,
      validations: validations || [],
      total: count || 0,
      stats: stats || [],
    })
  } catch (error) {
    console.error('[Validations] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
