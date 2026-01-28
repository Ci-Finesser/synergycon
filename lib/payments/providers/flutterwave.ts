/**
 * Flutterwave Payment Provider Implementation
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

interface FlutterwaveInitResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
    meta?: Record<string, unknown>;
  };
}

interface FlutterwaveWebhookPayload {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    status: string;
    customer: {
      email: string;
      name: string;
      phone_number?: string;
    };
    meta?: Record<string, unknown>;
    created_at: string;
  };
}

export class FlutterwaveProvider extends BasePaymentProvider {
  get provider(): PaymentProvider {
    return 'flutterwave';
  }

  protected validateConfig(
    config: Partial<PaymentProviderConfig>
  ): PaymentProviderConfig {
    const isTest = process.env.NODE_ENV !== 'production';

    return {
      provider: 'flutterwave',
      publicKey: config.publicKey || process.env.FLUTTERWAVE_PUBLIC_KEY || '',
      secretKey: config.secretKey || process.env.FLUTTERWAVE_SECRET_KEY || '',
      webhookSecret:
        config.webhookSecret || process.env.FLUTTERWAVE_WEBHOOK_SECRET,
      baseUrl: config.baseUrl || 'https://api.flutterwave.com/v3',
      isTest,
    };
  }

  async initialize(
    request: InitializePaymentRequest
  ): Promise<InitializePaymentResponse> {
    const reference = request.reference || this.generateReference();

    try {
      const response = await this.apiRequest<FlutterwaveInitResponse>(
        '/payments',
        {
          method: 'POST',
          body: JSON.stringify({
            tx_ref: reference,
            amount: request.amount,
            currency: request.currency,
            redirect_url:
              request.callbackUrl ||
              process.env.NEXT_PUBLIC_APP_URL + '/register/payment/callback',
            customer: {
              email: request.customer.email,
              name: request.customer.name,
              phonenumber: request.customer.phone,
            },
            meta: request.metadata,
            customizations: {
              title: 'SynergyCon 2026',
              description: request.description || 'Conference Ticket Payment',
              logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
            },
          }),
        }
      );

      return {
        success: true,
        provider: 'flutterwave',
        reference,
        authorizationUrl: response.data.link,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'flutterwave',
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
      // Flutterwave uses transaction ID for verification
      const transactionId = request.transactionId;

      if (!transactionId) {
        // If no transaction ID, query by reference
        const transactions = await this.apiRequest<{
          status: string;
          data: FlutterwaveVerifyResponse['data'][];
        }>(`/transactions?tx_ref=${request.reference}`);

        if (!transactions.data?.length) {
          return {
            success: false,
            provider: 'flutterwave',
            reference: request.reference,
            status: 'failed',
            amount: 0,
            currency: 'NGN',
            customer: { email: '', name: '' },
            error: 'Transaction not found',
          };
        }

        const tx = transactions.data[0];
        return this.formatVerifyResponse(tx, request.reference);
      }

      const response = await this.apiRequest<FlutterwaveVerifyResponse>(
        `/transactions/${transactionId}/verify`
      );

      return this.formatVerifyResponse(response.data, request.reference);
    } catch (error) {
      return {
        success: false,
        provider: 'flutterwave',
        reference: request.reference,
        status: 'failed',
        amount: 0,
        currency: 'NGN',
        customer: { email: '', name: '' },
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  private formatVerifyResponse(
    data: FlutterwaveVerifyResponse['data'],
    reference: string
  ): VerifyPaymentResponse {
    const status = this.mapStatus(data.status);

    return {
      success: status === 'successful',
      provider: 'flutterwave',
      reference,
      status,
      amount: data.amount,
      currency: data.currency as VerifyPaymentResponse['currency'],
      customer: {
        email: data.customer.email,
        name: data.customer.name,
        phone: data.customer.phone_number,
      },
      paidAt: new Date(data.created_at),
      channel: data.payment_type,
      metadata: data.meta as VerifyPaymentResponse['metadata'],
      providerResponse: data,
    };
  }

  private mapStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      successful: 'successful',
      pending: 'pending',
      failed: 'failed',
      cancelled: 'cancelled',
    };
    return statusMap[status.toLowerCase()] || 'failed';
  }

  verifyWebhook(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      console.warn('Flutterwave webhook secret not configured');
      return false;
    }

    const hash = crypto
      .createHmac('sha256', this.config.webhookSecret)
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
    const data = payload as FlutterwaveWebhookPayload;

    return {
      provider: 'flutterwave',
      event: data.event,
      data: {
        reference: data.data.tx_ref,
        status: this.mapStatus(data.data.status),
        amount: data.data.amount,
        currency: data.data.currency as WebhookEvent['data']['currency'],
        customer: {
          email: data.data.customer.email,
          name: data.data.customer.name,
          phone: data.data.customer.phone_number,
        },
        metadata: data.data.meta as WebhookEvent['data']['metadata'],
        paidAt: new Date(data.data.created_at),
      },
      rawPayload: payload,
    };
  }
}
