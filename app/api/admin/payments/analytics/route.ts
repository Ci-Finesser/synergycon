/**
 * Payment Analytics API Route
 * 
 * Provides payment statistics and analytics for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type {
  PaymentStats,
  TicketStats,
  DailyRevenue,
  PaymentMethodStats,
  PaymentAnalytics,
  PaymentRecord,
} from '@/types/payment'
import type { TicketTier } from '@/types/user'

export async function GET(req: NextRequest): Promise<NextResponse<PaymentAnalytics | { error: string }>> {
  try {
    // Check admin authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerClient()
    const { searchParams } = new URL(req.url)
    const metric = searchParams.get('metric') || 'overview'
    const startDate = searchParams.get('startDate') ?? undefined
    const endDate = searchParams.get('endDate') ?? undefined

    let query = supabase.from('payments').select('*')

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString())
    }
    if (endDate) {
      query = query.lte('created_at', new Date(endDate).toISOString())
    }

    const { data: payments, error } = await query

    if (error) {
      console.error('[Payment Analytics] Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json<PaymentAnalytics>({
        success: true,
        metric: metric as any,
        data: getEmptyStats(),
        period: { startDate, endDate },
      })
    }

    let analyticsData: PaymentAnalytics

    switch (metric) {
      case 'overview':
        analyticsData = {
          success: true,
          metric: 'overview',
          data: calculateOverviewStats(payments),
          period: { startDate, endDate },
        }
        break

      case 'tickets':
        analyticsData = {
          success: true,
          metric: 'tickets',
          data: calculateTicketStats(payments),
          period: { startDate, endDate },
        }
        break

      case 'daily':
        analyticsData = {
          success: true,
          metric: 'daily',
          data: calculateDailyRevenue(payments),
          period: { startDate, endDate },
        }
        break

      case 'methods':
        analyticsData = {
          success: true,
          metric: 'methods',
          data: calculatePaymentMethods(payments),
          period: { startDate, endDate },
        }
        break

      case 'tiers':
        analyticsData = {
          success: true,
          metric: 'tiers',
          data: calculateTierStats(payments),
          period: { startDate, endDate },
        }
        break

      default:
        return NextResponse.json<PaymentAnalytics>(
          {
            success: true,
            metric: 'overview',
            data: getEmptyStats(),
            period: { startDate, endDate },
          },
          { status: 400 }
        )
    }

    return NextResponse.json<PaymentAnalytics>(analyticsData)
  } catch (error) {
    console.error('[Payment Analytics] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getEmptyStats() {
  return {
    totalRevenue: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0,
    averageTransactionValue: 0,
    successRate: 0,
  }
}

function calculateOverviewStats(payments: any[]): PaymentStats {
  const successful = payments.filter(p => p.status === 'successful')
  const failed = payments.filter(p => p.status === 'failed')
  const pending = payments.filter(p => p.status === 'pending')

  const totalRevenue = successful.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalTransactions = payments.length
  const successfulTransactions = successful.length
  const failedTransactions = failed.length
  const pendingTransactions = pending.length
  const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  return {
    totalRevenue,
    totalTransactions,
    successfulTransactions,
    failedTransactions,
    pendingTransactions,
    averageTransactionValue,
    successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0,
  }
}

/**
 * Derive ticket tier from ticket ID
 */
function deriveTicketTier(ticketId: string): TicketTier {
  const id = ticketId.toLowerCase()
  if (id.includes('priority')) return 'priority'
  if (id.includes('vvip')) return 'vvip'
  if (id.includes('vip-plus') || id.includes('vip_plus')) return 'vip-plus'
  return 'vip' // Default to VIP tier
}

function calculateTicketStats(payments: any[]): TicketStats[] {
  const ticketMap = new Map<string, { quantity: number; revenue: number }>()
  const successful = payments.filter(p => p.status === 'successful')
  const totalRevenue = successful.reduce((sum, p) => sum + (p.amount || 0), 0)

  successful.forEach(payment => {
    if (payment.meta && Array.isArray(payment.meta.tickets)) {
      payment.meta.tickets.forEach((ticket: any) => {
        const key = ticket.ticket_id
        const current = ticketMap.get(key) || { quantity: 0, revenue: 0 }
        ticketMap.set(key, {
          quantity: current.quantity + (ticket.quantity || 0),
          revenue: current.revenue + (ticket.subtotal || 0),
        })
      })
    }
  })

  return Array.from(ticketMap.entries()).map(([id, data]) => ({
    ticketType: id,
    ticketTier: deriveTicketTier(id),
    quantity: data.quantity,
    revenue: data.revenue,
    percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
  })) as TicketStats[]
}

function calculateDailyRevenue(payments: any[]): DailyRevenue[] {
  const dailyMap = new Map<string, { revenue: number; count: number; successfulCount: number }>()

  payments.forEach(payment => {
    const date = new Date(payment.created_at).toISOString().split('T')[0]
    const current = dailyMap.get(date) || { revenue: 0, count: 0, successfulCount: 0 }

    dailyMap.set(date, {
      revenue: current.revenue + (payment.status === 'successful' ? (payment.amount || 0) : 0),
      count: current.count + 1,
      successfulCount: current.successfulCount + (payment.status === 'successful' ? 1 : 0),
    })
  })

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      count: data.count,
      successfulCount: data.successfulCount,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function calculatePaymentMethods(payments: any[]): any[] {
  const methodMap = new Map<string, { count: number; amount: number }>()
  const successful = payments.filter(p => p.status === 'successful')
  const totalAmount = successful.reduce((sum, p) => sum + (p.amount || 0), 0)

  successful.forEach(payment => {
    const method = payment.payment_type || 'unknown'
    const current = methodMap.get(method) || { count: 0, amount: 0 }
    methodMap.set(method, {
      count: current.count + 1,
      amount: current.amount + (payment.amount || 0),
    })
  })

  return Array.from(methodMap.entries()).map(([method, data]) => ({
    paymentType: method,
    count: data.count,
    totalAmount: data.amount,
    percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
  }))
}

function calculateTierStats(payments: any[]): any[] {
  const tierMap = new Map<string, { quantity: number; revenue: number; count: number }>()
  const successful = payments.filter(p => p.status === 'successful')
  const totalRevenue = successful.reduce((sum, p) => sum + (p.amount || 0), 0)

  successful.forEach(payment => {
    if (payment.meta && Array.isArray(payment.meta.tickets)) {
      payment.meta.tickets.forEach((ticket: any) => {
        const tier = ticket.ticket_tier || 'standard'
        const current = tierMap.get(tier) || { quantity: 0, revenue: 0, count: 0 }
        tierMap.set(tier, {
          quantity: current.quantity + (ticket.quantity || 0),
          revenue: current.revenue + (ticket.subtotal || 0),
          count: current.count + 1,
        })
      })
    }
  })

  return Array.from(tierMap.entries()).map(([tier, data]) => ({
    tier,
    quantity: data.quantity,
    revenue: data.revenue,
    orderCount: data.count,
    percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
  }))
}
