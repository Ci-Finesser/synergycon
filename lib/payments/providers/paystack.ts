/**
 * Paystack Payment Provider Implementation
 */

import crypto from 'crypto';
import { BasePaymentProvider } from './base';
import {
  PaymentProvider,
  PaymentProviderConfig,
  InitializePaymentRequest,
  InitializePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  WebhookEvent,
  PaymentStatus,
} from '../types';

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, unknown>;
    fees: number;
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
  };
}

interface PaystackWebhookPayload {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    paid_at: string;
    customer: {
      email: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
    };
    metadata?: Record<string, unknown>;
  };
}

export class PaystackProvider extends BasePaymentProvider {
  get provider(): PaymentProvider {
    return 'paystack';
  }

  protected validateConfig(
    config: Partial<PaymentProviderConfig>
  ): PaymentProviderConfig {
    const isTest = process.env.NODE_ENV !== 'production';

    return {
      provider: 'paystack',
      publicKey: config.publicKey || process.env.PAYSTACK_PUBLIC_KEY || '',
      secretKey: config.secretKey || process.env.PAYSTACK_SECRET_KEY || '',
      webhookSecret:
        config.webhookSecret || process.env.PAYSTACK_WEBHOOK_SECRET,
      baseUrl: config.baseUrl || 'https://api.paystack.co',
      isTest,
    };
  }

  async initialize(
    request: InitializePaymentRequest
  ): Promise<InitializePaymentResponse> {
    const reference = request.reference || this.generateReference();

    try {
      // Paystack expects amount in kobo (smallest unit)
      const amountInKobo = this.toSmallestUnit(
        request.amount,
        request.currency
      );

      const response = await this.apiRequest<PaystackInitResponse>(
        '/transaction/initialize',
        {
          method: 'POST',
          body: JSON.stringify({
            email: request.customer.email,
            amount: amountInKobo,
            currency: request.currency,
            reference,
            callback_url:
              request.callbackUrl ||
              process.env.NEXT_PUBLIC_APP_URL + '/register/payment/callback',
            metadata: {
              custom_fields: [
                {
                  display_name: 'Customer Name',
                  variable_name: 'customer_name',
                  value: request.customer.name,
                },
                ...(request.customer.phone
                  ? [
                      {
                        display_name: 'Phone Number',
                        variable_name: 'phone',
                        value: request.customer.phone,
                      },
                    ]
                  : []),
              ],
              ...request.metadata,
            },
          }),
        }
      );

      return {
        success: true,
        provider: 'paystack',
        reference: response.data.reference,
        authorizationUrl: response.data.authorization_url,
        accessCode: response.data.access_code,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'paystack',
        reference,
        authorizationUrl: '',
        error:
          error instanceof Error
            ? error.message
            : 'Payment initialization failed',
      };
    }
  }

  async verify(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      const response = await this.apiRequest<PaystackVerifyResponse>(
        `/transaction/verify/${request.reference}`
      );

      const status = this.mapStatus(response.data.status);
      // Convert from kobo to main currency unit
      const amount = this.fromSmallestUnit(
        response.data.amount,
        response.data.currency
      );

      const customerName =
        [response.data.customer.first_name, response.data.customer.last_name]
          .filter(Boolean)
          .join(' ') || 'Customer';

      return {
        success: status === 'successful',
        provider: 'paystack',
        reference: response.data.reference,
        status,
        amount,
        currency: response.data.currency as VerifyPaymentResponse['currency'],
        customer: {
          email: response.data.customer.email,
          name: customerName,
          phone: response.data.customer.phone || undefined,
        },
        paidAt: response.data.paid_at
          ? new Date(response.data.paid_at)
          : undefined,
        channel: response.data.channel,
        metadata: response.data.metadata as VerifyPaymentResponse['metadata'],
        providerResponse: response.data,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'paystack',
        reference: request.reference,
        status: 'failed',
        amount: 0,
        currency: 'NGN',
        customer: { email: '', name: '' },
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  private mapStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      success: 'successful',
      pending: 'pending',
      failed: 'failed',
      abandoned: 'abandoned',
    };
    return statusMap[status.toLowerCase()] || 'failed';
  }

  verifyWebhook(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      console.warn('Paystack webhook secret not configured');
      return false;
    }

    const hash = crypto
      .createHmac('sha512', this.config.webhookSecret)
      .update(payload)
      .digest('hex');

    try {
      const hashBuffer = new Uint8Array(Buffer.from(hash));
      const signatureBuffer = new Uint8Array(Buffer.from(signature));
      if (hashBuffer.length !== signatureBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
    } catch {
      return false;
    }
  }

  parseWebhook(payload: unknown): WebhookEvent {
    const data = payload as PaystackWebhookPayload;

    // Convert amount from kobo
    const amount = this.fromSmallestUnit(data.data.amount, data.data.currency);

    const customerName =
      [data.data.customer.first_name, data.data.customer.last_name]
        .filter(Boolean)
        .join(' ') || 'Customer';

    return {
      provider: 'paystack',
      event: data.event,
      data: {
        reference: data.data.reference,
        status: this.mapStatus(data.data.status),
        amount,
        currency: data.data.currency as WebhookEvent['data']['currency'],
        customer: {
          email: data.data.customer.email,
          name: customerName,
          phone: data.data.customer.phone,
        },
        metadata: data.data.metadata as WebhookEvent['data']['metadata'],
        paidAt: data.data.paid_at ? new Date(data.data.paid_at) : undefined,
      },
      rawPayload: payload,
    };
  }
}
