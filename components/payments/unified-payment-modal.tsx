'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, ExternalLink, ArrowLeft, TriangleAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PaymentProviderSelector } from './payment-provider-selector';
import type { PaymentProvider, Currency, CustomerInfo, PaymentMetadata } from '@/lib/payments/types';
import { getClientCSRFToken } from '@/lib/csrf-client';

// Development mode check - allows testing payment flow without real payments
const isDevelopment = process.env.NODE_ENV !== 'production';

type PaymentState = 'selecting' | 'processing' | 'pending' | 'verifying' | 'success' | 'success-profile-failed' | 'error';

// User data for profile creation retry
interface ProfileUserData {
  email: string;
  name: string;
  phone?: string;
  organization?: string;
  industry?: string;
  role?: string;
  attendanceReason?: string;
  expectations?: string;
  dietaryRequirements?: string;
}

interface UnifiedPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  currency?: Currency;
  customer: CustomerInfo;
  orderId: string;
  metadata?: PaymentMetadata;
  description?: string;
  onSuccess?: (reference: string, provider: PaymentProvider) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  onProfileCreationFailed?: (userData: ProfileUserData) => void;
}

export function UnifiedPaymentModal({
  open,
  onOpenChange,
  amount,
  currency = 'NGN',
  customer,
  orderId,
  metadata,
  description,
  onSuccess,
  onError,
  onCancel,
  onProfileCreationFailed,
}: UnifiedPaymentModalProps) {
  const [state, setState] = useState<PaymentState>('selecting');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileFailedData, setProfileFailedData] = useState<ProfileUserData | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setState('selecting');
      setError(null);
      setPaymentLink(null);
    }
  }, [open]);

  const handleProviderSelect = useCallback((provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setError(null);
  }, []);

  const handleProceed = async () => {
    if (!selectedProvider) return;

    setState('processing');
    setError(null);

    try {
      // In development mode, use the dev-complete endpoint for easier testing
      if (isDevelopment) {
        const response = await fetch('/api/payments/dev-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            amount,
            currency,
            customer: {
              email: customer.email,
              name: customer.name,
              phone: customer.phone,
            },
            meta: metadata,
            _formStartTime: Date.now(),
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Dev payment completion failed');
        }

        // Set reference and trigger success
        setReference(data.reference);
        onSuccess?.(data.reference, selectedProvider);

        // Check if profile creation failed
        if (data.profileCreationFailed && data.userData) {
          setProfileFailedData(data.userData);
          setState('success-profile-failed');
          // Don't auto-close - let user see the prompt
        } else {
          setState('success');
          // Auto-close after success
          setTimeout(() => {
            onOpenChange(false);
          }, 2000);
        }
        return;
      }

      // Production: Use real payment provider
      const csrfToken = getClientCSRFToken();
      if (!csrfToken) {
        throw new Error('CSRF token not found. Please refresh the page.');
      }

      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          orderId,
          amount,
          currency,
          customer: {
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
          },
          meta: metadata,
          description,
          callbackUrl: `${window.location.origin}/register/payment/callback`,
          _csrf: csrfToken,
          _formStartTime: Date.now(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      setPaymentLink(data.authorizationUrl || data.payment_link);
      setReference(data.reference || data.tx_ref);
      setState('pending');

      // Auto-open payment link
      if (data.authorizationUrl || data.payment_link) {
        window.open(data.authorizationUrl || data.payment_link, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      setState('error');
      onError?.(errorMessage);
    }
  };

  const handleVerify = async () => {
    if (!reference || !selectedProvider) return;

    setState('verifying');

    try {
      const csrfToken = getClientCSRFToken();
      if (!csrfToken) {
        throw new Error('CSRF token not found. Please refresh the page.');
      }

      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          reference,
          _csrf: csrfToken,
          _formStartTime: Date.now(),
        }),
      });

      const data = await response.json();

      if (data.success && data.status === 'successful') {
        onSuccess?.(reference, selectedProvider);

        // Check if profile creation failed
        if (data.profileCreationFailed && data.userData) {
          setProfileFailedData(data.userData);
          setState('success-profile-failed');
          // Don't auto-close - let user see the prompt
        } else {
          setState('success');
          // Auto-close after success
          setTimeout(() => {
            onOpenChange(false);
          }, 2000);
        }
      } else {
        setError(data.error || 'Payment verification failed. Please try again.');
        setState('pending'); // Go back to pending to allow retry
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      setState('pending');
    }
  };

  const handleClose = () => {
    if (state === 'processing' || state === 'verifying') return; // Don't close during processing

    setState('selecting');
    setSelectedProvider(null);
    setPaymentLink(null);
    setReference(null);
    setError(null);
    onOpenChange(false);
    onCancel?.();
  };

  const handleRetry = () => {
    setState('selecting');
    setError(null);
  };

  const handleBack = () => {
    setState('selecting');
    setError(null);
    setPaymentLink(null);
  };

  // Calculate fee (use flutterwave as reference since fees are similar)
  const estimatedFee = Math.min(Math.round((amount * 1.4) / 100), 2000);
  const total = amount + estimatedFee;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Fixed Header with Amount + Fee */}
        <div className="shrink-0 bg-background border-b px-6 py-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg">
              {state === 'selecting' && 'Choose Payment Method'}
              {state === 'processing' && 'Initializing Payment...'}
              {state === 'pending' && 'Complete Your Payment'}
              {state === 'verifying' && 'Verifying Payment...'}
              {state === 'success' && 'Payment Successful!'}
              {state === 'success-profile-failed' && 'Payment Successful!'}
              {state === 'error' && 'Payment Failed'}
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                {state === 'selecting' && (
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="text-foreground">₦{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Processing fee</span>
                      <span className="text-foreground">₦{estimatedFee.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-semibold pt-1 border-t">
                      <span>Total</span>
                      <span className="text-primary">₦{total.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                {state === 'processing' && 'Please wait while we redirect you...'}
                {state === 'pending' && 'Complete payment in the opened window'}
                {state === 'verifying' && 'Confirming your payment...'}
                {state === 'success' && 'Your payment has been confirmed'}
                {state === 'success-profile-failed' && 'Action required to complete setup'}
                {state === 'error' && 'Something went wrong'}
              </div>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AnimatePresence mode="wait">
            {/* Provider Selection */}
            {state === 'selecting' && (
              <motion.div
                key="selecting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  Select payment method
                </p>
                <PaymentProviderSelector
                  amount={amount}
                  currency={currency}
                  selectedProvider={selectedProvider}
                  onSelect={handleProviderSelect}
                  showFees={false}
                />

                {/* Development mode indicator */}
                {isDevelopment && (
                  <div className="mt-4 pt-3 border-t border-dashed border-amber-500">
                    <p className="text-xs text-amber-600 text-center font-medium">
                      🧪 Development Mode: Payment will be simulated
                    </p>
                  </div>
                )}

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </motion.div>
          )}

          {/* Processing */}
          {state === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Connecting to {selectedProvider}...
              </p>
            </motion.div>
          )}

          {/* Pending - Payment Window Open */}
          {state === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4 py-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  A payment window has been opened. Complete your payment there, then click the button below.
                </p>

                {error && (
                  <p className="text-sm text-amber-600 mb-4">{error}</p>
                )}
              </div>

              <div className="space-y-2">
                {paymentLink && (
                  <Button
                    onClick={() => window.open(paymentLink, '_blank', 'noopener,noreferrer')}
                    variant="outline"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Reopen Payment Window
                  </Button>
                )}

                <Button onClick={handleVerify} className="w-full">
                  I've Completed Payment
                </Button>

                <Button
                  onClick={handleBack}
                  variant="ghost"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Change Payment Method
                </Button>
              </div>
            </motion.div>
          )}

          {/* Verifying */}
          {state === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Verifying your payment...
              </p>
            </motion.div>
          )}

          {/* Success */}
          {state === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <p className="mt-4 text-center font-medium">
                Payment Confirmed!
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting...
              </p>
            </motion.div>
          )}

          {/* Success but Profile Creation Failed */}
          {state === 'success-profile-failed' && (
            <motion.div
              key="success-profile-failed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-6"
            >
              <div className="rounded-full bg-green-100 p-3 mb-2">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <p className="text-center font-medium text-green-700">
                Payment Confirmed!
              </p>
              
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg w-full">
                <div className="flex items-start gap-3">
                  <TriangleAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">
                      Account Setup Incomplete
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Your payment was successful, but we couldn&apos;t create your account automatically. 
                      Please complete your registration to access your tickets and dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 w-full">
                <Button
                  onClick={() => {
                    if (profileFailedData && onProfileCreationFailed) {
                      onProfileCreationFailed(profileFailedData);
                    }
                    onOpenChange(false);
                  }}
                  className="w-full"
                >
                  Complete Registration
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="w-full text-muted-foreground"
                >
                  I&apos;ll do this later
                </Button>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div className="rounded-full bg-destructive/10 p-3">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {error}
              </p>
              <div className="mt-6 flex gap-3 w-full">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Fixed Footer with Buttons - only show in selecting state */}
        {state === 'selecting' && (
          <div className="shrink-0 border-t bg-background px-6 py-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedProvider}
                onClick={handleProceed}
              >
                Pay Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
