# PWA Quick Start Guide

## Installation

The PWA features have been fully implemented! Follow these steps to get started:

### 1. Install Dependencies

```bash
npm install zustand framer-motion
```

Note: If using TypeScript, ensure types are available:
```bash
npm install -D @types/node
```

### 2. Generate VAPID Keys (for Push Notifications)

```bash
node scripts/setup-pwa.js
```

This will generate VAPID keys and add them to `.env.local`.

### 3. Generate App Icons

Create the following icons in the `public/` directory:

**Required Sizes:**
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- badge-72x72.png

**Quick Icon Generation:**

Option 1 - Using an existing logo:
```bash
# Using ImageMagick (install first: https://imagemagick.org/)
convert your-logo.png -resize 192x192 public/icon-192x192.png
convert your-logo.png -resize 512x512 public/icon-512x512.png
# ... repeat for other sizes
```

Option 2 - Online tool:
- Visit: https://www.pwabuilder.com/imageGenerator
- Upload your logo
- Download generated icons
- Place in `public/` directory

### 4. Build and Test

```bash
npm run build
npm start
```

Visit `http://localhost:3000` in Chrome and:
1. Open DevTools (F12)
2. Go to Application tab
3. Check "Service Workers" - should see registered worker
4. Check "Manifest" - should see app details
5. Test offline mode with "Offline" checkbox

### 5. Test Installation

**Desktop (Chrome/Edge):**
- Look for install icon in address bar
- Or wait 30 seconds for install prompt

**Mobile:**
- Open in Chrome/Safari
- Tap "Add to Home Screen"

### 6. Access PWA Settings

Visit `/pwa-settings` to manage:
- App installation
- Network status
- Sync queue
- Notifications
- Cache

## Features Overview

### ✅ Offline Support
- Works completely offline
- Intelligent caching strategies
- Background sync when online

### ✅ App Installation
- Install prompt after 30 seconds
- Smart dismissal tracking
- Native app experience

### ✅ Push Notifications
- Real-time event updates
- Customizable preferences
- Test notifications

### ✅ Network Awareness
- Quality detection
- Adaptive loading
- Data saver mode respect

### ✅ Background Sync
- Queues failed requests
- Priority system
- Auto-retry logic

### ✅ Cache Management
- Size tracking
- Manual clearing
- Auto-expiration

## Testing Checklist

- [ ] Service worker registers successfully
- [ ] Manifest loads without errors
- [ ] Install prompt appears (or can be triggered)
- [ ] App works offline
- [ ] Network indicator shows status
- [ ] Sync queue handles failed requests
- [ ] Notifications can be enabled
- [ ] Cache manager shows statistics
- [ ] Update notification appears on new version

## Production Deployment

### Environment Variables

Update `.env.local` (or your hosting platform's env vars):

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### Vercel Deployment

PWA works automatically on Vercel! Just:
1. Add environment variables in Vercel dashboard
2. Deploy
3. Visit your site over HTTPS
4. PWA features will work immediately

### Other Platforms

Ensure:
- HTTPS is enabled (required for PWA)
- Service worker and manifest are accessible
- Headers are configured (already done in next.config.mjs)

## Troubleshooting

### Service Worker Not Registering

```bash
# Clear browser cache
# In DevTools: Application > Clear Storage > Clear site data

# Rebuild
npm run build
npm start
```

### Install Prompt Not Showing

- Check if already installed (look in chrome://apps)
- Ensure HTTPS (or localhost)
- Wait 30 seconds or manually trigger in code
- Check dismissal count in localStorage

### Icons Not Loading

- Verify icons exist in `public/` directory
- Check file names match manifest.json exactly
- Ensure correct file extensions (.png)

## Need Help?

- Check [docs/PWA_IMPLEMENTATION.md](./docs/PWA_IMPLEMENTATION.md) for detailed docs
- Visit [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps/)
- Test at: [PWABuilder](https://www.pwabuilder.com/)

## What's Next?

1. Generate production icons
2. Add custom notification logic
3. Customize offline page design
4. Add analytics for PWA usage
5. Test on various devices

Enjoy your new PWA! 🚀
