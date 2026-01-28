/**
 * Abstract Base Payment Provider
 * Defines common interface and utilities for all payment providers
 */

import {
  PaymentProvider,
  PaymentProviderConfig,
  PaymentProviderInterface,
  InitializePaymentRequest,
  InitializePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  WebhookEvent,
  generateReference,
} from '../types';

export abstract class BasePaymentProvider implements PaymentProviderInterface {
  protected config: PaymentProviderConfig;

  constructor(config: Partial<PaymentProviderConfig>) {
    this.config = this.validateConfig(config);
  }

  abstract get provider(): PaymentProvider;

  get isConfigured(): boolean {
    return !!(this.config.publicKey && this.config.secretKey);
  }

  protected abstract validateConfig(
    config: Partial<PaymentProviderConfig>
  ): PaymentProviderConfig;

  abstract initialize(
    request: InitializePaymentRequest
  ): Promise<InitializePaymentResponse>;

  abstract verify(
    request: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse>;

  abstract verifyWebhook(payload: string, signature: string): boolean;

  abstract parseWebhook(payload: unknown): WebhookEvent;

  /**
   * Generate a unique reference for this provider
   */
  protected generateReference(): string {
    const prefix = this.provider === 'flutterwave' ? 'FLW' : 'PSK';
    return generateReference(prefix);
  }

  /**
   * Make authenticated API request
   */
  protected async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.secretKey}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || `API request failed: ${response.status}`
      );
    }

    return data;
  }

  /**
   * Convert amount to smallest currency unit (kobo, pesewas, etc.)
   */
  protected toSmallestUnit(amount: number, _currency: string): number {
    // NGN, GHS, KES, ZAR use 100 subunits
    // USD uses 100 cents
    return Math.round(amount * 100);
  }

  /**
   * Convert from smallest currency unit to main unit
   */
  protected fromSmallestUnit(amount: number, _currency: string): number {
    return amount / 100;
  }
}
