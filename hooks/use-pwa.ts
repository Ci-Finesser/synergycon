import { useEffect } from 'react'
import { useNetworkStore } from '@/lib/stores/network-store'

export function usePWA() {
  const { isOnline } = useNetworkStore()

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available for update
              }
            })
          }
        })

        // Check for updates on page load
        registration.update()
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }

    registerServiceWorker()

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SYNC_QUEUE') {
        // Trigger sync queue processing
        import('@/lib/stores/sync-queue-store').then(({ useSyncQueueStore }) => {
          useSyncQueueStore.getState().processQueue()
        })
      }
    })
  }, [])

  return {
    isOnline,
  }
}

export function useOfflineSync() {
  const { isOnline } = useNetworkStore()

  const queueRequest = async (
    url: string,
    options: RequestInit = {},
    priority: 'low' | 'normal' | 'high' = 'normal'
  ) => {
    const { useSyncQueueStore } = await import('@/lib/stores/sync-queue-store')
    
    if (isOnline) {
      // If online, make the request directly
      try {
        return await fetch(url, options)
      } catch (error) {
        // If request fails, queue it
        useSyncQueueStore.getState().addToQueue({
          url,
          method: options.method || 'GET',
          body: options.body,
          headers: options.headers as Record<string, string>,
          priority,
          maxRetries: 3,
        })
        throw error
      }
    } else {
      // If offline, queue the request
      useSyncQueueStore.getState().addToQueue({
        url,
        method: options.method || 'GET',
        body: options.body,
        headers: options.headers as Record<string, string>,
        priority,
        maxRetries: 3,
      })
      throw new Error('Offline: Request queued for sync')
    }
  }

  return {
    queueRequest,
    isOnline,
  }
}

export function useNetworkQuality() {
  const { quality, effectiveType, downlink, rtt, saveData } = useNetworkStore()

  const shouldLoadHeavyResources = () => {
    if (saveData) return false
    if (quality === 'slow' || quality === 'offline') return false
    return true
  }

  const getImageQuality = () => {
    if (saveData || quality === 'slow') return 'low'
    if (quality === 'good') return 'medium'
    return 'high'
  }

  return {
    quality,
    effectiveType,
    downlink,
    rtt,
    saveData,
    shouldLoadHeavyResources,
    getImageQuality,
  }
}
