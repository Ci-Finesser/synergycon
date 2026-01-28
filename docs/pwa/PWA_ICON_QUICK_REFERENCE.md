# PWA Icon Generation - Quick Reference

## 🚀 Quick Start

```bash
# 1. Place source icon in /public (icon.svg, icon.png, logo.svg, or logo.png)
# 2. Run setup script
npm run pwa:setup

# 3. Preview generated icons
# Open: http://localhost:3000/icon-preview.html
```

## 📋 Generated Files

### PWA Icons (8 files)
- `icon-72x72.png` → Small screens
- `icon-96x96.png` → Low DPI
- `icon-128x128.png` → Chrome Web Store
- `icon-144x144.png` → Windows tiles
- `icon-152x152.png` → iPad
- `icon-192x192.png` → Android (maskable)
- `icon-384x384.png` → High DPI (maskable)
- `icon-512x512.png` → Splash screens (maskable)

### Additional Icons (2 files)
- `favicon.png` → 32x32
- `apple-touch-icon.png` → 180x180

## 🎨 Source Icon Requirements

| Property | Requirement |
|----------|-------------|
| **Minimum Size** | 512x512px |
| **Recommended** | 1024x1024px+ |
| **Format** | SVG (preferred) or PNG |
| **Background** | Transparent |
| **Design** | Simple, centered |
| **Safe Zone** | Keep content in central 80% |

## 🔧 Manual Installation

If automatic installation fails:

```bash
npm install --save-dev sharp --legacy-peer-deps
```

## 📊 Verification Checklist

- [ ] All 10 icons generated in `/public`
- [ ] `manifest.json` updated
- [ ] VAPID keys in `.env.local`
- [ ] Icons load in preview (`/icon-preview.html`)
- [ ] Manifest validates (DevTools > Application)
- [ ] PWA installable

## 🧪 Testing

### Local Testing
```bash
npm run build
npm start
# Open: http://localhost:3000
```

### Chrome DevTools
1. Open DevTools (F12)
2. Application tab
3. Check Manifest section
4. Verify all icons load
5. Test service worker

### Visual Testing
```
http://localhost:3000/icon-preview.html
```

## 🐛 Troubleshooting

### Issue: "No source icon found"
**Solution**: Place icon file with supported name in `/public`
- icon.svg, icon.png
- logo.svg, logo.png
- app-icon.svg, app-icon.png

### Issue: Sharp installation failed
**Solution**: 
```bash
npm install --save-dev sharp --legacy-peer-deps
```

### Issue: Icons look blurry
**Solution**: Use larger source image (1024x1024px+)

### Issue: Maskable icons cropped
**Solution**: Keep important content in central 80% of image

## 📁 File Sizes (Approximate)

| Icon Size | Typical File Size |
|-----------|-------------------|
| 72x72 | ~1-2 KB |
| 96x96 | ~1-2 KB |
| 128x128 | ~2-3 KB |
| 144x144 | ~2-3 KB |
| 152x152 | ~2-3 KB |
| 192x192 | ~3-5 KB |
| 384x384 | ~5-10 KB |
| 512x512 | ~8-15 KB |

**Total**: ~25-45 KB for all icons

## 🔗 Useful Links

- **Maskable Tool**: https://maskable.app/editor
- **PWA Builder**: https://www.pwabuilder.com/
- **Web.dev Guide**: https://web.dev/articles/add-manifest
- **Manifest Spec**: https://www.w3.org/TR/appmanifest/

## ⚡ Advanced Usage

### Custom Icon Sizes

Edit `scripts/setup-pwa.js`:
```javascript
const ICON_SIZES = [
  { size: 72, purpose: 'any' },
  { size: 256, purpose: 'any' }, // Add custom size
  // ...
]
```

### Specific Source Image

Run with custom source:
```javascript
const sourceIcon = '/path/to/custom-icon.png'
```

### Skip VAPID Generation

Comment out in `setup-pwa.js`:
```javascript
// await setupVAPIDKeys()
```

## 🎯 Best Practices

1. ✅ Use SVG source for best quality
2. ✅ Test on real devices
3. ✅ Verify safe zones for maskable
4. ✅ Check dark/light themes
5. ✅ Optimize source image
6. ✅ Keep design simple
7. ✅ Use high contrast
8. ✅ Avoid small text

## 🔄 Regeneration

To regenerate icons:
```bash
# Delete existing icons
rm public/icon-*.png

# Run setup again
npm run pwa:setup
```

## 📱 Platform Support

| Platform | Icon Sizes Used |
|----------|-----------------|
| **Android** | 72, 96, 128, 192, 512 |
| **iOS** | 152, 180 (apple-touch-icon) |
| **Desktop** | 128, 192, 512 |
| **Windows** | 144 |

## 🎨 Design Tips

### Do's ✅
- Simple, recognizable shapes
- High contrast colors
- Centered composition
- Transparent background
- Vector graphics (SVG)
- Test at 72x72px

### Don'ts ❌
- Complex details
- Small text
- Thin lines
- Off-center design
- Gradients (use sparingly)
- Low contrast

---

**Script Version**: 2.0.0  
**Last Updated**: December 30, 2025  
**Node.js**: 14.0.0+ required  
**Sharp**: 0.30.0+ required
