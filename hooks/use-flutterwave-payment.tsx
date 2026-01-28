/**
 * Flutterwave Payment Hook
 * 
 * Custom React hook for handling Flutterwave payments
 */

'use client'

import { useState, useCallback } from 'react'
import { generateCSRFToken } from '@/lib/csrf-client'
import type {
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
  PaymentStatusResponse,
  PaymentHookState,
  PaymentInitResult,
  PaymentVerifyResult,
  PaymentStatusResult,
} from '@/types/payment'

export interface PaymentData {
  orderId: string
  amount: number
  customer: {
    email: string
    name: string
    phone: string
  }
  meta?: Record<string, any>
}

export interface PaymentState {
  isInitializing: boolean
  isVerifying: boolean
  isSuccess: boolean
  isError: boolean
  errorMessage: string | null
  paymentLink: string | null
  txRef: string | null
}

export function useFlutterwavePayment() {
  const [state, setState] = useState<PaymentHookState>({
    isInitializing: false,
    isVerifying: false,
    isSuccess: false,
    isError: false,
    errorMessage: null,
    paymentLink: null,
    txRef: null,
  })

  /**
   * Initialize payment
   */
  const initializePayment = useCallback(async (paymentData: PaymentInitRequest): Promise<PaymentInitResult> => {
    setState((prev) => ({
      ...prev,
      isInitializing: true,
      isError: false,
      errorMessage: null,
    }))

    try {
      // Generate CSRF token
      const csrfToken = await generateCSRFToken()

      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentData,
          _csrf: csrfToken,
          _formStartTime: Date.now(),
        }),
      })

      const data: PaymentInitResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      setState((prev) => ({
        ...prev,
        isInitializing: false,
        paymentLink: data.payment_link || null,
        txRef: data.tx_ref || null,
      }))

      // Open payment link in new window
      if (data.payment_link) {
        window.open(data.payment_link, '_blank', 'noopener,noreferrer')
      }

      return {
        success: true,
        paymentLink: data.payment_link,
        txRef: data.tx_ref,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed'
      
      setState((prev) => ({
        ...prev,
        isInitializing: false,
        isError: true,
        errorMessage,
      }))

      return {
        success: false,
        error: errorMessage,
      }
    }
  }, [])

  /**
   * Verify payment
   */
  const verifyPayment = useCallback(async (transactionId: string, txRef: string): Promise<PaymentVerifyResult> => {
    setState((prev) => ({
      ...prev,
      isVerifying: true,
      isError: false,
      errorMessage: null,
    }))

    try {
      // Generate CSRF token
      const csrfToken = await generateCSRFToken()

      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          txRef,
          _csrf: csrfToken,
          _formStartTime: Date.now(),
        }),
      })

      const data: PaymentVerifyResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment verification failed')
      }

      setState((prev) => ({
        ...prev,
        isVerifying: false,
        isSuccess: data.verified || false,
        isError: !data.verified,
        errorMessage: !data.verified ? 'Payment verification failed' : null,
      }))

      return {
        success: true,
        verified: data.verified,
        status: data.status,
        orderId: data.order_id,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment verification failed'
      
      setState((prev) => ({
        ...prev,
        isVerifying: false,
        isError: true,
        errorMessage,
      }))

      return {
        success: false,
        verified: false,
        error: errorMessage,
      }
    }
  }, [])

  /**
   * Check payment status
   */
  const checkPaymentStatus = useCallback(async (txRef: string): Promise<PaymentStatusResult> => {
    try {
      const response = await fetch(`/api/payments/verify?tx_ref=${encodeURIComponent(txRef)}`)
      const data: PaymentStatusResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to check payment status')
      }

      return {
        success: true,
        payment: data.payment,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check payment status'
      return {
        success: false,
        error: errorMessage,
      }
    }
  }, [])

  /**
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setState({
      isInitializing: false,
      isVerifying: false,
      isSuccess: false,
      isError: false,
      errorMessage: null,
      paymentLink: null,
      txRef: null,
    })
  }, [])

  return {
    ...state,
    initializePayment,
    verifyPayment,
    checkPaymentStatus,
    resetPayment,
  }
}
