/**
 * Payment Provider Abstraction - Type Definitions
 * Supports multiple payment gateways with unified interface
 */

export type PaymentProvider = 'flutterwave' | 'paystack';

export type PaymentStatus =
  | 'pending'
  | 'successful'
  | 'failed'
  | 'cancelled'
  | 'abandoned';

export type Currency = 'NGN' | 'USD' | 'GHS' | 'KES' | 'ZAR';

export interface CustomerInfo {
  email: string;
  name: string;
  phone?: string;
}

export interface PaymentMetadata {
  orderId?: string;
  ticketType?: string;
  ticketId?: string;
  registrationId?: string;
  quantity?: number;
  tickets?: Array<{
    ticket_id: string;
    ticket_name: string;
    ticket_tier: 'vip' | 'vip-plus' | 'vvip' | 'priority';
    ticket_duration: 'single-day' | 'multi-day' | 'full-event';
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  total_quantity?: number;
  [key: string]: unknown;
}

export interface InitializePaymentRequest {
  amount: number;
  currency: Currency;
  customer: CustomerInfo;
  reference?: string;
  callbackUrl?: string;
  metadata?: PaymentMetadata;
  description?: string;
}

export interface InitializePaymentResponse {
  success: boolean;
  provider: PaymentProvider;
  reference: string;
  authorizationUrl: string;
  accessCode?: string;
  transactionId?: string;
  error?: string;
}

export interface VerifyPaymentRequest {
  reference: string;
  transactionId?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  provider: PaymentProvider;
  reference: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  customer: CustomerInfo;
  paidAt?: Date;
  channel?: string;
  metadata?: PaymentMetadata;
  providerResponse?: unknown;
  error?: string;
}

export interface WebhookEvent {
  provider: PaymentProvider;
  event: string;
  data: {
    reference: string;
    status: PaymentStatus;
    amount: number;
    currency: Currency;
    customer: CustomerInfo;
    metadata?: PaymentMetadata;
    paidAt?: Date;
  };
  rawPayload: unknown;
}

export interface PaymentProviderConfig {
  provider: PaymentProvider;
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
  baseUrl: string;
  isTest: boolean;
}

export interface PaymentProviderInterface {
  readonly provider: PaymentProvider;
  readonly isConfigured: boolean;

  initialize(request: InitializePaymentRequest): Promise<InitializePaymentResponse>;
  verify(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
  verifyWebhook(payload: string, signature: string): boolean;
  parseWebhook(payload: unknown): WebhookEvent;
}

// Provider-specific popup configuration
export interface PaymentPopupConfig {
  provider: PaymentProvider;
  publicKey: string;
  reference: string;
  amount: number;
  currency: Currency;
  customer: CustomerInfo;
  callbackUrl?: string;
  onSuccess?: (response: VerifyPaymentResponse) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  metadata?: PaymentMetadata;
}

// Payment preferences stored per user/session
export interface PaymentPreferences {
  preferredProvider: PaymentProvider;
  savedAt: Date;
}

// Fee calculation
export interface PaymentFee {
  provider: PaymentProvider;
  flatFee: number;
  percentageFee: number;
  feeCap?: number;
  currency: Currency;
}

export const PAYMENT_FEES: Record<PaymentProvider, PaymentFee> = {
  flutterwave: {
    provider: 'flutterwave',
    flatFee: 0,
    percentageFee: 1.4,
    feeCap: 2000,
    currency: 'NGN',
  },
  paystack: {
    provider: 'paystack',
    flatFee: 100,
    percentageFee: 1.5,
    feeCap: 2000,
    currency: 'NGN',
  },
};

/**
 * Calculate transaction fee for a given amount and provider
 */
export function calculateFee(
  amount: number,
  provider: PaymentProvider,
  currency: Currency = 'NGN'
): number {
  const fee = PAYMENT_FEES[provider];

  if (fee.currency !== currency) {
    // For simplicity, only NGN fees are calculated
    // Extend this for multi-currency support
    return 0;
  }

  const percentageFee = (amount * fee.percentageFee) / 100;
  const totalFee = percentageFee + fee.flatFee;

  if (fee.feeCap && totalFee > fee.feeCap) {
    return fee.feeCap;
  }

  return Math.round(totalFee);
}

/**
 * Generate unique payment reference
 */
export function generateReference(prefix: string = 'SYN'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
}
