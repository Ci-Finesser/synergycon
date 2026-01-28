# 🚀 PWA Quick Reference Card

## 📦 Installation
```bash
npm install zustand framer-motion
npm run pwa:setup  # Generate VAPID keys
```

## 🎯 Import Stores
```typescript
import { usePWAInstallStore } from '@/lib/stores/pwa-install-store'
import { useNetworkStore } from '@/lib/stores/network-store'
import { useSyncQueueStore } from '@/lib/stores/sync-queue-store'
import { useCacheStore } from '@/lib/stores/cache-store'
import { useNotificationStore } from '@/lib/stores/notification-store'
```

## 🎣 Use Hooks
```typescript
import { usePWA, useOfflineSync, useNetworkQuality } from '@/hooks/use-pwa'
```

## 💡 Common Patterns

### Check Network Status
```typescript
const { isOnline, quality } = useNetworkStore()
// quality: 'offline' | 'slow' | 'good' | 'excellent'
```

### Handle Offline Requests
```typescript
const { queueRequest } = useOfflineSync()
await queueRequest('/api/data', {
  method: 'POST',
  body: JSON.stringify(data)
}, 'high') // priority
```

### Trigger Install Prompt
```typescript
const { promptInstall, isInstallable } = usePWAInstallStore()
<button onClick={promptInstall} disabled={!isInstallable}>
  Install App
</button>
```

### Request Notifications
```typescript
const { requestPermission } = useNotificationStore()
await requestPermission()
```

### Adaptive Loading
```typescript
const { getImageQuality, shouldLoadHeavyResources } = useNetworkQuality()
const quality = getImageQuality() // 'low' | 'medium' | 'high'
```

### Manage Sync Queue
```typescript
const { queue, processQueue, getPendingCount } = useSyncQueueStore()
const pending = getPendingCount()
await processQueue() // Manual sync
```

### Clear Cache
```typescript
const { clearCache, updateStats } = useCacheStore()
await clearCache() // Clear all
await clearCache('api-cache') // Clear specific
```

## 📍 Key URLs
- `/pwa-settings` - PWA control panel
- `/offline` - Offline fallback page

## 🎨 UI Components
```typescript
import { PWAProvider } from '@/components/pwa'
import { PWAInstallPrompt } from '@/components/pwa/install-prompt'
import { NetworkIndicator } from '@/components/pwa/network-indicator'
import { UpdateNotification } from '@/components/pwa/update-notification'
import { SyncQueueManager } from '@/components/pwa/sync-queue-manager'
import { CacheManager } from '@/components/pwa/cache-manager'
import { NotificationPermission } from '@/components/pwa/notification-permission'
```

## ⚙️ Configuration Files
- `public/manifest.json` - App manifest
- `public/sw.js` - Service worker
- `.env.local` - VAPID keys

## 🔑 Environment Variables
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

## 🧪 Testing
```bash
npm run build
npm start
# Open: chrome://serviceworker-internals
# Check: DevTools > Application > Service Workers
```

## 📱 Required Icons (in /public)
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- badge-72x72.png

## 🎯 Cache Strategies
| Type | Strategy | Max | TTL |
|------|----------|-----|-----|
| Static | Cache First | ∞ | Never |
| Images | Cache First | 60 | 30d |
| API | Network First | 20 | 5m |
| Pages | Network First | 50 | 7d |

## 🔍 Debugging
```typescript
// Check installation status
usePWAInstallStore.getState().isInstalled

// Check network quality
useNetworkStore.getState().quality

// View sync queue
useSyncQueueStore.getState().queue

// Check notification permission
useNotificationStore.getState().permission
```

## 📊 Store State Persistence
- ✅ PWA Install Store (dismissal count, last dismissed)
- ✅ Sync Queue Store (full queue)
- ✅ Notification Store (settings, permission)
- ❌ Network Store (runtime only)
- ❌ Cache Store (runtime only)

## 🎨 Notification Categories
1. Event Reminders
2. Speaker Updates
3. Schedule Changes
4. Partner Announcements
5. Marketing Updates
6. All (master toggle)

## ⚡ Quick Actions
```typescript
// Manual sync
useSyncQueueStore.getState().processQueue()

// Clear completed syncs
useSyncQueueStore.getState().clearCompleted()

// Update cache stats
useCacheStore.getState().updateStats()

// Send test notification
useNotificationStore.getState().sendTestNotification()
```

## 🐛 Common Issues

### Service Worker Not Registering
- Check HTTPS (or localhost)
- Clear cache: DevTools > Application > Clear Storage
- Rebuild: `npm run build`

### Install Prompt Not Showing
- Check if already installed
- Wait 30 seconds
- Check dismiss count in localStorage
- Ensure manifest is valid

### Notifications Not Working
- Check permission status
- Verify VAPID keys in .env.local
- Ensure HTTPS connection
- Check browser settings

## 📚 Documentation
- [PWA_IMPLEMENTATION.md](docs/PWA_IMPLEMENTATION.md) - Full guide
- [PWA_QUICKSTART.md](PWA_QUICKSTART.md) - Quick setup
- [PWA_FILES_ADDED.md](PWA_FILES_ADDED.md) - File list
- [pwa-usage-examples.tsx](components/examples/pwa-usage-examples.tsx) - Examples

## 🎉 Success Checklist
- [ ] Dependencies installed
- [ ] VAPID keys generated
- [ ] Icons created
- [ ] Service worker registered
- [ ] Install prompt works
- [ ] Offline mode works
- [ ] Notifications enabled
- [ ] Cache functioning
- [ ] Sync queue operational

---

**Built with Zustand + Next.js + TypeScript**
**Ready for Production** ✅
