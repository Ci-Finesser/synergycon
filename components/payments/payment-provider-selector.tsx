'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check, CreditCard, Building2, Smartphone, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { securePreferences } from '@/lib/secure-storage';
import type { PaymentProvider, Currency } from '@/lib/payments/types';

interface ProviderInfo {
  id: PaymentProvider;
  name: string;
  description: string;
  logo: string;
  isConfigured: boolean;
  supportedCurrencies: string[];
  features: string[];
}

interface PaymentProviderSelectorProps {
  amount: number;
  currency?: Currency;
  selectedProvider: PaymentProvider | null;
  onSelect: (provider: PaymentProvider) => void;
  showFees?: boolean;
  disabled?: boolean;
  className?: string;
}

const featureIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  Cards: { icon: <CreditCard className="h-3 w-3" />, label: 'Cards' },
  'Bank Transfer': { icon: <Building2 className="h-3 w-3" />, label: 'Bank Transfer' },
  USSD: { icon: <Smartphone className="h-3 w-3" />, label: 'USSD' },
  'Mobile Money': { icon: <Smartphone className="h-3 w-3" />, label: 'Mobile Money' },
  'QR Code': { icon: <QrCode className="h-3 w-3" />, label: 'QR Code' },
};

// Provider info (client-side version without server dependencies)
const PROVIDER_INFOS: ProviderInfo[] = [
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    description: 'Pay with cards, bank transfer, USSD, or mobile money',
    logo: '/images/payments/flutterwave.svg',
    isConfigured: true, // Will be validated on first use
    supportedCurrencies: ['NGN', 'USD', 'GHS', 'KES', 'ZAR'],
    features: ['Cards', 'Bank Transfer', 'USSD', 'Mobile Money'],
  },
  {
    id: 'paystack',
    name: 'Paystack',
    description: 'Pay with cards, bank transfer, or USSD',
    logo: '/images/payments/paystack.svg',
    isConfigured: true, // Will be validated on first use
    supportedCurrencies: ['NGN', 'USD', 'GHS', 'KES', 'ZAR'],
    features: ['Cards', 'Bank Transfer', 'USSD', 'QR Code'],
  },
];

// Fee calculation (client-side version)
function calculateFee(amount: number, provider: PaymentProvider): number {
  const fees: Record<PaymentProvider, { flat: number; percent: number; cap: number }> = {
    flutterwave: { flat: 0, percent: 1.4, cap: 2000 },
    paystack: { flat: 100, percent: 1.5, cap: 2000 },
  };

  const fee = fees[provider];
  const percentageFee = (amount * fee.percent) / 100;
  const totalFee = percentageFee + fee.flat;

  return Math.min(Math.round(totalFee), fee.cap);
}

export function PaymentProviderSelector({
  amount,
  currency = 'NGN',
  selectedProvider,
  onSelect,
  showFees = true,
  disabled = false,
  className,
}: PaymentProviderSelectorProps) {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load providers
    setProviders(PROVIDER_INFOS);
    setIsLoading(false);

    // Auto-select first provider if none selected
    if (!selectedProvider && PROVIDER_INFOS.length > 0) {
      // Check for saved preference (async)
      securePreferences.get<{ preferredProvider: PaymentProvider }>('payment_provider')
        .then((prefs) => {
          if (prefs?.preferredProvider) {
            onSelect(prefs.preferredProvider);
          } else {
            onSelect(PROVIDER_INFOS[0].id);
          }
        })
        .catch(() => {
          onSelect(PROVIDER_INFOS[0].id);
        });
    }
  }, [selectedProvider, onSelect]);

  const handleSelect = (provider: PaymentProvider) => {
    if (disabled) return;
    onSelect(provider);
    // Save preference (async, fire-and-forget)
    securePreferences.set('payment_provider', {
      preferredProvider: provider,
      savedAt: new Date().toISOString(),
    }).catch(() => {
      // Ignore storage errors
    });
  };

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 gap-2', className)}>
        <div className="h-20 w-full rounded-lg bg-muted animate-pulse" />
        <div className="h-20 w-full rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <Card className={cn('border-destructive', className)}>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          No payment providers available. Please contact support.
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('grid grid-cols-2 gap-2', className)}>
        {providers.map((provider) => {
          const isSelected = selectedProvider === provider.id;

          return (
            <motion.div
              key={provider.id}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
            >
              <Card
                className={cn(
                  'relative cursor-pointer transition-all h-full',
                  isSelected
                    ? 'border-2 border-primary ring-2 ring-primary/20'
                    : 'border hover:border-primary/50 hover:bg-accent/50',
                  disabled && 'cursor-not-allowed opacity-60'
                )}
                onClick={() => handleSelect(provider.id)}
              >
                {/* Selection checkmark */}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}

                <CardContent className="p-1">
                  <div className="flex flex-col items-center text-center space-y-1.5">
                    {/* Provider Logo */}
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-muted p-1 flex items-center justify-center">
                      <Image
                        src={provider.logo}
                        alt={provider.name}
                        width={24}
                        height={24}
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {provider.name.charAt(0)}
                      </span>
                    </div>

                    {/* Provider Name */}
                    <h4 className="font-medium text-sm">{provider.name}</h4>

                    {/* Feature Icons Row */}
                    <div className="flex items-center justify-center gap-1">
                      {provider.features.map((feature) => (
                        <Tooltip key={feature}>
                          <TooltipTrigger asChild>
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                              {featureIcons[feature]?.icon}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            {featureIcons[feature]?.label}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
