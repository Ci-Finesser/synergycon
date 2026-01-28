/**
 * Payment Management API Route
 * 
 * Handles payment status updates, refunds, and other admin operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logSecurityEvent } from '@/lib/security-logger'
import type {
  AdminPaymentUpdateRequest,
  AdminPaymentListResponse,
  AdminPaymentUpdateResponse,
  AdminPaymentQueryParams,
} from '@/types/payment'

export async function GET(req: NextRequest): Promise<NextResponse<AdminPaymentListResponse | { error: string }>> {
  try {
    // Check admin authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const params: AdminPaymentQueryParams = {
      paymentId: searchParams.get('id') || undefined,
      txRef: searchParams.get('tx_ref') || undefined,
      orderId: searchParams.get('order_id') || undefined,
      status: searchParams.get('status') as any || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    const supabase = await createServerClient()
    let query = supabase.from('payments').select('*', { count: 'exact' })

    // Apply filters
    if (params.paymentId) {
      query = query.eq('id', params.paymentId)
    }
    if (params.txRef) {
      query = query.eq('tx_ref', params.txRef)
    }
    if (params.orderId) {
      query = query.eq('order_id', params.orderId)
    }
    if (params.status) {
      query = query.eq('status', params.status)
    }

    // Apply pagination
    query = query.order('created_at', { ascending: false }).range(params.offset!, params.offset! + params.limit! - 1)

    const { data, count, error } = await query

    if (error) {
      console.error('[Payment Management] Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    return NextResponse.json<AdminPaymentListResponse>({
      success: true,
      payments: data || [],
      pagination: {
        total: count || 0,
        limit: params.limit!,
        offset: params.offset!,
        pages: count ? Math.ceil(count / params.limit!) : 0,
      },
    })
  } catch (error) {
    console.error('[Payment Management] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse<AdminPaymentUpdateResponse | { error: string }>> {
  try {
    // Check admin authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: AdminPaymentUpdateRequest = await req.json()

    if (!body.paymentId) {
      return NextResponse.json<AdminPaymentUpdateResponse>(
        { success: false, error: 'Missing payment ID' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (body.status) {
      updateData.status = body.status

      if (body.status === 'refunded') {
        updateData.refunded_at = new Date().toISOString()
      }
    }

    if (body.notes) {
      updateData.admin_notes = body.notes
    }

    // Update payment
    const { error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', body.paymentId)

    if (updateError) {
      console.error('[Payment Management] Update error:', updateError)
      return NextResponse.json<AdminPaymentUpdateResponse>(
        { success: false, error: 'Failed to update payment' },
        { status: 500 }
      )
    }

    // Log security event
    logSecurityEvent({
      type: 'payment_admin_update',
      endpoint: '/api/admin/payments',
      details: `Payment ${body.paymentId} updated to ${body.status} by admin ${body.adminId}`,
    })

    return NextResponse.json<AdminPaymentUpdateResponse>({
      success: true,
    })
  } catch (error) {
    console.error('[Payment Management] Error:', error)
    return NextResponse.json<AdminPaymentUpdateResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
