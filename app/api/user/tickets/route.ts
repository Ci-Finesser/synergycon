/**
 * User Tickets API Route
 * GET /api/user/tickets - Fetch all tickets for the current user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // Filter by status
    const orderBy = searchParams.get('orderBy') || 'purchase_date'
    const order = searchParams.get('order') || 'desc'

    // Build query
    let query = supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply ordering
    query = query.order(orderBy, { ascending: order === 'asc' })

    const { data: tickets, error: ticketsError } = await query

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tickets: tickets || [],
    })
  } catch (error) {
    console.error('Error in tickets fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
