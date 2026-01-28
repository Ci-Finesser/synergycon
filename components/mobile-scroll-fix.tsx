'use client';

import { useMobileScrollFix } from '@/hooks/use-mobile-scroll-fix';

/**
 * Component that applies mobile scroll fixes globally
 * Add this to your root layout
 */
export function MobileScrollFix() {
  useMobileScrollFix();
  return null;
}
