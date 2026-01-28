/**
 * Payment Modal Component
 * 
 * Modal for displaying payment status and instructions
 */

'use client'

import type React from 'react'
import { useEffect } from 'react'
import { X, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  state: 'initializing' | 'pending' | 'verifying' | 'success' | 'error'
  paymentLink?: string | null
  errorMessage?: string | null
  onRetry?: () => void
  onVerify?: () => void
}

export function PaymentModal({
  isOpen,
  onClose,
  state,
  paymentLink,
  errorMessage,
  onRetry,
  onVerify,
}: PaymentModalProps) {
  // Auto-open payment link when available
  useEffect(() => {
    if (paymentLink && state === 'pending') {
      const timer = setTimeout(() => {
        window.open(paymentLink, '_blank', 'noopener,noreferrer')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [paymentLink, state])

  const renderContent = () => {
    switch (state) {
      case 'initializing':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-xl font-semibold mb-2">Initializing Payment</h3>
            <p className="text-muted-foreground">
              Please wait while we set up your payment...
            </p>
          </div>
        )

      case 'pending':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Complete Your Payment</h3>
            <p className="text-muted-foreground mb-6">
              A payment window has been opened. Please complete your payment there.
            </p>
            {paymentLink && (
              <div className="space-y-3">
                <Button
                  onClick={() => window.open(paymentLink, '_blank', 'noopener,noreferrer')}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Payment Window
                </Button>
                {onVerify && (
                  <Button
                    onClick={onVerify}
                    variant="outline"
                    className="w-full"
                  >
                    I've Completed Payment
                  </Button>
                )}
              </div>
            )}
          </div>
        )

      case 'verifying':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-xl font-semibold mb-2">Verifying Payment</h3>
            <p className="text-muted-foreground">
              Please wait while we verify your payment...
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-6">
              Your payment has been processed successfully. You will receive a confirmation email shortly.
            </p>
            <Button onClick={onClose} className="w-full">
              Continue
            </Button>
          </div>
        )

      case 'error':
        return (
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
            <p className="text-muted-foreground mb-6">
              {errorMessage || 'An error occurred while processing your payment. Please try again.'}
            </p>
            <div className="space-y-3">
              {onRetry && (
                <Button onClick={onRetry} className="w-full">
                  Try Again
                </Button>
              )}
              <Button onClick={onClose} variant="outline" className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Payment Status</DialogTitle>
          <DialogDescription className="sr-only">
            Current payment status and actions
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
