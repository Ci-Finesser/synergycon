/**
 * Admin Payments Hook
 * 
 * Custom React hook for managing admin payment operations
 */

'use client'

import { useState, useCallback } from 'react'

interface AnalyticsResult {
  success: boolean
  data: any
  error?: string
}

interface PaymentsListResult {
  success: boolean
  payments: any[]
  pagination?: {
    total: number
    limit: number
    offset: number
    pages: number
  }
  error?: string
}

export function useAdminPayments() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch analytics data
   */
  const getAnalytics = useCallback(
    async (
      metric: 'overview' | 'tickets' | 'daily' | 'methods' | 'tiers',
      options?: {
        startDate?: string
        endDate?: string
      }
    ): Promise<AnalyticsResult> => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.append('metric', metric)
        if (options?.startDate) params.append('startDate', options.startDate)
        if (options?.endDate) params.append('endDate', options.endDate)

        const response = await fetch(`/api/admin/payments/analytics?${params}`)

        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }

        const data = await response.json()

        setLoading(false)
        return {
          success: data.success,
          data: data.data,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setLoading(false)
        return {
          success: false,
          data: null,
          error: message,
        }
      }
    },
    []
  )

  /**
   * Fetch payments list
   */
  const getPayments = useCallback(
    async (options?: {
      id?: string
      txRef?: string
      orderId?: string
      status?: string
      limit?: number
      offset?: number
    }): Promise<PaymentsListResult> => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (options?.id) params.append('id', options.id)
        if (options?.txRef) params.append('tx_ref', options.txRef)
        if (options?.orderId) params.append('order_id', options.orderId)
        if (options?.status) params.append('status', options.status)
        if (options?.limit) params.append('limit', options.limit.toString())
        if (options?.offset) params.append('offset', options.offset.toString())

        const response = await fetch(`/api/admin/payments?${params}`)

        if (!response.ok) {
          throw new Error('Failed to fetch payments')
        }

        const data = await response.json()

        setLoading(false)
        return {
          success: data.success,
          payments: data.payments,
          pagination: data.pagination,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setLoading(false)
        return {
          success: false,
          payments: [],
          error: message,
        }
      }
    },
    []
  )

  /**
   * Update payment status
   */
  const updatePayment = useCallback(
    async (
      paymentId: string,
      status: 'pending' | 'successful' | 'failed' | 'refunded',
      notes?: string
    ): Promise<{ success: boolean; message?: string; error?: string }> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/admin/payments', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId,
            status,
            notes,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update payment')
        }

        const data = await response.json()

        setLoading(false)
        return {
          success: data.success,
          message: data.message,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setLoading(false)
        return {
          success: false,
          error: message,
        }
      }
    },
    []
  )

  /**
   * Export payments
   */
  const exportPayments = useCallback(
    async (
      format: 'csv' | 'json',
      options?: {
        startDate?: string
        endDate?: string
        status?: string
      }
    ): Promise<{ success: boolean; error?: string }> => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.append('format', format)
        if (options?.startDate) params.append('startDate', options.startDate)
        if (options?.endDate) params.append('endDate', options.endDate)
        if (options?.status) params.append('status', options.status)

        const response = await fetch(`/api/admin/payments/export?${params}`)

        if (!response.ok) {
          throw new Error('Failed to export payments')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payments-${Date.now()}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setLoading(false)
        return { success: true }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setLoading(false)
        return {
          success: false,
          error: message,
        }
      }
    },
    []
  )

  return {
    loading,
    error,
    getAnalytics,
    getPayments,
    updatePayment,
    exportPayments,
  }
}
