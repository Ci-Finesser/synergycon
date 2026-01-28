/**
 * Payment Provider Factory
 * Creates and manages payment provider instances
 */

import {
  PaymentProvider,
  PaymentProviderInterface,
  PaymentProviderConfig,
} from './types';
import { FlutterwaveProvider } from './providers/flutterwave';
import { PaystackProvider } from './providers/paystack';

// Singleton instances
let flutterwaveInstance: FlutterwaveProvider | null = null;
let paystackInstance: PaystackProvider | null = null;

/**
 * Get payment provider instance
 */
export function getPaymentProvider(
  provider: PaymentProvider,
  config?: Partial<PaymentProviderConfig>
): PaymentProviderInterface {
  switch (provider) {
    case 'flutterwave':
      if (!flutterwaveInstance || config) {
        flutterwaveInstance = new FlutterwaveProvider(config || {});
      }
      return flutterwaveInstance;

    case 'paystack':
      if (!paystackInstance || config) {
        paystackInstance = new PaystackProvider(config || {});
      }
      return paystackInstance;

    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}

/**
 * Get all available (configured) payment providers
 */
export function getAvailableProviders(): PaymentProvider[] {
  const providers: PaymentProvider[] = [];

  try {
    const flutterwave = getPaymentProvider('flutterwave');
    if (flutterwave.isConfigured) {
      providers.push('flutterwave');
    }
  } catch {
    // Provider not available
  }

  try {
    const paystack = getPaymentProvider('paystack');
    if (paystack.isConfigured) {
      providers.push('paystack');
    }
  } catch {
    // Provider not available
  }

  return providers;
}

/**
 * Get default payment provider
 */
export function getDefaultProvider(): PaymentProvider {
  const available = getAvailableProviders();

  if (available.length === 0) {
    throw new Error('No payment providers configured');
  }

  // Prefer Flutterwave if available (existing provider)
  if (available.includes('flutterwave')) {
    return 'flutterwave';
  }

  return available[0];
}

/**
 * Check if a specific provider is configured
 */
export function isProviderConfigured(provider: PaymentProvider): boolean {
  try {
    const instance = getPaymentProvider(provider);
    return instance.isConfigured;
  } catch {
    return false;
  }
}

/**
 * Get provider display info
 */
export interface ProviderInfo {
  id: PaymentProvider;
  name: string;
  description: string;
  logo: string;
  isConfigured: boolean;
  supportedCurrencies: string[];
  features: string[];
}

export function getProviderInfo(provider: PaymentProvider): ProviderInfo {
  const infos: Record<PaymentProvider, Omit<ProviderInfo, 'isConfigured'>> = {
    flutterwave: {
      id: 'flutterwave',
      name: 'Flutterwave',
      description: 'Pay with cards, bank transfer, USSD, or mobile money',
      logo: '/images/payments/flutterwave.svg',
      supportedCurrencies: ['NGN', 'USD', 'GHS', 'KES', 'ZAR'],
      features: ['Cards', 'Bank Transfer', 'USSD', 'Mobile Money'],
    },
    paystack: {
      id: 'paystack',
      name: 'Paystack',
      description: 'Pay with cards, bank transfer, or USSD',
      logo: '/images/payments/paystack.svg',
      supportedCurrencies: ['NGN', 'USD', 'GHS', 'KES', 'ZAR'],
      features: ['Cards', 'Bank Transfer', 'USSD', 'QR Code'],
    },
  };

  return {
    ...infos[provider],
    isConfigured: isProviderConfigured(provider),
  };
}

/**
 * Get all provider infos
 */
export function getAllProviderInfos(): ProviderInfo[] {
  const providers: PaymentProvider[] = ['flutterwave', 'paystack'];
  return providers.map(getProviderInfo);
}
