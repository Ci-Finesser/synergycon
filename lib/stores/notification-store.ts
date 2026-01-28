import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NotificationState, Notification, NotificationSettings, PermissionStatus, PushSubscriptionData } from '@/types/stores'

// Re-export for backward compatibility
export type { Notification, NotificationSettings, PermissionStatus, PushSubscriptionData }

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'
const hasNotificationAPI = isBrowser && 'Notification' in window
const hasServiceWorker = isBrowser && 'serviceWorker' in navigator

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // In-app notifications
      notifications: [],
      unreadCount: 0,
      
      // Initial state - will be properly set by initialize()
      permission: hasNotificationAPI ? (Notification.permission as PermissionStatus) : 'default',
      isSupported: hasNotificationAPI && hasServiceWorker,
      isInitialized: false,
      
      settings: {
        enabled: true,
        eventReminders: true,
        speakerUpdates: true,
        scheduleChanges: true,
        partnerAnnouncements: false,
        marketingUpdates: false,
      },
      
      subscription: null,
      isSubscribed: false,

      // In-app notification actions
      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (notificationId) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === notificationId)
          const wasUnread = notification && !notification.read
          
          return {
            notifications: state.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n
            ),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      clearNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
        })
      },

      setNotifications: (notifications) => {
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
        })
      },

      removeNotification: (notificationId) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === notificationId)
          const wasUnread = notification && !notification.read
          
          return {
            notifications: state.notifications.filter((n) => n.id !== notificationId),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          }
        })
      },

      // Initialize notification state - MUST be called on component mount
      initialize: async () => {
        if (get().isInitialized) {
          console.log('[Notifications] Already initialized')
          return
        }
        
        console.log('[Notifications] Initializing...')
        
        // Check browser support
        const supported = hasNotificationAPI && hasServiceWorker
        console.log('[Notifications] Browser support:', { 
          hasNotificationAPI, 
          hasServiceWorker, 
          supported 
        })
        
        if (!supported) {
          console.warn('[Notifications] Push notifications not supported in this browser')
          set({ isSupported: false, isInitialized: true })
          return
        }
        
        // Get current permission status
        const currentPermission = Notification.permission as PermissionStatus
        console.log('[Notifications] Current permission:', currentPermission)
        
        set({
          isSupported: true,
          permission: currentPermission,
          isInitialized: true,
        })
        
        // Check for existing subscription if permission is granted
        if (currentPermission === 'granted') {
          try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            
            if (subscription) {
              console.log('[Notifications] Found existing subscription')
              const pushSubscription: PushSubscriptionData = {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
                  auth: arrayBufferToBase64(subscription.getKey('auth')!),
                },
              }
              set({ 
                subscription: pushSubscription,
                isSubscribed: true,
              })
            } else {
              console.log('[Notifications] No existing subscription found')
            }
          } catch (error) {
            console.error('[Notifications] Error checking existing subscription:', error)
          }
        }
      },

      // Push notification actions
      requestPermission: async () => {
        console.log('[Notifications] Requesting permission...')
        
        if (!get().isSupported) {
          console.warn('[Notifications] Cannot request permission - not supported')
          return false
        }
        
        try {
          const permission = await Notification.requestPermission()
          console.log('[Notifications] Permission response:', permission)
          set({ permission: permission as PermissionStatus })
          
          if (permission === 'granted') {
            console.log('[Notifications] Permission granted, subscribing...')
            await get().subscribe()
            return true
          }
          
          console.log('[Notifications] Permission not granted:', permission)
          return false
        } catch (error) {
          console.error('[Notifications] Error requesting permission:', error)
          return false
        }
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      subscribe: async () => {
        const state = get()
        console.log('[Notifications] Subscribe attempt:', {
          isSupported: state.isSupported,
          permission: state.permission,
        })
        
        if (!state.isSupported) {
          console.error('[Notifications] Cannot subscribe - not supported')
          return false
        }
        
        if (state.permission !== 'granted') {
          console.error('[Notifications] Cannot subscribe - permission not granted:', state.permission)
          return false
        }
        
        try {
          console.log('[Notifications] Waiting for service worker...')
          const registration = await navigator.serviceWorker.ready
          console.log('[Notifications] Service worker ready')
          
          // Check if already subscribed
          let subscription = await registration.pushManager.getSubscription()
          
          if (!subscription) {
            // Subscribe to push notifications
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            
            if (!vapidPublicKey) {
              console.error('[Notifications] VAPID public key not configured!')
              console.error('[Notifications] Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY in your .env.local file')
              console.error('[Notifications] Run: npx web-push generate-vapid-keys')
              return false
            }
            
            console.log('[Notifications] Creating new push subscription...')
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            })
            console.log('[Notifications] Subscription created:', subscription.endpoint)
          } else {
            console.log('[Notifications] Using existing subscription')
          }
          
          // Store subscription
          const pushSubscription: PushSubscriptionData = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
              auth: arrayBufferToBase64(subscription.getKey('auth')!),
            },
          }
          
          set({ 
            subscription: pushSubscription,
            isSubscribed: true,
          })
          
          // Send subscription to server
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pushSubscription),
          })
          
          return true
        } catch (error) {
          console.error('Error subscribing to push notifications:', error)
          return false
        }
      },

      unsubscribe: async () => {
        const state = get()
        if (!state.isSupported) return false
        
        try {
          const registration = await navigator.serviceWorker.ready
          const subscription = await registration.pushManager.getSubscription()
          
          if (subscription) {
            await subscription.unsubscribe()
            
            // Notify server
            await fetch('/api/notifications/unsubscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ endpoint: subscription.endpoint }),
            })
          }
          
          set({ 
            subscription: null,
            isSubscribed: false,
          })
          
          return true
        } catch (error) {
          console.error('Error unsubscribing from push notifications:', error)
          return false
        }
      },

      sendTestNotification: () => {
        if (!get().isSupported || get().permission !== 'granted') return
        
        new Notification('SynergyCon 2026', {
          body: 'Push notifications are working! You\'ll receive updates about the event.',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'test-notification',
          requireInteraction: false,
        })
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        settings: state.settings,
        permission: state.permission,
        subscription: state.subscription,
        isSubscribed: state.isSubscribed,
      }),
    }
  )
)

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray as Uint8Array<ArrayBuffer>
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}
