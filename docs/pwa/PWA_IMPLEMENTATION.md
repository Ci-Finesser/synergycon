# PWA Implementation Guide

## Overview

This application has been enhanced with comprehensive Progressive Web App (PWA) capabilities including:

- **Offline Support** - Full offline functionality with intelligent caching
- **App Installation** - Install as native app on any device
- **Push Notifications** - Real-time notifications for updates
- **Background Sync** - Automatic syncing when connection restored
- **Network Quality Detection** - Adaptive UI based on connection
- **Cache Management** - Advanced cache control and optimization

## Features Implemented

### 1. Zustand State Management Stores

#### PWA Install Store (`lib/stores/pwa-install-store.ts`)
- Manages app installation state
- Handles install prompt timing and display
- Tracks user dismissals with smart retry logic
- Detects if app is already installed

#### Network Store (`lib/stores/network-store.ts`)
- Real-time network status monitoring
- Connection quality detection (offline/slow/good/excellent)
- Network Information API integration
- Connection type detection (wifi/cellular/ethernet)

#### Sync Queue Store (`lib/stores/sync-queue-store.ts`)
- Queues failed requests for retry
- Priority-based request handling
- Automatic syncing when online
- Failed request management

#### Cache Store (`lib/stores/cache-store.ts`)
- Cache size and statistics tracking
- Cache clearing and management
- Resource preloading
- Cache expiration handling

#### Notification Store (`lib/stores/notification-store.ts`)
- Push notification subscription management
- Notification preference controls
- Permission request handling
- Test notification sending

### 2. UI Components

#### PWA Install Prompt (`components/pwa/install-prompt.tsx`)
- Beautiful, non-intrusive install prompt
- Smart timing (shows after 30 seconds)
- Respects user dismissals
- Shows installation benefits

#### Network Indicator (`components/pwa/network-indicator.tsx`)
- Real-time network status display
- Connection quality visualization
- Automatic showing/hiding based on status

#### Update Notification (`components/pwa/update-notification.tsx`)
- Alerts users to new versions
- One-click update functionality
- Service worker update handling

#### Notification Permission (`components/pwa/notification-permission.tsx`)
- Permission request UI
- Detailed notification settings
- Category-based preferences
- Test notification button

#### Sync Queue Manager (`components/pwa/sync-queue-manager.tsx`)
- Visual queue management
- Retry failed requests
- Clear completed items
- Priority indicators

#### Cache Manager (`components/pwa/cache-manager.tsx`)
- Cache statistics display
- Storage breakdown by cache type
- Clear cache functionality
- Size visualization

### 3. Service Worker

**Features:**
- Multiple caching strategies:
  - **Cache First** - Static assets, images
  - **Network First** - API requests, dynamic content
  - **Stale While Revalidate** - Background updates
- Cache size limits and expiration
- Background sync support
- Push notification handling
- Offline fallback pages

### 4. Custom Hooks

#### `usePWA()` (`hooks/use-pwa.ts`)
- Service worker registration
- Automatic update checking
- Message handling from SW

#### `useOfflineSync()`
- Request queuing for offline support
- Automatic retry logic
- Online/offline detection

#### `useNetworkQuality()`
- Connection quality information
- Image quality recommendations
- Heavy resource loading decisions

## Setup Instructions

### 1. Install Dependencies

```bash
npm install zustand workbox-window workbox-precaching workbox-routing workbox-strategies workbox-expiration workbox-background-sync idb
```

Or if using pnpm:
```bash
pnpm add zustand workbox-window workbox-precaching workbox-routing workbox-strategies workbox-expiration workbox-background-sync idb
```

### 2. Generate App Icons

Create the following icon sizes in the `public/` directory:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- badge-72x72.png (for notification badge)

You can use tools like [Favicon Generator](https://realfavicongenerator.net/) or [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator).

### 3. Generate Screenshots (Optional)

For the app store install prompt:
- screenshot-mobile.png (640x1136)
- screenshot-desktop.png (1920x1080)

### 4. Configure VAPID Keys (for Push Notifications)

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

Add to `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### 5. Update Environment Variables

Create or update `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_vapid_key
VAPID_PRIVATE_KEY=your_private_vapid_key
```

## Usage

### Basic Integration (Already Done)

The PWA features are automatically integrated via the `PWAProvider` in the main layout. No additional setup needed!

### Install Prompt

The install prompt will automatically appear:
- After 30 seconds on first visit
- If not dismissed more than 3 times
- At least 7 days after last dismissal

### Manual Installation Control

```tsx
import { usePWAInstallStore } from '@/lib/stores/pwa-install-store'

function MyComponent() {
  const { promptInstall, isInstallable } = usePWAInstallStore()
  
  return (
    <button onClick={promptInstall} disabled={!isInstallable}>
      Install App
    </button>
  )
}
```

### Offline Sync

```tsx
import { useOfflineSync } from '@/hooks/use-pwa'

function MyComponent() {
  const { queueRequest, isOnline } = useOfflineSync()
  
  const handleSubmit = async (data) => {
    try {
      await queueRequest('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      }, 'high') // priority: 'low' | 'normal' | 'high'
    } catch (error) {
      console.log('Queued for sync when online')
    }
  }
}
```

### Network Quality Adaptation

```tsx
import { useNetworkQuality } from '@/hooks/use-pwa'

function ImageComponent() {
  const { getImageQuality, shouldLoadHeavyResources } = useNetworkQuality()
  
  const quality = getImageQuality() // 'low' | 'medium' | 'high'
  
  return (
    <img 
      src={`/images/photo-${quality}.jpg`}
      loading={shouldLoadHeavyResources() ? 'eager' : 'lazy'}
    />
  )
}
```

### Push Notifications

```tsx
import { useNotificationStore } from '@/lib/stores/notification-store'

function NotificationButton() {
  const { requestPermission, sendTestNotification } = useNotificationStore()
  
  return (
    <>
      <button onClick={requestPermission}>
        Enable Notifications
      </button>
      <button onClick={sendTestNotification}>
        Test Notification
      </button>
    </>
  )
}
```

## PWA Settings Page

Access the comprehensive PWA management interface at:
```
/pwa-settings
```

This page provides:
- Installation status and controls
- Network monitoring
- Sync queue management
- Notification preferences
- Cache statistics and management

## Testing

### Local Testing

1. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

2. **Test in browser:**
   - Chrome: DevTools > Application > Service Workers
   - Check "Offline" to test offline functionality
   - View "Manifest" to validate PWA configuration
   - Check "Storage" for cache inspection

### Testing Install Prompt

1. Open DevTools > Application > Manifest
2. Click "Add to homescreen" to test install
3. Or use the install button in address bar (desktop Chrome)

### Testing Push Notifications

1. Subscribe to notifications via the UI
2. Use the test notification button
3. Or send via API:
   ```bash
   curl -X POST http://localhost:3000/api/notifications/send \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","body":"Hello!"}'
   ```

## Performance Optimization

### Caching Strategies

- **Static Assets**: Cached first, updated in background
- **Images**: Cached for 30 days, limited to 60 items
- **API Requests**: Network first, cache fallback, 5-minute expiration
- **Pages**: Network first, cache for 7 days

### Cache Limits

- Dynamic Cache: 50 items max
- Image Cache: 60 items max
- API Cache: 20 items max

### Background Sync

- Failed requests automatically retry when online
- Priority queue system
- Exponential backoff for retries

## Deployment

### Vercel

PWA works out of the box on Vercel. No additional configuration needed.

### Other Platforms

Ensure:
1. Service worker is served with correct headers
2. Manifest is accessible at `/manifest.json`
3. HTTPS is enabled (required for PWA)

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari (iOS 16.4+)**: Full support including push notifications
- **Safari (< 16.4)**: Limited (no push notifications)
- **Samsung Internet**: Full support

## Troubleshooting

### Install Prompt Not Showing

- Check if already installed
- Clear browser data and revisit
- Ensure HTTPS connection
- Check dismiss count in localStorage

### Service Worker Not Registering

- Check browser console for errors
- Verify `/sw.js` is accessible
- Ensure HTTPS (except localhost)
- Clear application cache

### Notifications Not Working

- Check permission status
- Verify VAPID keys are configured
- Ensure HTTPS connection
- Check browser notification settings

### Cache Issues

- Use Cache Manager UI to clear caches
- Check service worker update
- Verify cache size limits
- Clear browser application data

## Best Practices

1. **Always handle offline gracefully**
2. **Show network status to users**
3. **Queue important operations**
4. **Use appropriate cache strategies**
5. **Respect user's data saver mode**
6. **Test on real devices**
7. **Monitor cache sizes**
8. **Update service worker regularly**

## Additional Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Push API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

## License

Same as main project
