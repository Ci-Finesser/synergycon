'use client';

import { useEffect } from 'react';

/**
 * Hook to fix mobile scroll issues in PWA and mobile browsers
 *
 * This addresses:
 * - iOS Safari 100vh issue
 * - PWA standalone mode scroll issues
 * - Dialog/Sheet scroll lock not releasing
 * - Touch scroll momentum
 */
export function useMobileScrollFix() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Fix 1: Set CSS variable for actual viewport height
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty(
        '--dvh',
        `${window.innerHeight}px`
      );
    };

    // Set initial value
    setViewportHeight();

    // Update on resize (handles address bar show/hide)
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // Fix 2: Ensure scroll lock is properly released
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-scroll-locked') {
          const isLocked =
            document.body.getAttribute('data-scroll-locked') === 'true';

          if (isLocked) {
            // Store current scroll position
            const scrollY = window.scrollY;
            document.documentElement.style.setProperty(
              '--scroll-y',
              `${scrollY}px`
            );
          } else {
            // Restore scroll position
            const scrollY = parseInt(
              document.documentElement.style.getPropertyValue('--scroll-y') ||
                '0',
              10
            );
            window.scrollTo(0, scrollY);
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked'],
    });

    // Fix 3: Handle iOS rubber-band scrolling issues
    const preventOverscroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement;

      // Allow scrolling in scrollable containers
      if (target.closest('[data-scroll-container]')) {
        return;
      }

      // Check if we're at the top or bottom of a scrollable element
      const scrollableParent = target.closest(
        '.overflow-y-auto, .overflow-auto, [data-radix-scroll-area-viewport]'
      );

      if (scrollableParent) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableParent;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight;

        // Only prevent if at boundaries and trying to scroll further
        if ((isAtTop || isAtBottom) && e.touches.length === 1) {
          // Let the event through but prevent overscroll
          return;
        }
      }
    };

    // Only add touch handlers in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;

    if (isStandalone) {
      document.addEventListener('touchmove', preventOverscroll, {
        passive: true,
      });
    }

    // Fix 4: Ensure body is scrollable after navigation
    const ensureScrollable = () => {
      // Remove any stuck scroll locks
      if (document.body.getAttribute('data-scroll-locked') === 'true') {
        // Check if any dialogs are actually open
        const openDialogs = document.querySelectorAll(
          '[data-state="open"][role="dialog"]'
        );
        const openSheets = document.querySelectorAll(
          '[data-state="open"][data-vaul-drawer]'
        );

        if (openDialogs.length === 0 && openSheets.length === 0) {
          document.body.removeAttribute('data-scroll-locked');
          document.body.style.overflow = '';
          document.body.style.position = '';
        }
      }
    };

    // Check periodically for stuck scroll locks
    const intervalId = setInterval(ensureScrollable, 1000);

    // Also check on popstate (back/forward navigation)
    window.addEventListener('popstate', ensureScrollable);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
      window.removeEventListener('popstate', ensureScrollable);
      observer.disconnect();
      clearInterval(intervalId);

      if (isStandalone) {
        document.removeEventListener('touchmove', preventOverscroll);
      }
    };
  }, []);
}

/**
 * Hook to mark a container as scrollable for mobile
 * Returns props to spread on the scrollable element
 */
export function useScrollContainer() {
  return {
    'data-scroll-container': true,
    style: {
      WebkitOverflowScrolling: 'touch' as const,
      touchAction: 'pan-y' as const,
    },
  };
}
