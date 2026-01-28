/**
 * Payment Module - Public Exports
 */

// Types
export * from './types';

// Factory
export {
  getPaymentProvider,
  getAvailableProviders,
  getDefaultProvider,
  isProviderConfigured,
  getProviderInfo,
  getAllProviderInfos,
  type ProviderInfo,
} from './payment-factory';

// Service
export { PaymentService, paymentService } from './payment-service';

// Providers (for direct access if needed)
export { FlutterwaveProvider } from './providers/flutterwave';
export { PaystackProvider } from './providers/paystack';
