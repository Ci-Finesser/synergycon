/**
 * Payment Service - Main facade for payment operations
 * Provides a unified interface for all payment operations
 */

import {
  PaymentProvider,
  InitializePaymentRequest,
  InitializePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  WebhookEvent,
  PaymentPreferences,
  calculateFee,
  Currency,
} from './types';
import {
  getPaymentProvider,
  getDefaultProvider,
  getAvailableProviders,
  getAllProviderInfos,
  ProviderInfo,
} from './payment-factory';
import { securePreferences } from '@/lib/secure-storage';

const PREFERENCES_KEY = 'payment_provider';

export class PaymentService {
  private static instance: PaymentService;

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Get available payment providers
   */
  getAvailableProviders(): PaymentProvider[] {
    return getAvailableProviders();
  }

  /**
   * Get all provider information
   */
  getProviderInfos(): ProviderInfo[] {
    return getAllProviderInfos().filter((p) => p.isConfigured);
  }

  /**
   * Get user's preferred provider (async - uses secure storage)
   */
  async getPreferredProviderAsync(): Promise<PaymentProvider> {
    if (typeof window === 'undefined') {
      return getDefaultProvider();
    }

    try {
      const prefs = await securePreferences.get<PaymentPreferences>(PREFERENCES_KEY);
      if (prefs?.preferredProvider) {
        // Verify provider is still available
        if (getAvailableProviders().includes(prefs.preferredProvider)) {
          return prefs.preferredProvider;
        }
      }
    } catch {
      // Ignore parse errors
    }

    return getDefaultProvider();
  }

  /**
   * Get user's preferred provider (sync - returns default if not cached)
   * Use getPreferredProviderAsync() for accurate results
   */
  getPreferredProvider(): PaymentProvider {
    return getDefaultProvider();
  }

  /**
   * Save user's preferred provider
   */
  async setPreferredProvider(provider: PaymentProvider): Promise<void> {
    if (typeof window === 'undefined') return;

    const prefs: PaymentPreferences = {
      preferredProvider: provider,
      savedAt: new Date(),
    };

    await securePreferences.set(PREFERENCES_KEY, prefs);
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(
    request: InitializePaymentRequest,
    provider?: PaymentProvider
  ): Promise<InitializePaymentResponse> {
    const selectedProvider = provider || this.getPreferredProvider();
    const paymentProvider = getPaymentProvider(selectedProvider);

    return paymentProvider.initialize(request);
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(
    request: VerifyPaymentRequest,
    provider: PaymentProvider
  ): Promise<VerifyPaymentResponse> {
    const paymentProvider = getPaymentProvider(provider);
    return paymentProvider.verify(request);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(
    provider: PaymentProvider,
    payload: string,
    signature: string
  ): boolean {
    const paymentProvider = getPaymentProvider(provider);
    return paymentProvider.verifyWebhook(payload, signature);
  }

  /**
   * Parse webhook event
   */
  parseWebhook(provider: PaymentProvider, payload: unknown): WebhookEvent {
    const paymentProvider = getPaymentProvider(provider);
    return paymentProvider.parseWebhook(payload);
  }

  /**
   * Calculate transaction fee
   */
  calculateFee(
    amount: number,
    provider: PaymentProvider,
    currency: Currency = 'NGN'
  ): number {
    return calculateFee(amount, provider, currency);
  }

  /**
   * Get total amount including fees
   */
  getTotalWithFees(
    amount: number,
    provider: PaymentProvider,
    currency: Currency = 'NGN'
  ): { amount: number; fee: number; total: number } {
    const fee = this.calculateFee(amount, provider, currency);
    return {
      amount,
      fee,
      total: amount + fee,
    };
  }

  /**
   * Compare fees across providers
   */
  compareFees(
    amount: number,
    currency: Currency = 'NGN'
  ): Array<{ provider: PaymentProvider; fee: number; total: number }> {
    return getAvailableProviders().map((provider) => {
      const fee = this.calculateFee(amount, provider, currency);
      return {
        provider,
        fee,
        total: amount + fee,
      };
    });
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();
