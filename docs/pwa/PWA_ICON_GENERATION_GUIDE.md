# PWA Icon Generation Guide

## Overview

The automated PWA icon generation system creates optimized icons in all required sizes from a single source image. This ensures consistent branding across all devices and platforms.

## Features

✅ **Automated Generation**: Creates all PWA icon sizes (72x72 to 512x512)  
✅ **Maskable Icons**: Generates properly padded maskable icons for modern Android  
✅ **Safe Zones**: Respects 10% safe zone requirements for maskable icons  
✅ **High Quality**: Uses Sharp for optimal image processing  
✅ **Additional Icons**: Generates favicon and Apple touch icons  
✅ **Manifest Update**: Automatically updates manifest.json  
✅ **Error Handling**: Robust error handling and validation  
✅ **Progress Feedback**: Clear console output showing generation status  

## Quick Start

### 1. Prepare Your Source Icon

Place a high-quality icon in the `/public` directory with one of these names:
- `icon.svg` (recommended - scalable)
- `icon.png`
- `logo.svg`
- `logo.png`
- `app-icon.svg`
- `app-icon.png`

**Requirements:**
- **Minimum size**: 512x512px
- **Recommended**: 1024x1024px or larger
- **Format**: SVG (preferred) or PNG with transparency
- **Content**: Center your logo/icon for maskable icon compatibility
- **Safe zone**: Keep important content within central 80% of image

### 2. Run the Setup Script

```bash
npm run pwa:setup
```

Or directly:

```bash
node scripts/setup-pwa.js
```

### 3. Verify Generated Icons

Check the `/public` directory for these generated files:

**PWA Icons:**
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png` (any + maskable)
- `icon-384x384.png` (any + maskable)
- `icon-512x512.png` (any + maskable)

**Additional Icons:**
- `favicon.png` (32x32)
- `apple-touch-icon.png` (180x180)

## Generated Icon Specifications

### Standard Icons

| Size | Purpose | Used For |
|------|---------|----------|
| 72x72 | any | Small screen devices |
| 96x96 | any | Low DPI displays |
| 128x128 | any | Chrome Web Store |
| 144x144 | any | Windows tiles |
| 152x152 | any | iPad |
| 192x192 | any + maskable | Android home screen |
| 384x384 | any + maskable | High DPI displays |
| 512x512 | any + maskable | Splash screens |

### Maskable Icons

Maskable icons include a 10% safe zone on all sides to ensure the icon looks good when masked into different shapes (circle, squircle, etc.) on Android devices.

**Safe Zone Calculation:**
- Total size: 100%
- Safe zone: 10% on each side
- Icon content: 80% of total size
- Padding: 10% on all sides

Example for 512x512:
- Actual icon content: 410x410px
- Padding: 51px on each side

## Technical Details

### Image Processing

The script uses [Sharp](https://sharp.pixelplumbing.com/) for high-performance image processing:

```javascript
// Standard icon generation
sharp(sourceBuffer)
  .resize(size, size, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png({
    quality: 100,
    compressionLevel: 9,
    adaptiveFiltering: true,
    palette: true
  })
```

### Optimization Settings

- **Quality**: 100% (lossless for PNG)
- **Compression**: Level 9 (maximum)
- **Adaptive Filtering**: Enabled for better compression
- **Palette**: Enabled to reduce file size

### Manifest Integration

The script automatically updates `manifest.json` with icon references:

```json
{
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## Best Practices

### Source Image Guidelines

1. **Use SVG when possible**: Scalable and produces cleaner results
2. **High resolution**: 1024x1024px or larger for PNG sources
3. **Transparent background**: Allows flexibility across themes
4. **Simple design**: Works better at small sizes
5. **Center alignment**: Essential for maskable icons
6. **Test at small sizes**: Ensure legibility at 72x72px

### Icon Design Tips

- **Keep it simple**: Complex designs don't scale well
- **Bold shapes**: Ensure visibility at small sizes
- **High contrast**: Works across light/dark backgrounds
- **Avoid text**: Text becomes unreadable at small sizes
- **Respect safe zones**: For maskable icons, keep content centered

### Testing Your Icons

1. **Visual inspection**: Check all generated sizes
2. **Device testing**: Test on actual devices
3. **Manifest validator**: Use Chrome DevTools
4. **Different themes**: Test light/dark backgrounds
5. **Maskable preview**: Use [Maskable.app](https://maskable.app/)

## Troubleshooting

### Sharp Installation Issues

If Sharp fails to install automatically:

```bash
# Using npm
npm install --save-dev sharp

# Using pnpm
pnpm add -D sharp

# Using yarn
yarn add --dev sharp
```

### Source Icon Not Found

Error: "No source icon found in public directory"

**Solution**: Place an icon file with one of the supported names:
- icon.svg, icon.png
- logo.svg, logo.png
- app-icon.svg, app-icon.png

### Low Quality Output

**Causes**:
- Source image too small
- Source image low quality
- Compression artifacts in source

**Solution**: Use a high-resolution source (1024x1024px+)

### Maskable Icons Look Cropped

**Cause**: Important content outside the safe zone

**Solution**: Redesign source icon with content in central 80%

## Manual Icon Generation

If you need to generate icons manually:

### Using Sharp

```javascript
const sharp = require('sharp')

sharp('icon-source.png')
  .resize(192, 192, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png({ quality: 100, compressionLevel: 9 })
  .toFile('icon-192x192.png')
```

### Using Online Tools

- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Maskable.app](https://maskable.app/editor)

## Advanced Configuration

### Custom Icon Sizes

Edit `setup-pwa.js` to add custom sizes:

```javascript
const ICON_SIZES = [
  { size: 72, purpose: 'any' },
  { size: 256, purpose: 'any' }, // Custom size
  // ... more sizes
]
```

### Custom Output Directory

Change the public directory path:

```javascript
const publicDir = path.join(process.cwd(), 'public', 'icons')
```

### Different Source Image

Specify a different source:

```javascript
const sourceIcon = path.join(process.cwd(), 'assets', 'app-icon.png')
```

## Validation

### Check Generated Files

```bash
# List generated icons
ls -lh public/icon-*.png

# Check file sizes
du -h public/icon-*.png
```

### Validate Manifest

1. Build your app: `npm run build`
2. Start server: `npm start`
3. Open Chrome DevTools
4. Go to Application > Manifest
5. Verify all icons load correctly

### Test PWA Installation

1. Open app in Chrome
2. Look for install prompt
3. Or use DevTools > Application > Install
4. Check icon on home screen

## Resources

- [PWA Icon Requirements](https://web.dev/articles/add-manifest)
- [Maskable Icons Guide](https://web.dev/articles/maskable-icon)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [PWA Best Practices](https://web.dev/explore/progressive-web-apps)

## Support

For issues or questions:
1. Check the console output for error messages
2. Verify Sharp is installed: `npm list sharp`
3. Ensure source icon exists and is readable
4. Check Node.js version: 14.0.0 or higher required
5. Review generated files in `/public` directory

---

**Last Updated**: December 30, 2025  
**Script Version**: 2.0.0  
**Compatible With**: Next.js 14+, Node.js 14+
