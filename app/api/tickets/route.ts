/**
 * Public Tickets API
 * Retrieve available ticket types for registration
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { PublicTicket } from '@/types/ticket'

/**
 * GET /api/tickets
 * Get all active tickets for public registration
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<{ success: boolean; tickets: PublicTicket[] }>> {
  try {
    const supabase = await createServerClient()

    // Fetch from public_tickets view
    const { data: tickets, error } = await supabase
      .from('public_tickets')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[Public Tickets] Query error:', error)
      return NextResponse.json(
        { success: false, tickets: [] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tickets: tickets || [],
    })
  } catch (error) {
    console.error('[Public Tickets] Error:', error)
    return NextResponse.json(
      { success: false, tickets: [] },
      { status: 500 }
    )
  }
}
