# Quick Reference: Fixed Issues & New Features

## TypeScript Error Fixes - Quick Lookup

### If you see encryption errors:
- ✅ Fixed: Missing constants in `lib/encryption/server.ts` and `lib/encryption/client.ts`
- All encryption utilities now properly typed and working

### If you see Toast type errors:
- ✅ Fixed: Added `variant?: 'default' | 'destructive'` to Toast types
- Import from: `@/types/hooks`

### If you see component prop errors:
- ✅ Fixed: All component interfaces in `types/components.ts`
- Check `types/components.ts` for correct prop definitions

### If you see store type errors:
- ✅ Fixed: Updated store interfaces in `types/stores.ts`
- All Zustand stores now have correct method signatures

## New Supabase Storage System

### Quick Start
```typescript
import { uploadFile, downloadFile, listFiles } from '@/lib/supabase/storage'

// Upload a file
const result = await uploadFile({
  bucket: 'avatars',
  file: myFile,
  path: 'users/avatar.jpg',
  options: { public: true }
})

// Download a file
const blob = await downloadFile({
  bucket: 'avatars',
  path: 'users/avatar.jpg'
})
```

### React Hooks
```typescript
import { useStorageUpload } from '@/hooks/use-storage'

const { upload, progress, isUploading } = useStorageUpload()

await upload({
  bucket: 'avatars',
  file: selectedFile,
  path: `users/${userId}/avatar.jpg`
})
```

### Documentation
- Full guide: `docs/SUPABASE_STORAGE_GUIDE.md`
- Type definitions: `types/storage.ts`

## Next.js 16 Route Params

### Old Way (Next.js 15)
```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
}
```

### New Way (Next.js 16)
```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
}
```

**All dynamic routes have been updated.**

## Common Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run linter
npx tsc --noEmit     # Type check
```

### Database
```bash
npm run migrate      # Run migrations
npm run db:push      # Push schema to Supabase
```

### PWA
```bash
npm run pwa:setup    # Generate PWA assets
npm run pwa:verify   # Verify PWA setup
```

## Type Imports

All types are now centralized in the `types/` folder:

```typescript
// Component types
import type { Speaker, Sponsor, Partner } from '@/types/components'

// Store types
import type { TicketsState, NotificationState } from '@/types/stores'

// Hook types
import type { Toast, ToasterToast } from '@/types/hooks'

// Storage types
import type { StorageBucket, UploadConfig } from '@/types/storage'

// Utility types
import type { RateLimitConfig, SecurityEvent } from '@/types/utils'
```

## Troubleshooting

### Build fails with params error?
- ✅ Fixed for all existing routes
- For new routes: Use `Promise<{ id: string }>` and await params

### Type error with Toast variant?
- ✅ Fixed: Import Toast from `@/types/hooks`
- Use: `toast({ title: 'Hello', variant: 'default' })`

### Missing encryption constants?
- ✅ Fixed: All constants added to encryption files
- Just import and use normally

### Storage not working?
- Check: Supabase buckets are created
- Check: RLS policies are set up (see `docs/SUPABASE_STORAGE_GUIDE.md`)
- Check: Environment variables are set

## Breaking Changes

### None! 
All fixes are backward compatible. No changes needed to existing code except for the improvements made.

## Questions?

- **TypeScript Issues**: Check `types/` folder
- **Storage**: Read `docs/SUPABASE_STORAGE_GUIDE.md`
- **General**: Check `docs/README.md`
- **Completion Reports**: See `docs/completion-reports/`

---

✅ **All systems operational**  
✅ **Build passing**  
✅ **Ready for production**
