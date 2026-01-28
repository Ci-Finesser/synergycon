/**
 * Admin Ticket Statistics API
 * Get ticket analytics and statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { TicketStats } from '@/types/ticket'

/**
 * GET /api/admin/tickets/stats
 * Get ticket statistics and analytics
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<{ success: boolean; stats?: TicketStats; error?: string }>> {
  try {
    // Check admin authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerClient()

    // Fetch all tickets
    const { data: tickets, error } = await supabase
      .from('ticket_types')
      .select('*')

    if (error) {
      console.error('[Ticket Stats] Query error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch ticket statistics' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const stats: TicketStats = {
      total_tickets: tickets?.length || 0,
      active_tickets: tickets?.filter(t => t.is_active).length || 0,
      inactive_tickets: tickets?.filter(t => !t.is_active).length || 0,
      total_revenue_potential: tickets
        ?.filter(t => t.is_active && t.available_quantity)
        .reduce((sum, t) => sum + (t.price * (t.available_quantity || 0)), 0) || 0,
      total_sold: tickets?.reduce((sum, t) => sum + t.sold_quantity, 0) || 0,
      total_available: tickets
        ?.filter(t => t.available_quantity !== null)
        .reduce((sum, t) => sum + ((t.available_quantity || 0) - t.sold_quantity), 0) || 0,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('[Ticket Stats] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
