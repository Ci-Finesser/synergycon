# SynergyCon 2.0 - The Framework For Brainwork

Nigeria's Premier Creative Economy Conference Platform

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)

## 🎯 Overview

SynergyCon 2.0 is a full-stack web application for Nigeria's premier Creative Economy conference. The platform features PWA capabilities, comprehensive event management, registration systems, and partnership management.

### Key Features

- 🎪 **Four Districts, Four Venues** - Arts & Design, Fashion & Film, Tech & Gaming, Main Conference
- 📱 **Progressive Web App** - Offline support, push notifications, installable
- 🔐 **Enterprise Security** - CSRF protection, rate limiting, honeypot validation
- 🎨 **Modern UI** - Radix UI primitives, Tailwind CSS, Framer Motion animations
- 📊 **Admin Dashboard** - Application management, analytics, user management
- 🤝 **Partnership Portal** - Sponsor and partner application system

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
synergycon-website/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── partners/          # Partners page
│   └── [routes]/          # Feature pages
├── components/            # React components
│   ├── ui/               # Radix UI primitives
│   ├── pwa/              # PWA components
│   └── [sections]/       # Feature sections
├── lib/                   # Utilities & helpers
│   ├── constants/        # Single source of truth
│   ├── stores/           # Zustand state stores
│   ├── supabase/         # Database client
│   └── encryption/       # Security utilities
├── hooks/                 # Custom React hooks
├── public/               # Static assets & PWA
├── supabase/             # Database migrations
└── docs/                 # Documentation
```

## 🎭 Event Districts & Venues

All venue data is centralized in `lib/constants/event.ts`:

| District | Venue | Focus Areas |
|----------|-------|-------------|
| Arts, Sculpture & Design | J. Randle Centre for Yorùbá Culture & History | Arts, Sculpture, Design |
| Music, Fashion, Film & Photography | The Royal Box/Cube | Music, Fashion, Film, Photography |
| Tech, Gaming and Music | Lion Wonder Arena Alausa | Tech, Gaming, Music |
| Main Conference | National Theatre Nigeria | Conferences, Exhibitions, Networking |

## 🤝 Partners & Sponsors

### Media Partners - Broadcast (14)
- **Radio:** 999BEAT FM, BASE 101.1 FM, CITY FM 105.1, 96.9 COOL FM, CRE8TIVE 9JA RADIO
- **TV:** HIPTV, TRACE, NTA, NEWS CENTRAL, SOUNDCITY, SILVERBIRD, ARISE TV, CRE8TIVE 9JA TV, ARISE360

### Media Partners - Digital (11)
- **Online:** PULSE NG, BUSINESSDAY, TECHCABAL, NAIRAMETRICS
- **Blogs:** ONLINE BANKER, OLORISUPERGAL, NOTJUSTOK
- **Social/Influencers:** LAGOS GIST, LAGOS JUNCTION, TIMI AGBAJE, MR. JOLLOF

### Sponsors & Collaborators (5)
- **Principal:** STERLING BANK, T2 MOBILE
- **Ecosystem:** NELSON JACK, C.L.I COLLEGE, A-SOLAR

### Government Partners (8)
- Lagos State Ministry for Tourism, Arts & Culture
- Lagos State Ministry for Youths & Social Development
- Lagos State Ministry for Wealth Creation
- Lagos State Ministry for Trade, Commerce, Investments & Cooperatives
- LASMIRA, LIRS, NRS, EFCC

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4.x + shadcn/ui (Radix UI)
- **Animations:** Framer Motion
- **State:** Zustand

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Email:** Resend + React Email

### PWA
- **Service Worker:** Workbox
- **Offline Storage:** IndexedDB
- **Push Notifications:** Web Push API

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Architecture Blueprint](docs/architecture/Project_Architecture_Blueprint.md)
- [Migration Guide](docs/migration/MIGRATION_GUIDE.md)
- [PWA Implementation](docs/pwa/PWA_IMPLEMENTATION.md)
- [Security Guide](docs/features/SECURITY_IMPLEMENTATION.md)
- [Admin Setup](docs/admin/ADMIN_SETUP.md)

## 🔧 Configuration

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App
NEXT_PUBLIC_APP_URL=https://synergycon.live

# Email (Resend)
RESEND_API_KEY=your-resend-key

# PWA (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public
VAPID_PRIVATE_KEY=your-vapid-private

# Encryption
ENCRYPTION_KEY=your-encryption-key
```

### Single Source of Truth

All event constants are centralized in `lib/constants/event.ts`:

```typescript
import { 
  EVENT_NAME,
  EVENT_DATES,
  DISTRICTS,
  VENUES,
  MEDIA_PARTNERS,
  SPONSORS,
  GOVERNMENT_PARTNERS,
} from "@/lib/constants/event"
```

## 🗄️ Database

### Migrations

```bash
# Run migrations
pnpm migrate

# Push schema changes
pnpm db:push

# Reset database (destructive)
pnpm db:reset
```

## 🔒 Security

The platform implements multiple security layers:

- **CSRF Protection** - Token validation on all mutations
- **Rate Limiting** - Per-client request throttling
- **Honeypot Validation** - Bot detection
- **Input Sanitization** - XSS prevention
- **Encryption** - AES-256-GCM for sensitive data

## 📱 PWA Features

```bash
# Setup PWA icons and manifest
pnpm pwa:setup

# Verify PWA configuration
pnpm pwa:verify
```

Features:
- Offline support with service worker caching
- Push notifications
- App installation prompts
- Background sync for offline requests

## 🧪 Development

```bash
# Start dev server with Turbopack
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build
pnpm build
```

## 📄 License

Private - All rights reserved.

## 🔗 Links

- **Website:** [synergycon.live](https://synergycon.live)
- **Documentation:** [docs/README.md](docs/README.md)

---

Built with ❤️ for Nigeria's Creative Economy
