# SynergyCon 2.0 - Project Architecture Blueprint

**Generated:** December 30, 2025  
**Project Type:** React/Next.js (Full-Stack Web Application)  
**Architecture Pattern:** Layered Architecture with Component-Driven UI  
**Diagram Type:** Component-Based Textual Architecture  
**Detail Level:** Comprehensive  
**Last Updated:** December 30, 2025

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure Analysis](#project-structure-analysis)
3. [Technology Stack](#technology-stack)
4. [Architectural Layers](#architectural-layers)
5. [Core Architectural Components](#core-architectural-components)
6. [Component Architecture](#component-architecture)
7. [Data Architecture](#data-architecture)
8. [API Architecture](#api-architecture)
9. [Security Implementation](#security-implementation)
10. [State Management](#state-management)
11. [PWA Architecture](#pwa-architecture)
12. [Cross-Cutting Concerns](#cross-cutting-concerns)
13. [Testing Architecture](#testing-architecture)
14. [Deployment Architecture](#deployment-architecture)
15. [Extension Patterns](#extension-patterns)
16. [Implementation Templates](#implementation-templates)
17. [Common Pitfalls](#common-pitfalls)

---

## Architecture Overview

### Project Overview
SynergyCon 2.0 is Nigeria's premier Creative Economy conference platform, implemented as a modern full-stack web application. The architecture follows a **Layered Component-Driven Pattern** built on Next.js 16 with React 19, emphasizing scalability, type safety, and offline-first capabilities through Progressive Web App (PWA) technology.

### Architectural Principles
1. **Component Composition**: Hierarchical, reusable React components using Radix UI primitives
2. **Type Safety**: Full TypeScript integration with strict mode enabled
3. **Separation of Concerns**: Clear boundary between presentation, business logic, and data access
4. **Server-First Approach**: Leveraging Next.js 16 server components with selective client-side interactivity
5. **Offline-First**: Service Worker and IndexedDB for offline functionality
6. **Security-First**: CSRF protection, rate limiting, honeypot validation, and bot detection
7. **Progressive Enhancement**: Features gracefully degrade for users with limited connectivity

### Architectural Boundaries
- **Frontend Layer**: React components (client-side UI)
- **Server Layer**: Next.js API routes and server components
- **Data Layer**: Supabase (PostgreSQL database) with server-side client
- **Cache Layer**: IndexedDB (client), Service Worker caching strategies
- **Security Layer**: CSRF tokens, rate limiting, honeypot fields, session tracking

---

## Project Structure Analysis

### Root-Level Organization

```
synergycon-website/
├── app/                          # Next.js App Router (Server-first)
│   ├── layout.tsx               # Root layout with PWA setup
│   ├── page.tsx                 # Home page
│   ├── error.tsx                # Error boundary
│   ├── not-found.tsx            # 404 handler
│   ├── globals.css              # Global styles
│   ├── api/                     # API routes (RPC endpoints)
│   │   ├── admin/               # Admin operations
│   │   ├── csrf/                # CSRF token generation
│   │   ├── newsletter/          # Newsletter subscription
│   │   └── notifications/       # Push notifications
│   └── [routes]/                # Feature routes (speakers, schedule, etc.)
│
├── components/                   # React components library
│   ├── ui/                      # Radix UI primitive wrappers
│   ├── admin/                   # Admin-specific components
│   ├── pwa/                     # PWA-related components
│   ├── emails/                  # React Email templates
│   ├── [feature-sections]/      # Feature-specific components
│   └── examples/                # Example implementations
│
├── lib/                         # Utility libraries and helpers
│   ├── supabase/                # Database client factory
│   ├── stores/                  # Zustand state stores
│   ├── email-templates/         # Email utility templates
│   ├── encryption/              # Encryption utilities
│   ├── api-security.ts          # API security middleware
│   ├── csrf.ts                  # CSRF token handling
│   ├── honeypot.ts              # Bot protection
│   ├── rate-limit.ts            # Rate limiting
│   ├── security-logger.ts       # Security event logging
│   └── utils.ts                 # General utilities
│
├── hooks/                       # Custom React hooks
│   ├── use-pwa.ts              # PWA functionality hook
│   ├── use-form-security.ts    # Form security hook
│   └── use-toast.ts            # Toast notification hook
│
├── public/                      # Static assets
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service Worker script
│   ├── icon-*.png              # App icons (various sizes)
│   └── [images]/               # Images and media
│
├── styles/                      # Global and shared styles
├── scripts/                     # Build and setup scripts
├── supabase/                    # Database migrations
├── next.config.mjs              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies
```

### Folder Organization Philosophy

**By Feature**: Routes are organized by business domain (speakers, schedule, partners, admin)  
**By Layer**: Components are grouped by type (ui, admin, pwa, etc.)  
**By Responsibility**: Library code separated by function (security, state, utils)

---

## Technology Stack

### Core Framework
- **Next.js 16.0.10**: Full-stack React framework with App Router, Server Components, API routes
- **React 19.2.0**: Modern UI library with concurrent rendering
- **TypeScript 5.9.3**: Type-safe development with strict mode
- **Tailwind CSS 4.1.9**: Utility-first CSS framework with animation support

### UI Component System
- **Radix UI**: Unstyled, accessible primitive components
  - Dialog, Accordion, Dropdown, Select, Tabs, Tooltip, Alert Dialog, Popover, etc.
- **Lucide React**: Icon library (454+ icons)
- **Framer Motion 12.23.26**: Animation library for interactive UX
- **Embla Carousel 8.5.1**: Headless carousel component

### Data & State Management
- **Supabase (@supabase/supabase-js, @supabase/ssr)**: PostgreSQL database with Auth, Real-time
- **Zustand 5.0.9**: Lightweight client-side state management
- **React Hook Form 7.60.0**: Performant form state management
- **Zod 3.25.76**: TypeScript-first schema validation

### PWA & Offline
- **Workbox**: Service Worker library for caching strategies
  - workbox-routing, workbox-strategies, workbox-precaching, workbox-expiration, workbox-background-sync
- **IndexedDB (idb 8.0.3)**: Client-side database for offline data
- **workbox-window**: Client-side communication with Service Worker

### Email
- **@react-email/components & @react-email/render**: React-based email templates
- **Resend**: Email delivery service

### Utilities & Tools
- **date-fns 4.1.0**: Date manipulation
- **Recharts 2.15.4**: Chart visualization
- **Quill 2.0.3**: Rich text editor
- **cmdk 1.0.4**: Command menu
- **Sonner 1.7.4**: Toast notifications
- **Vaul 0.9.9**: Drawer/sheet component

### Styling & Theming
- **next-themes 0.4.6**: Dark mode support
- **class-variance-authority 0.7.1**: Type-safe component variants
- **tailwind-merge 2.5.5**: Utility merging
- **tailwindcss-animate 1.0.7**: Animation utilities

### Development & Build
- **Turbopack**: Fast bundler (configured in next.config.mjs)
- **PostCSS 8.5**: CSS processing
- **Autoprefixer 10.4.20**: Vendor prefixes
- **Sharp 0.34.5**: Image optimization
- **Supabase CLI**: Database management
- **ESLint**: Code quality

### Analytics & Monitoring
- **@vercel/analytics 1.3.1**: Usage analytics
- **Security Logger**: Custom event logging for security

---

## Architectural Layers

### Layer Model

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  (React Components, Pages, Layouts, UI Interactions)    │
├─────────────────────────────────────────────────────────┤
│              COMPOSITION & LAYOUT LAYER                  │
│  (Page Components, Section Components, Containers)      │
├─────────────────────────────────────────────────────────┤
│            BUSINESS LOGIC & STATE LAYER                 │
│  (Hooks, Stores, Custom Logic, Form Logic)             │
├─────────────────────────────────────────────────────────┤
│              API & DATA ACCESS LAYER                     │
│  (API Routes, Supabase Client, Data Queries)           │
├─────────────────────────────────────────────────────────┤
│           INFRASTRUCTURE & UTILITY LAYER                 │
│  (Security, Authentication, Caching, Logging)          │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. **Presentation Layer** (`/components` & `/app`)
**Purpose**: Render user interfaces and handle user interactions  
**Components**:
- Atomic UI components (buttons, inputs, cards)
- Feature sections (hero, speakers, schedule, gallery)
- Modal and dialog components
- Navigation components

**Key Patterns**:
- Functional components with hooks
- Client-side interactivity using `'use client'` directive
- Props-based configuration for reusability
- Composition over inheritance

**Dependency Direction**: Depends on Business Logic & State Layer

#### 2. **Composition & Layout Layer** (`/app/[routes]`)
**Purpose**: Organize components into pages and layouts  
**Components**:
- Page components using Next.js App Router
- Layout components for consistent structure
- Feature-specific page containers
- Lazy-loaded section components

**Key Patterns**:
- Server components as default (with selective client rendering)
- Metadata export for SEO
- Error boundaries and loading states
- Progressive disclosure of content

**Dependency Direction**: Depends on Presentation Layer

#### 3. **Business Logic & State Layer** (`/hooks`, `/lib/stores`)
**Purpose**: Manage application state and business logic  
**Components**:
- Custom hooks (`use-pwa`, `use-form-security`, `use-toast`)
- Zustand stores for client-side state
- Form validation logic
- Security validation hooks

**Key Patterns**:
- React Hooks for side effects and state
- Zustand stores for shared state across components
- Custom hooks for behavior encapsulation
- Validation at business logic level

**Dependency Direction**: Depends on API & Data Access Layer

#### 4. **API & Data Access Layer** (`/app/api`, `/lib/supabase`)
**Purpose**: Manage data retrieval and API operations  
**Components**:
- Next.js API routes (RPC-style endpoints)
- Supabase client factory functions
- Server-side data queries
- Database migrations

**Key Patterns**:
- Server-side rendering of database queries
- API routes for complex operations
- Supabase as primary data source
- Type-safe API contracts with TypeScript

**Dependency Direction**: Depends on Infrastructure & Utility Layer

#### 5. **Infrastructure & Utility Layer** (`/lib` core utilities)
**Purpose**: Provide cross-cutting concerns and low-level utilities  
**Components**:
- CSRF token validation (`csrf.ts`)
- Rate limiting (`rate-limit.ts`)
- Honeypot bot protection (`honeypot.ts`)
- Session tracking (`session-tracker.ts`)
- Security logging (`security-logger.ts`)
- Encryption utilities (`/lib/encryption`)
- General utilities (`utils.ts`)

**Key Patterns**:
- Utility functions as pure functions where possible
- Middleware-style composition
- Environment-based configuration
- Centralized error handling

**Dependency Direction**: No dependencies on other layers (foundation)

### Dependency Rules

✅ **Allowed Dependencies**:
- Presentation → Composition & Layout → Business Logic → API & Data Access → Infrastructure
- Horizontal dependencies within same layer (component to component)
- Infrastructure accessed from any layer

❌ **Forbidden Dependencies**:
- Infrastructure → Any other layer
- Presentation → API & Data Access (must route through Business Logic)
- Lower layers depending on higher layers (circular dependencies)

---

## Core Architectural Components

### 1. Component System Architecture

**Purpose**: Provide reusable, accessible, and themeable UI building blocks  
**Responsibility**: Render UI elements with consistent styling and behavior

#### Internal Structure

```
components/
├── ui/                          # Radix UI wrappers (20+ primitive components)
│   ├── button.tsx              # Button with variants
│   ├── dialog.tsx              # Modal dialog
│   ├── form.tsx                # Form context wrapper
│   ├── input.tsx               # Text input
│   ├── select.tsx              # Dropdown select
│   └── [primitives]/           # Other Radix primitives
│
├── admin/                       # Admin-specific components
│   ├── admin-navigation.tsx     # Admin menu
│   ├── applications-manager.tsx # Application management
│   └── [admin-features]/
│
├── pwa/                        # PWA-specific components
│   ├── pwa-provider.tsx        # PWA context provider
│   ├── pwa-install-prompt.tsx  # Install prompt
│   └── [pwa-features]/
│
├── emails/                     # React Email templates
│   ├── base-email.tsx          # Email base layout
│   ├── confirmation-email.tsx  # Registration confirmation
│   └── [email-templates]/
│
├── [feature-sections]/         # Feature-specific sections
│   ├── hero-section.tsx        # Landing hero
│   ├── speakers-section.tsx    # Speakers showcase
│   ├── schedule-section.tsx    # Event schedule
│   ├── gallery-section.tsx     # Photo gallery
│   ├── tickets-section.tsx     # Ticket purchasing
│   └── [other-sections]/
│
└── examples/                   # Implementation examples
```

#### Design Patterns

**Composition Pattern**:
```typescript
// Composing features from primitives
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <form><input /></form>
  </DialogContent>
</Dialog>
```

**Variant Pattern** (CVA - Class Variance Authority):
```typescript
// Type-safe component variants
const button = cva("px-4 py-2", {
  variants: {
    intent: { primary: "bg-blue", secondary: "bg-gray" },
    size: { sm: "text-sm", lg: "text-lg" }
  }
})
```

**Props-Based Configuration**:
Components accept configuration props instead of hardcoded behavior.

#### Interaction Patterns
- Modal interactions via Dialog component
- Form handling via React Hook Form integration
- Client-side validation with Zod
- Toast notifications via Sonner
- Animations via Framer Motion

---

### 2. State Management Architecture

**Purpose**: Manage application state in a predictable, scalable way  
**Pattern**: Zustand store + React hooks combination

#### Store Structure (`/lib/stores`)

```typescript
// Each store is independent and focused
export const usePWAInstallStore = create<PWAInstallState>((set) => ({
  isInstallable: false,
  isInstalled: false,
  setInstallable: (value) => set({ isInstallable: value }),
  // ...
}))

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true,
  lastOnlineTime: Date.now(),
  setOnline: (value) => set({ isOnline: value }),
  // ...
}))

export const useSyncQueueStore = create<SyncQueueState>((set) => ({
  queue: [],
  addToQueue: (item) => set((s) => ({ queue: [...s.queue, item] })),
  // ...
}))

export const useCacheStore = create<CacheState>((set) => ({
  cache: new Map(),
  get: (key) => // ...
  set: (key, value) => // ...
}))

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notif) => // ...
}))
```

#### Store Characteristics
- **Independent Stores**: Each concern has its own store
- **Shallow Subscriptions**: Components only re-render when their data changes
- **No Nesting**: Flat store structure for simplicity
- **Async Support**: Stores handle async operations via set functions

#### Usage in Components

```typescript
'use client'

function MyComponent() {
  const { isOnline } = useNetworkStore()
  const { notifications } = useNotificationStore()
  
  return <div>{isOnline ? 'Online' : 'Offline'}</div>
}
```

---

### 3. API & Server Architecture

**Purpose**: Provide RPC-style API endpoints for client-server communication  
**Pattern**: Next.js API Routes with middleware-style composition

#### API Route Organization

```
app/api/
├── admin/
│   ├── auth/                  # Admin authentication
│   ├── campaigns/             # Campaign management
│   ├── registrations/         # Registration management
│   ├── mailing-lists/         # Email list management
│   └── security/              # Security operations
├── csrf/
│   └── route.ts              # CSRF token generation
├── newsletter/
│   └── route.ts              # Newsletter subscription
└── notifications/
    └── route.ts              # Push notifications
```

#### API Security Middleware

All API routes use **SecureRequest pattern**:

```typescript
// /lib/api-security.ts
export async function validateSecureRequest(
  req: NextRequest,
  config?: RateLimitConfig
): Promise<SecureRequestBody> {
  // 1. Rate limit check
  const clientId = getClientId(req)
  checkRateLimit(clientId, config)
  
  // 2. CSRF validation
  const body = await req.json()
  validateCSRFToken(body._csrf)
  
  // 3. Honeypot validation
  validateBotProtection(body)
  
  // 4. Log security event
  logSecurityEvent('api_request', clientId)
  
  return body
}
```

#### Request Flow

```
Client Request
  ↓
Rate Limit Check
  ↓
CSRF Token Validation
  ↓
Honeypot Validation
  ↓
Body Parsing
  ↓
Business Logic
  ↓
Database Operation (Supabase)
  ↓
Response Serialization
  ↓
Client Response
```

---

### 4. Database Architecture (Supabase)

**Purpose**: Persistent data storage with real-time capabilities  
**Technology**: PostgreSQL via Supabase

#### Client Factory Pattern

```typescript
// /lib/supabase/server.ts
export async function createClient() {
  const cookieStore = await cookies()
  
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => cookies.forEach(c => cookieStore.set(c.name, c.value))
      }
    }
  )
}
```

**Design Pattern**:
- Factory pattern for client creation
- Always create new client per request
- Cookie-based session management
- Server-side only (no client-side SDK in sensitive operations)

#### Typical Data Flow

```
Component (needs data)
  ↓
Server Component or API Route
  ↓
createClient() - Creates Supabase client with session
  ↓
Database Query (SELECT, INSERT, UPDATE, DELETE)
  ↓
Data Transformation
  ↓
Response to Client
```

---

### 5. Security Architecture

**Purpose**: Protect against common web vulnerabilities  
**Scope**: CSRF, bot attacks, rate limiting, session management

#### Security Components

**A. CSRF Protection** (`/lib/csrf.ts`)
- Token generation and validation
- Token stored in response headers
- Required in form submissions and API requests

**B. Rate Limiting** (`/lib/rate-limit.ts`)
- Per-client IP rate limits
- Configurable thresholds per endpoint
- Built-in limit configurations (RATE_LIMITS)

**C. Honeypot** (`/lib/honeypot.ts`)
- Hidden form fields that bots typically fill
- Validation fails if honeypot fields are populated
- Transparent to legitimate users

**D. Session Tracking** (`/lib/session-tracker.ts`)
- Monitor user sessions
- Detect suspicious patterns
- Track login attempts

**E. Security Logging** (`/lib/security-logger.ts`)
- Log all security events
- Track failed attempts
- Audit trail for investigations

#### Security Middleware Chain

```
Request arrives
  ↓
getClientId() - Extract IP/identifier
  ↓
checkRateLimit() - Verify request frequency
  ↓
validateCSRFToken() - Verify CSRF token
  ↓
validateBotProtection() - Check honeypot
  ↓
logSecurityEvent() - Record for audit
  ↓
Proceed to business logic
```

---

## Component Architecture

### Component Hierarchy

**Root Level**:
```
RootLayout
  ├── ThemeProvider (next-themes)
  ├── PWAProvider (PWA context)
  ├── Navigation
  ├── Dynamic Content
  │   ├── Page Components
  │   └── Section Components
  ├── Modals/Dialogs
  ├── Toasts (Sonner)
  └── Footer
```

### Component Classification

#### 1. **Atomic Components** (UI Primitives)
Location: `/components/ui/`  
Examples: Button, Input, Dialog, Card, Badge  
Properties:
- Single responsibility
- No business logic
- Fully reusable
- Highly configurable

#### 2. **Feature Sections** (Business Components)
Location: `/components/[feature]/`  
Examples: HeroSection, SpeakersSection, ScheduleSection  
Properties:
- Combine multiple atomic components
- Include business logic
- Feature-specific styling
- May use hooks for state

#### 3. **Layout Components**
Location: `/app/layout.tsx`, `/components/layouts/`  
Examples: Root layout, page layouts  
Properties:
- Define page structure
- Configure metadata
- Setup providers
- Handle navigation

#### 4. **Modal/Dialog Components**
Location: `/components/[modal-name]-modal.tsx`  
Examples: SpeakerBioModal, ApplicationDetailModal  
Properties:
- Controlled by state/store
- Focus management
- Keyboard navigation
- Overlay handling

#### 5. **Admin Components**
Location: `/components/admin/`  
Examples: AdminNavigation, ApplicationsManager  
Properties:
- Admin-specific functionality
- Data management interfaces
- Protected routes

### Component Composition Example

```typescript
// Atomic: Button component
export function Button({ children, variant = 'default', ...props }) {
  return <button className={buttonVariants({ variant })} {...props}>{children}</button>
}

// Feature Section: Composed of atomic components
export function SpeakersSection() {
  const speakers = useSpeakersData()
  
  return (
    <section>
      <h2>Speakers</h2>
      <div className="grid">
        {speakers.map(speaker => (
          <SpeakerCard key={speaker.id} speaker={speaker} />
        ))}
      </div>
    </section>
  )
}

// Page: Composes feature sections
export default function SpeakersPage() {
  return (
    <Layout>
      <SpeakersSection />
      <FAQSection />
      <CTASection />
    </Layout>
  )
}
```

---

## Data Architecture

### Domain Model

The application manages several key domains:

#### 1. **Event Domain**
- Conference metadata (dates, locations, theme)
- Schedule information (time slots, tracks)
- Venues and logistics

#### 2. **People Domain**
- Speakers (profiles, sessions, bio)
- Partners (sponsorships, details)
- Attendees/Registrations

#### 3. **Content Domain**
- Gallery (images and videos)
- Blog/News (articles, announcements)
- FAQ and resources

#### 4. **User Domain**
- User accounts
- Preferences and settings
- Authentication state

### Data Flow Pattern

```
Client Component
  ↓
useQuery Hook / useFetch
  ↓
API Route (/app/api/...)
  ↓
Supabase Client
  ↓
PostgreSQL Database
  ↓
Data Transformation
  ↓
Zustand Store (caching)
  ↓
Component Re-render
```

### Caching Strategies

#### 1. **Service Worker Caching** (Workbox)
- **Strategy**: Cache-first for static assets
- **Expiration**: Based on content type
- **Scope**: JS, CSS, images

#### 2. **IndexedDB Caching** (Client-side)
- **Purpose**: Cache API responses for offline use
- **Usage**: `useCacheStore` for temporary data
- **Persistence**: Survives page reloads

#### 3. **Browser Cache**
- **Strategy**: HTTP caching headers
- **Duration**: Configured per asset type

#### 4. **Zustand Store Cache**
- **Purpose**: In-memory cache during session
- **Duration**: Session-based

### Data Validation

**Client-Side**: Zod schemas
```typescript
const RegistrationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
})
```

**Server-Side**: Duplicate validation in API routes
```typescript
const body = await request.json()
const validation = RegistrationSchema.safeParse(body)

if (!validation.success) {
  return NextResponse.json(
    { errors: validation.error.flatten() },
    { status: 400 }
  )
}
```

---

## API Architecture

### API Design Pattern

All API routes follow a **Request → Validate → Execute → Respond** pattern:

```typescript
// Example: app/api/admin/registrations/route.ts
export async function POST(req: NextRequest) {
  try {
    // 1. Validate security
    const body = await validateSecureRequest(req, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100
    })
    
    // 2. Validate data
    const data = RegistrationSchema.parse(body)
    
    // 3. Execute business logic
    const client = await createClient()
    const { data: result } = await client
      .from('registrations')
      .insert([data])
      .select()
    
    // 4. Return response
    return NextResponse.json(result)
  } catch (error) {
    logSecurityEvent('api_error', 'unknown')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### API Versioning

Current approach: Single version in base URL  
Future: Consider `/api/v1/`, `/api/v2/` if breaking changes needed

### Error Handling

```typescript
// Standardized error response
{
  error: "Descriptive error message",
  code: "ERROR_CODE",
  details?: { field: "validation message" }
}
```

### Rate Limiting Tiers

```typescript
const RATE_LIMITS = {
  'public': { windowMs: 15 * 60 * 1000, maxRequests: 100 },
  'authenticated': { windowMs: 60 * 60 * 1000, maxRequests: 1000 },
  'admin': { windowMs: 60 * 60 * 1000, maxRequests: 10000 },
  'newsletter': { windowMs: 24 * 60 * 60 * 1000, maxRequests: 5 }
}
```

---

## Security Implementation

### Multi-Layer Security Strategy

#### Layer 1: Request Validation
- **CSRF Token**: Generated per session, validated on mutations
- **Honeypot**: Hidden fields filled by bots, rejected
- **Rate Limiting**: Per-IP request throttling
- **Content-Type**: Validation of request format

#### Layer 2: Data Validation
- **Schema Validation**: Zod for input validation
- **Type Safety**: TypeScript strict mode
- **Sanitization**: Input cleanup before processing

#### Layer 3: Authentication
- **Supabase Auth**: User authentication and session management
- **Session Tracking**: Monitor active sessions
- **Token Management**: Secure token storage and rotation

#### Layer 4: Authorization
- **Role-Based Access Control** (via Supabase)
- **Admin Endpoints**: Protected routes requiring admin role
- **Feature Flags**: Conditional feature access

#### Layer 5: Logging & Monitoring
- **Security Events**: Log all suspicious activity
- **Audit Trail**: Track changes and operations
- **Alerting**: Notify on threshold breaches

### Encryption

**Purpose**: Protect sensitive data in transit and at rest  
**Implementation**: `/lib/encryption/`
- Supabase handles database encryption
- HTTPS enforces transport security
- Session tokens encrypted in cookies

---

## State Management

### Zustand Store Pattern

#### Store Definition

```typescript
import { create } from 'zustand'

interface MyState {
  count: number
  increment: () => void
  decrement: () => void
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))
```

#### Usage in Components

```typescript
'use client'

function Counter() {
  const { count, increment, decrement } = useMyStore()
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}
```

### Store Organization

**Store by Concern**:
- `pwa-install-store`: PWA installation state
- `network-store`: Online/offline status
- `sync-queue-store`: Offline sync queue
- `cache-store`: Response caching
- `notification-store`: Toast notifications

### Custom Hooks for Business Logic

```typescript
// hooks/use-form-security.ts
export function useFormSecurity() {
  const [csrfToken, setCSRFToken] = useState('')
  
  useEffect(() => {
    // Fetch CSRF token
    fetch('/api/csrf').then(r => r.json()).then(d => setCSRFToken(d.token))
  }, [])
  
  return {
    csrfToken,
    formData: { _csrf: csrfToken }
  }
}
```

---

## PWA Architecture

### Progressive Web App Implementation

#### Core Components

**1. Service Worker** (`public/sw.js`)
- Registration in root layout
- Caching strategies via Workbox
- Background sync for offline queue

**2. Web App Manifest** (`public/manifest.json`)
- App metadata (name, icons, theme)
- Display mode (standalone)
- Start URL and icons

**3. PWA Provider** (`components/pwa/pwa-provider.tsx`)
- React context for PWA state
- Install prompt management
- Service Worker lifecycle

**4. Install Store** (`lib/stores/pwa-install-store.ts`)
- Track installability
- Handle install flow
- Persist installation state

#### PWA Features

**Offline Support**:
- Service Worker caches critical paths
- IndexedDB stores API responses
- Graceful degradation for offline users

**Install Prompt**:
- Detects installability
- Shows custom install prompt
- Tracks installation metrics

**Background Sync**:
- Queue operations while offline
- Sync when online
- Retry failed requests

#### Workbox Configuration

```typescript
// public/sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.4.0/workbox-sw.js')

workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
)
```

---

## Cross-Cutting Concerns

### 1. Error Handling

**Strategy**: Layered error handling

```typescript
// Presentation Layer: Show user-friendly error
<ErrorBoundary fallback={<ErrorPage />}>
  <MyComponent />
</ErrorBoundary>

// API Layer: Return structured error response
try {
  // operation
} catch (error) {
  return NextResponse.json(
    { error: 'Operation failed' },
    { status: 500 }
  )
}

// Global Handler: Catch-all for unhandled errors
export default function Error({ error, reset }) {
  return <div>Something went wrong</div>
}
```

### 2. Logging

**Strategy**: Contextual logging at each layer

```typescript
// Security events
logSecurityEvent('failed_login', userId)

// API operations
logSecurityEvent('api_request', clientId)

// Component lifecycle
useEffect(() => {
  console.log('Component mounted')
})
```

### 3. Notifications

**Strategy**: Centralized toast notifications via Sonner

```typescript
import { toast } from 'sonner'

// Success
toast.success('Operation completed')

// Error
toast.error('Operation failed')

// Custom
toast.custom((t) => <CustomToast id={t} />)
```

### 4. Authentication

**Strategy**: Supabase Auth with session management

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

// Session management
const { data: { session } } = await supabase.auth.getSession()
```

### 5. Configuration Management

**Environment-Based Configuration**:
```
.env.local         # Local development secrets
.env.production    # Production environment
next.config.mjs    # Application configuration
```

**Configuration Pattern**:
```typescript
const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  isProduction: process.env.NODE_ENV === 'production',
}
```

---

## Testing Architecture

### Testing Strategy

**Test Organization**:
- Unit tests for utility functions and hooks
- Integration tests for API routes
- Component tests for UI components
- E2E tests for critical user flows

### Test Types

#### Unit Tests
- Pure functions in `/lib`
- Custom hooks in `/hooks`
- Validation schemas

#### Component Tests
- Rendering with different props
- User interactions (click, input)
- State changes
- Hook effects

#### Integration Tests
- API routes with database
- Auth flows
- Data fetching and caching

#### E2E Tests
- Critical user journeys
- Multi-step workflows
- Cross-browser testing

### Testing Tools

**Recommended Stack**:
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **Cypress**: E2E testing
- **MSW**: API mocking

### Example Test Structure

```typescript
describe('LoginForm', () => {
  it('should submit valid credentials', async () => {
    const { getByRole, getByLabelText } = render(<LoginForm />)
    
    const emailInput = getByLabelText(/email/i)
    const submitButton = getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByText(/success/i)).toBeInTheDocument()
  })
})
```

---

## Deployment Architecture

### Build Process

```
Source Code
  ↓
TypeScript Compilation
  ↓
Next.js Build (Turbopack)
  ↓
Static Generation / SSR Optimization
  ↓
Build Artifacts
  ↓
Docker Image (if containerized)
  ↓
Deployment
```

### Environment Configuration

**Development**:
```bash
npm run dev          # Dev server with HMR
npm run migrate      # Database migration
npm run pwa:setup    # PWA setup
```

**Production**:
```bash
npm run build         # Production build
npm run start         # Production server
npm run db:push      # Database sync
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

**Required**:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL
```

**Optional**:
```
NODE_ENV
VERCEL_ENV
ANALYTICS_ID
```

---

## Extension Patterns

### Adding a New Feature

#### Step 1: Route Creation
Create a new route in `/app/[feature]/`
```typescript
// app/myfeature/page.tsx
export default function MyFeaturePage() {
  return <MyFeatureSection />
}
```

#### Step 2: Component Creation
Create feature component in `/components/`
```typescript
// components/my-feature-section.tsx
export function MyFeatureSection() {
  return <section>{/* content */}</section>
}
```

#### Step 3: State Management (if needed)
Create store in `/lib/stores/`
```typescript
// lib/stores/my-feature-store.ts
export const useMyFeatureStore = create<MyFeatureState>((set) => ({
  // state
}))
```

#### Step 4: API Endpoint (if needed)
Create route in `/app/api/`
```typescript
// app/api/myfeature/route.ts
export async function POST(req: NextRequest) {
  // implementation
}
```

#### Step 5: Security (if data is sensitive)
Add to API security middleware
```typescript
const body = await validateSecureRequest(req, RATE_LIMITS['public'])
```

### Adding a New API Endpoint

```typescript
// app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateSecureRequest } from '@/lib/api-security'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    // 1. Security validation
    const body = await validateSecureRequest(req)
    
    // 2. Data validation
    const validated = MySchema.parse(body)
    
    // 3. Execute
    const client = await createClient()
    const result = await client.from('table').insert(validated)
    
    // 4. Return
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

### Adding a New Component

**Atomic Component**:
```typescript
// components/ui/my-component.tsx
import { cva, type VariantProps } from 'class-variance-authority'

const myComponentVariants = cva('base-classes', {
  variants: {
    variant: { default: 'default-style', secondary: 'secondary-style' },
    size: { sm: 'small-style', lg: 'large-style' }
  }
})

export function MyComponent({ variant, size, ...props }) {
  return <div className={myComponentVariants({ variant, size })} {...props} />
}
```

**Feature Component**:
```typescript
// components/my-feature.tsx
import { MyComponent } from './ui/my-component'

export function MyFeature() {
  const data = useMyData()
  const { state, setState } = useMyFeatureStore()
  
  return (
    <div>
      {data.map(item => (
        <MyComponent key={item.id} data={item} />
      ))}
    </div>
  )
}
```

---

## Implementation Templates

### Form Template

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useFormSecurity } from '@/hooks/use-form-security'

const FormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

type FormData = z.infer<typeof FormSchema>

export function MyForm() {
  const { csrfToken, formData: securityData } = useFormSecurity()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/myendpoint', {
        method: 'POST',
        body: JSON.stringify({ ...data, ...securityData }),
      })
      
      if (!response.ok) throw new Error('Failed')
      toast.success('Success!')
    } catch (error) {
      toast.error('Error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Custom Hook Template

```typescript
'use client'

import { useState, useEffect } from 'react'

interface UseMyHookReturn {
  data: any
  isLoading: boolean
  error: Error | null
}

export function useMyHook(id: string): UseMyHookReturn {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/data/${id}`)
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { data, isLoading, error }
}
```

### API Route Template

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateSecureRequest } from '@/lib/api-security'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const RequestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    // Validate security
    const body = await validateSecureRequest(req, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100,
    })

    // Validate data
    const validated = RequestSchema.parse(body)

    // Execute business logic
    const client = await createClient()
    const { data, error } = await client
      .from('table_name')
      .insert([validated])
      .select()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Common Pitfalls

### 1. ❌ Circular Dependencies

**Problem**: Component A imports from Component B, which imports from A
```typescript
// components/A.tsx
import { B } from './B'  // ❌ Creates circular dependency

// components/B.tsx
import { A } from './A'
```

**Solution**: Extract shared logic to parent or utility
```typescript
// lib/shared.ts
export function sharedLogic() { }

// components/A.tsx
import { sharedLogic } from '@/lib/shared'

// components/B.tsx
import { sharedLogic } from '@/lib/shared'
```

### 2. ❌ Client-Side Database Access

**Problem**: Using database client in client components
```typescript
// ❌ Wrong: client component accessing database directly
'use client'
const { data } = await supabase.from('users').select()
```

**Solution**: Use API routes for data access
```typescript
// ✅ Correct: API route
// app/api/users/route.ts
const { data } = await createClient().from('users').select()

// Client component
const response = await fetch('/api/users')
```

### 3. ❌ Missing CSRF Protection

**Problem**: API route without CSRF validation
```typescript
// ❌ Wrong: No security validation
export async function POST(req: NextRequest) {
  const body = await req.json()
  // Process without validation
}
```

**Solution**: Use security validation
```typescript
// ✅ Correct: With security validation
export async function POST(req: NextRequest) {
  const body = await validateSecureRequest(req)
  // Now secure
}
```

### 4. ❌ Large Bundle Size

**Problem**: Importing large libraries in every component
```typescript
// ❌ Wrong: Large library in every component
import * as lodash from 'lodash'

export function MyComponent() {
  return <div>{lodash.someUtility()}</div>
}
```

**Solution**: Use specific imports or create utility wrapper
```typescript
// ✅ Correct: Specific import
import { someUtility } from 'lodash'

// Or wrap in utility function
import { someUtility } from '@/lib/utils'
```

### 5. ❌ Unhandled Async Operations

**Problem**: Promises not handled in event handlers
```typescript
// ❌ Wrong: Fire and forget
function handleClick() {
  fetch('/api/endpoint')  // Errors not caught
}
```

**Solution**: Handle async properly
```typescript
// ✅ Correct: Proper error handling
async function handleClick() {
  try {
    const response = await fetch('/api/endpoint')
    if (!response.ok) throw new Error('Failed')
    toast.success('Success')
  } catch (error) {
    toast.error('Error occurred')
  }
}
```

### 6. ❌ Multiple Zustand Store Subscriptions

**Problem**: Component re-renders unnecessarily
```typescript
// ❌ Wrong: Component re-renders on any store change
const { networkState, notifications, cache } = useStore()
```

**Solution**: Subscribe to specific selectors
```typescript
// ✅ Correct: Only re-render when selected data changes
const { isOnline } = useNetworkStore((s) => ({ isOnline: s.isOnline }))
```

### 7. ❌ Improper Error Boundaries

**Problem**: Error boundaries not placed strategically
```typescript
// ❌ Wrong: Single error boundary for entire app
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Solution**: Granular error boundaries
```typescript
// ✅ Correct: Error boundary per section
<ErrorBoundary fallback={<SectionError />}>
  <ExpensiveSection />
</ErrorBoundary>
```

### 8. ❌ Hardcoded Configuration

**Problem**: Configuration hardcoded in source
```typescript
// ❌ Wrong: Hardcoded secrets
const apiKey = 'sk_live_xxx'
const apiUrl = 'https://api.example.com'
```

**Solution**: Environment variables
```typescript
// ✅ Correct: Environment-based
const apiKey = process.env.NEXT_PUBLIC_API_KEY
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

---

## Architecture Governance

### Code Quality Standards

**TypeScript**: Strict mode enabled
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

**Linting**: ESLint for code consistency
```bash
npm run lint
```

**Type Safety**: Full type coverage expected for:
- API endpoints
- Component props
- Store state
- Hook returns

### File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `MyComponent.tsx` |
| Utilities | camelCase | `getDateTime.ts` |
| Hooks | `use` + PascalCase | `useMyHook.ts` |
| Stores | `use` + Name + `Store` | `useMyFeatureStore.ts` |
| Types | PascalCase | `UserData.ts` |
| Constants | UPPER_SNAKE_CASE | `API_CONFIG.ts` |

### Architectural Review Checklist

Before merging PR:
- [ ] No circular dependencies
- [ ] All security validations in place
- [ ] Type safety verified
- [ ] Error handling implemented
- [ ] Loading states considered
- [ ] Mobile responsive design checked
- [ ] Accessibility (a11y) verified
- [ ] Performance implications assessed
- [ ] Tests added (unit/integration/e2e)
- [ ] Documentation updated

---

## Blueprint for New Development

### Development Workflow

#### 1. **Design Phase**
- Define feature requirements
- Create wireframes/mockups
- Identify data flows
- Plan component hierarchy
- Document API contracts

#### 2. **Setup Phase**
- Create feature route in `/app/`
- Create feature folder in `/components/`
- Create API endpoints if needed
- Create store if state needed
- Create TypeScript types/interfaces

#### 3. **Implementation Phase**
- Build atomic components first
- Compose into feature components
- Implement business logic in hooks
- Create API endpoints
- Add state management
- Implement error handling
- Add loading states

#### 4. **Security Phase**
- Add CSRF token to forms
- Validate all inputs (Zod)
- Rate limit sensitive endpoints
- Add honeypot to public forms
- Log security-relevant events
- Test security measures

#### 5. **Testing Phase**
- Write unit tests
- Write component tests
- Write integration tests
- Manual testing
- Performance testing
- Accessibility testing

#### 6. **Documentation Phase**
- Document API contracts
- Document component props
- Document state flows
- Update README if needed
- Add inline comments for complex logic

### Component Creation Checklist

- [ ] Component receives typed props
- [ ] Component has proper error boundary
- [ ] Component handles loading state
- [ ] Component is accessible (a11y)
- [ ] Component is responsive
- [ ] Component has proper TypeScript types
- [ ] Component is reusable (not feature-specific)
- [ ] Component works in light/dark theme
- [ ] Component has stories/examples

### API Route Checklist

- [ ] Route has security validation
- [ ] Route validates input with Zod
- [ ] Route handles errors gracefully
- [ ] Route has proper HTTP status codes
- [ ] Route logs security events
- [ ] Route has rate limiting
- [ ] Route returns typed response
- [ ] Route documentation exists
- [ ] Route is tested (integration test)

### Feature Checklist

- [ ] Feature follows layered architecture
- [ ] Feature has no circular dependencies
- [ ] Feature has comprehensive error handling
- [ ] Feature is typed (TypeScript)
- [ ] Feature is tested (unit, integration, e2e)
- [ ] Feature is documented
- [ ] Feature works offline (if applicable)
- [ ] Feature is accessible
- [ ] Feature is performant
- [ ] Feature is secure

---

## Recommendations for Architecture Evolution

### Short-Term (1-3 months)
1. **Add E2E Testing Framework** (Cypress/Playwright)
   - Critical user flows
   - Cross-browser testing
   - Visual regression testing

2. **Implement CI/CD Pipeline**
   - Automated linting
   - Type checking
   - Test execution
   - Build optimization

3. **Add Monitoring & Analytics**
   - Error tracking (Sentry)
   - Performance monitoring
   - User analytics
   - Security event monitoring

### Medium-Term (3-6 months)
1. **Refine State Management**
   - Consider TanStack Query for server state
   - Implement optimistic updates
   - Add offline queue persistence

2. **Enhanced Security**
   - Implement API key rotation
   - Add 2FA support
   - Enhance bot detection
   - Add DDoS mitigation

3. **Performance Optimization**
   - Code splitting by route
   - Image optimization strategy
   - Bundle analysis
   - Runtime performance monitoring

### Long-Term (6+ months)
1. **Architecture Refactoring**
   - Consider BFF (Backend for Frontend) pattern if complexity grows
   - Evaluate monorepo structure
   - Consider microservices if scaling demands

2. **Advanced Features**
   - WebSocket support for real-time updates
   - GraphQL consideration if data graph complex
   - Advanced caching strategies
   - Internationalization (i18n)

3. **Operational Excellence**
   - Infrastructure as Code
   - Automated scaling
   - Disaster recovery planning
   - Security audit program

---

## Blueprint Maintenance

### Updating This Blueprint

This blueprint should be reviewed and updated:
- **When**: Major architectural changes made
- **Who**: Lead architect or designated reviewer
- **Frequency**: Quarterly or after significant changes
- **Process**:
  1. Identify architectural changes
  2. Document in this file
  3. Update code examples
  4. Review with team
  5. Communicate changes

### Related Documentation

- **PWA_IMPLEMENTATION_SUMMARY.md**: PWA-specific details
- **MIGRATION_DOCUMENTATION_INDEX.md**: Database migration patterns
- **SW_TECHNICAL_REVIEW.md**: Service Worker technical details
- **DEVELOPMENT_SERVER_FIXES.md**: Development environment setup

---

## Conclusion

This blueprint documents the comprehensive architecture of the SynergyCon 2.0 platform, emphasizing:
- **Scalability**: Clear layering enables growth
- **Maintainability**: Consistent patterns and organization
- **Security**: Multi-layer defense strategy
- **Type Safety**: Full TypeScript coverage
- **Performance**: Optimized caching and loading
- **Developer Experience**: Clear conventions and templates

For questions or clarifications, refer to the code examples, examine existing implementations, or consult with the architectural governance team.

**Last Updated**: December 30, 2025  
**Maintained By**: Development Team  
**Version**: 1.0
