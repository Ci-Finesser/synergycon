/**
 * Example: Using PWA features in your components
 * 
 * This file demonstrates how to integrate PWA capabilities
 * into existing components using the Zustand stores and hooks.
 */

'use client'

import { useEffect } from 'react'
import { useNetworkStore } from '@/lib/stores/network-store'
import { useSyncQueueStore } from '@/lib/stores/sync-queue-store'
import { usePWAInstallStore } from '@/lib/stores/pwa-install-store'
import { useNotificationStore } from '@/lib/stores/notification-store'
import { useOfflineSync, useNetworkQuality } from '@/hooks/use-pwa'

// Example 1: Form with Offline Support
export function RegistrationFormWithOffline() {
  const { queueRequest, isOnline } = useOfflineSync()

  const handleSubmit = async (formData: any) => {
    try {
      // This will work online or offline
      // If offline, it queues the request for later
      await queueRequest('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }, 'high') // Priority: high for important operations
      
      alert('Registration submitted!')
    } catch (error) {
      // If offline, the request is queued
      alert(isOnline 
        ? 'Registration failed. Please try again.' 
        : 'You are offline. Registration will be sent when connection is restored.')
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSubmit({ name: 'John', email: 'john@example.com' })
    }}>
      {/* Your form fields */}
      <button type="submit">
        {isOnline ? 'Register Now' : 'Register (Will sync later)'}
      </button>
    </form>
  )
}

// Example 2: Adaptive Image Loading
export function AdaptiveImage({ src, alt }: { src: string, alt: string }) {
  const { getImageQuality, shouldLoadHeavyResources } = useNetworkQuality()
  
  const quality = getImageQuality() // 'low' | 'medium' | 'high'
  
  // Use different image qualities based on connection
  const imageSrc = {
    low: src.replace('.jpg', '-low.jpg'),
    medium: src.replace('.jpg', '-medium.jpg'),
    high: src,
  }[quality]

  return (
    <img 
      src={imageSrc}
      alt={alt}
      loading={shouldLoadHeavyResources() ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

// Example 3: Network Status Badge
export function NetworkStatusBadge() {
  const { isOnline, quality } = useNetworkStore()
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className="text-sm text-muted-foreground">
        {isOnline ? `Connected (${quality})` : 'Offline'}
      </span>
    </div>
  )
}

// Example 4: Install App Button
export function InstallAppButton() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstallStore()
  
  if (isInstalled || !isInstallable) return null
  
  return (
    <button 
      onClick={promptInstall}
      className="px-4 py-2 bg-primary text-white rounded-lg"
    >
      Install App
    </button>
  )
}

// Example 5: Sync Status Indicator
export function SyncStatusIndicator() {
  const { getPendingCount, getFailedCount, processQueue } = useSyncQueueStore()
  const { isOnline } = useNetworkStore()
  
  const pending = getPendingCount()
  const failed = getFailedCount()
  
  if (pending === 0 && failed === 0) return null
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-card border rounded-lg shadow-lg">
      <p className="text-sm font-medium mb-2">
        {pending} items pending sync
      </p>
      {failed > 0 && (
        <p className="text-sm text-destructive mb-2">
          {failed} items failed
        </p>
      )}
      {isOnline && pending > 0 && (
        <button 
          onClick={processQueue}
          className="text-sm text-primary hover:underline"
        >
          Sync Now
        </button>
      )}
    </div>
  )
}

// Example 6: Notification Preference Toggle
export function NotificationToggle() {
  const { 
    permission, 
    settings, 
    updateSettings, 
    requestPermission,
    initialize,
  } = useNotificationStore()
  
  // Initialize on mount
  useEffect(() => {
    initialize()
  }, [initialize])
  
  const handleToggle = async () => {
    if (permission === 'default') {
      await requestPermission()
    } else {
      updateSettings({ enabled: !settings.enabled })
    }
  }
  
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={settings.enabled}
        onChange={handleToggle}
        disabled={permission === 'denied'}
      />
      <span>Enable Notifications</span>
    </label>
  )
}

// Example 7: Data Saver Aware Component
export function DataSaverAwareVideo() {
  const { saveData, quality } = useNetworkStore()
  
  // Don't autoplay videos on slow connections or data saver mode
  const shouldAutoplay = !saveData && quality !== 'slow'
  
  return (
    <video 
      autoPlay={shouldAutoplay}
      muted
      loop
      playsInline
    >
      <source src="/video.mp4" type="video/mp4" />
    </video>
  )
}

// Example 8: Component that shows offline banner
export function OfflineModeBanner() {
  const { isOnline } = useNetworkStore()
  
  if (isOnline) return null
  
  return (
    <div className="bg-yellow-500 text-black px-4 py-2 text-center">
      ⚠️ You are offline. Some features may be limited.
    </div>
  )
}

// Example 9: Background Sync on Form Submission
export function CommentForm({ postId }: { postId: string }) {
  const { addToQueue } = useSyncQueueStore()
  const { isOnline } = useNetworkStore()

  const handleSubmit = async (comment: string) => {
    const requestId = addToQueue({
      url: `/api/posts/${postId}/comments`,
      method: 'POST',
      body: { comment, timestamp: Date.now() },
      priority: 'normal',
      maxRetries: 3,
    })
    
    // Show user feedback
    if (!isOnline) {
      alert('Your comment will be posted when you\'re back online')
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleSubmit(formData.get('comment') as string)
    }}>
      <textarea name="comment" required />
      <button type="submit">Post Comment</button>
    </form>
  )
}

// Example 10: Complete PWA-Aware Page Component
export function PWAAwarePage() {
  const { isOnline, quality } = useNetworkStore()
  const { isInstalled } = usePWAInstallStore()
  const { permission } = useNotificationStore()
  
  return (
    <div className="container">
      {/* Show PWA status */}
      <div className="flex gap-4 mb-4">
        <NetworkStatusBadge />
        {!isInstalled && <InstallAppButton />}
      </div>
      
      {/* Content that adapts to connection */}
      <div className="content">
        {quality === 'excellent' && (
          <div>High quality content with videos and animations</div>
        )}
        {quality === 'slow' && (
          <div>Simplified content, no heavy media</div>
        )}
        {!isOnline && (
          <div>Cached content only, limited interactivity</div>
        )}
      </div>
      
      {/* Sync status */}
      <SyncStatusIndicator />
    </div>
  )
}

/**
 * USAGE PATTERNS
 * 
 * 1. Always check isOnline before making requests
 * 2. Use useOfflineSync for important operations
 * 3. Adapt UI based on network quality
 * 4. Queue requests when offline
 * 5. Show clear feedback to users
 * 6. Respect data saver mode
 * 7. Provide offline alternatives
 * 8. Test offline scenarios thoroughly
 */
