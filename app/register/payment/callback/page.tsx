/**
 * Payment Callback Page
 * 
 * Handles redirect from Flutterwave after payment
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFlutterwavePayment } from '@/hooks/use-flutterwave-payment'

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { verifyPayment } = useFlutterwavePayment()
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed' | 'cancelled'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      // Get parameters from URL
      const transactionId = searchParams.get('transaction_id')
      const txRef = searchParams.get('tx_ref')
      const paymentStatus = searchParams.get('status')

      // Check if payment was cancelled
      if (paymentStatus === 'cancelled') {
        setStatus('cancelled')
        setMessage('Payment was cancelled')
        return
      }

      // Validate required parameters
      if (!transactionId || !txRef) {
        setStatus('failed')
        setMessage('Invalid payment callback parameters')
        return
      }

      try {
        // Verify payment
        const result = await verifyPayment(transactionId, txRef)

        if (result.success && result.verified) {
          setStatus('success')
          setMessage('Payment verified successfully!')
          
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            router.push(`/register/success?order_id=${result.orderId}`)
          }, 2000)
        } else {
          setStatus('failed')
          setMessage(result.error || 'Payment verification failed')
        }
      } catch (error) {
        setStatus('failed')
        setMessage('An error occurred during payment verification')
      }
    }

    handleCallback()
  }, [searchParams, verifyPayment, router])

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <Loader2 className="w-20 h-20 mx-auto mb-6 animate-spin text-primary" />
            <h1 className="text-3xl font-bold mb-3">Verifying Payment</h1>
            <p className="text-lg text-muted-foreground">
              Please wait while we verify your payment...
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle2 className="w-20 h-20 mx-auto mb-6 text-green-500" />
            <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
            <p className="text-lg text-muted-foreground mb-6">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to confirmation page...</p>
          </div>
        )

      case 'failed':
        return (
          <div className="text-center">
            <XCircle className="w-20 h-20 mx-auto mb-6 text-red-500" />
            <h1 className="text-3xl font-bold mb-3">Payment Failed</h1>
            <p className="text-lg text-muted-foreground mb-8">{message}</p>
            <div className="space-y-3">
              <Button onClick={() => router.push('/register')} className="w-full max-w-sm">
                Try Again
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full max-w-sm"
              >
                Return to Home
              </Button>
            </div>
          </div>
        )

      case 'cancelled':
        return (
          <div className="text-center">
            <XCircle className="w-20 h-20 mx-auto mb-6 text-orange-500" />
            <h1 className="text-3xl font-bold mb-3">Payment Cancelled</h1>
            <p className="text-lg text-muted-foreground mb-8">{message}</p>
            <div className="space-y-3">
              <Button onClick={() => router.push('/register')} className="w-full max-w-sm">
                Return to Registration
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full max-w-sm"
              >
                Return to Home
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full py-12">
        {renderContent()}
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading payment callback...</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}
