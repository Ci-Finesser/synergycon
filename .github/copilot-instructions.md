# SynergyCon 2.0 - AI Coding Agent Instructions

## Project Overview
Next.js 16 + React 19 full-stack conference website with PWA capabilities, Supabase backend, and comprehensive security features. Built for SynergyCon 2.0, Nigeria's premier Creative Economy conference.

## Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS 4.x + shadcn/ui (Radix UI primitives)
- **Database**: Supabase (PostgreSQL + Auth)
- **State**: Zustand stores in `lib/stores/`
- **PWA**: Workbox service workers + IndexedDB caching
- **Security**: CSRF tokens, rate limiting, honeypot validation, bot detection

## Critical Workflows

### Running the App
```bash
pnpm dev          # Start dev server (Next.js with Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
```

### Database Operations
```bash
pnpm migrate      # Run database migrations (uses scripts/migrate.js)
pnpm db:push      # Push schema changes to Supabase
pnpm db:reset     # Reset database (WARNING: destructive)
```
- Migrations live in `supabase/migrations/` with descriptive names
- Always use `await createServerClient()` for server-side DB access
- Client-side: use `createBrowserClient()` from `lib/supabase/client.ts`

### PWA Development
```bash
pnpm pwa:setup    # Generate PWA icons and manifest
pnpm pwa:verify   # Verify PWA icon generation
```
- Service worker: `public/sw.js` (Workbox-based)
- Manifest: `public/manifest.json`
- PWA provider wraps app in `app/layout.tsx`

## Architecture Patterns

### Server vs Client Components
- **Default to Server Components** - Next.js 16 App Router convention
- Mark with `"use client"` only when needed: interactivity, hooks, browser APIs
- Server components: direct Supabase access via `createServerClient()`
- Client components: use `createBrowserClient()` singleton

### Supabase Client Creation
```typescript
// Server components/API routes (creates new instance per request)
import { createServerClient } from '@/lib/supabase/server'
const supabase = await createServerClient()

// Client components (singleton instance)
import { createBrowserClient } from '@/lib/supabase/client'
const supabase = createBrowserClient()
```

### API Route Security Pattern
Every POST/PUT/DELETE API route MUST follow this pattern:
```typescript
import { validateRequestSecurity, cleanSecurityFields } from '@/lib/api-security'
import { RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  // Validate CSRF + honeypot + rate limiting
  const securityError = await validateRequestSecurity(req, body, {
    rateLimit: RATE_LIMITS.STRICT, // or RATE_LIMITS.NEWSLETTER
  })
  if (securityError) return securityError
  
  // Clean security fields before processing
  const cleanData = cleanSecurityFields(body)
  // ... rest of logic
}
```

### Component Patterns
- **UI Components**: Use shadcn/ui from `components/ui/` (Radix + CVA variants)
- **Button variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- **Sizes**: `default`, `sm`, `lg`, `icon`, `icon-sm`, `icon-lg`
- **Styling**: Use `cn()` utility from `lib/utils.ts` for className merging
- **Forms**: React Hook Form + Zod validation + `use-form-security` hook

### State Management (Zustand)
Stores are in `lib/stores/`:
- `network-store.ts` - Online/offline status
- `sync-queue-store.ts` - Offline request queuing
- `notification-store.ts` - Push notifications
- `pwa-install-store.ts` - PWA install prompts
- `cache-store.ts` - Cache management

Pattern: `export const useStoreName = create<StoreInterface>((set, get) => ({ ... }))`

## File Organization

### Path Aliases
Use `@/` for all imports (e.g., `@/components/ui/button`, `@/lib/utils`)

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `app/api/` - REST API endpoints (use Next.js route handlers)
- `components/` - React components (ui/, pwa/, feature components)
- `lib/` - Utilities, security, encryption, Supabase clients
- `hooks/` - Custom React hooks (`use-pwa`, `use-form-security`, `use-toast`)
- `public/` - Static assets (service worker, manifest, icons)
- `supabase/migrations/` - Database migration SQL files
- `scripts/` - Build/migration scripts

## Security Implementation

### Required Security Layers
1. **CSRF Protection**: Token validation in `lib/csrf.ts`
2. **Rate Limiting**: In-memory store (see `lib/rate-limit.ts`)
3. **Honeypot Fields**: Bot detection (see `lib/honeypot.ts`)
4. **Security Logging**: All security events logged via `lib/security-logger.ts`

### Encryption Support
Three encryption types available in `lib/encryption/`:
- `server-encryption.ts` - AES-256-GCM for data at rest
- `client-encryption.ts` - Web Crypto API for browser encryption
- `hybrid-encryption.ts` - RSA-OAEP + AES-GCM for E2E encryption

See `lib/encryption/README.md` for comprehensive usage guide.

## PWA Offline Capabilities
- **Service Worker**: Caches static assets + runtime caching strategies
- **Offline Page**: `app/offline/page.tsx` shown when offline
- **Sync Queue**: Failed requests queued in IndexedDB, retried when online
- **Network Detection**: `useNetworkStore()` hook for online/offline state

## Common Pitfalls

### ❌ Don't
- Call `createServerClient()` in client components
- Forget CSRF validation on mutating endpoints
- Use external URLs without `remotePatterns` in `next.config.mjs`
- Skip rate limiting on public endpoints
- Mutate Zustand state directly (use `set()` or `get()`)

### ✓ Do
- Always `await createServerClient()` in server contexts
- Use `validateRequestSecurity()` wrapper for all API mutations
- Add TypeScript types for all Supabase queries
- Test offline functionality with DevTools Network throttling
- Check `docs/` and `lib/encryption/README.md` for detailed guides

## Admin Features
- Admin routes: `app/admin/` (protected with session validation)
- Admin APIs: `app/api/admin/` (require authentication checks)
- Session tracking: `lib/session-tracker.ts`

## Email Integration
- Provider: Resend (configured via `RESEND_API_KEY`)
- Templates: Stored in Supabase `email_templates` table
- Email utilities: `lib/resend.ts`

## Reference Documentation
- Architecture: [docs/architecture/Project_Architecture_Blueprint.md](../docs/architecture/Project_Architecture_Blueprint.md)
- Encryption: [lib/encryption/README.md](../lib/encryption/README.md)
- Database: [supabase/migrations/README.md](../supabase/migrations/README.md)
- PWA Status: [docs/pwa/PWA_DOCUMENTATION_INDEX.md](../docs/pwa/PWA_DOCUMENTATION_INDEX.md)
- All Documentation: [docs/README.md](../docs/README.md)
