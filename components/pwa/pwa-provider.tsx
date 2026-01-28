'use client'

import { useEffect } from 'react'
import { usePWA } from '@/hooks/use-pwa'
import { PWAInstallPrompt } from '@/components/pwa/install-prompt'
import { NetworkIndicator } from '@/components/pwa/network-indicator'
import { UpdateNotification } from '@/components/pwa/update-notification'
import { SyncQueueManager } from '@/components/pwa/sync-queue-manager'
import { NotificationPermission } from '@/components/pwa/notification-permission'

export function PWAProvider({ children }: { children: React.ReactNode }) {
  usePWA()

  useEffect(() => {
    // Prevent pinch-zoom on iOS but allow normal scrolling
    // Only prevent when actually pinch-zooming (2+ fingers with scale change)
    const preventPinchZoom = (e: TouchEvent) => {
      // Only prevent if it's a pinch gesture (2+ touches) AND scale is changing
      if (e.touches.length >= 2 && (e as any).scale !== undefined && (e as any).scale !== 1) {
        e.preventDefault()
      }
    }

    // Use gesturestart/gesturechange for more reliable pinch detection on iOS
    const preventGesture = (e: Event) => {
      e.preventDefault()
    }

    // Only add pinch prevention, not touchmove blocking
    document.addEventListener('gesturestart', preventGesture, { passive: false })
    document.addEventListener('gesturechange', preventGesture, { passive: false })
    
    // For non-gesture browsers, still prevent multi-touch zoom
    document.addEventListener('touchmove', preventPinchZoom, { passive: false })

    return () => {
      document.removeEventListener('gesturestart', preventGesture)
      document.removeEventListener('gesturechange', preventGesture)
      document.removeEventListener('touchmove', preventPinchZoom)
    }
  }, [])

  return (
    <>
      {children}
      <PWAInstallPrompt />
      <NetworkIndicator />
      <UpdateNotification />
      <SyncQueueManager />
      <NotificationPermission />
    </>
  )
}
