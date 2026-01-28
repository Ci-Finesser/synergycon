/**
 * Payment Export API Route
 * 
 * Exports payment data in various formats (CSV, JSON)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type {
  AdminPaymentExportRequest,
  AdminPaymentExportResponse,
  PaymentRecord,
} from '@/types/payment'

function convertToCSV(data: PaymentRecord[]): string {
  if (data.length === 0) return ''

  // Headers
  const headers = [
    'ID',
    'Order ID',
    'Tx Ref',
    'Flw Ref',
    'Amount',
    'Currency',
    'Status',
    'Payment Type',
    'Customer Email',
    'Customer Name',
    'Customer Phone',
    'Created At',
    'Verified At',
  ]

  // Data rows
  const rows = data.map(payment => [
    payment.id,
    payment.order_id,
    payment.tx_ref,
    payment.flw_ref || '',
    payment.amount,
    payment.currency,
    payment.status,
    payment.payment_type || '',
    payment.customer_email,
    payment.customer_name,
    payment.customer_phone,
    payment.created_at,
    payment.verified_at || '',
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  return csvContent
}

export async function GET(req: NextRequest): Promise<NextResponse<AdminPaymentExportResponse | { error: string }>> {
  try {
    // Check admin authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const exportRequest: AdminPaymentExportRequest = {
      format: (searchParams.get('format') || 'json') as 'csv' | 'json' | 'pdf',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      status: searchParams.get('status') as any || undefined,
    }

    const supabase = await createServerClient()
    let query = supabase.from('payments').select('*')

    // Apply filters
    if (exportRequest.startDate) {
      query = query.gte('created_at', new Date(exportRequest.startDate).toISOString())
    }
    if (exportRequest.endDate) {
      query = query.lte('created_at', new Date(exportRequest.endDate).toISOString())
    }
    if (exportRequest.status) {
      query = query.eq('status', exportRequest.status)
    }

    query = query.order('created_at', { ascending: false })

    const { data: payments, error } = await query

    if (error) {
      console.error('[Payment Export] Database error:', error)
      return NextResponse.json<AdminPaymentExportResponse>(
        { success: false, error: 'Failed to export payments' },
        { status: 500 }
      )
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json<AdminPaymentExportResponse>(
        { success: false, error: 'No payments found' },
        { status: 404 }
      )
    }

    if (exportRequest.format === 'csv') {
      const csv = convertToCSV(payments)

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="payments-${Date.now()}.csv"`,
        },
      })
    } else if (exportRequest.format === 'json') {
      // JSON format
      return new NextResponse(JSON.stringify(payments, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="payments-${Date.now()}.json"`,
        },
      })
    } else {
      return NextResponse.json<AdminPaymentExportResponse>(
        { success: false, error: 'Unsupported export format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[Payment Export] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
