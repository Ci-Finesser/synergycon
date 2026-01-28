# GitHub Copilot Instructions

## Priority Guidelines

When generating code for this repository:

1. **Version Compatibility**: Always detect and respect the exact versions of languages, frameworks, and libraries used in this project
2. **Context Files**: Prioritize patterns and standards defined in the .github/copilot directory
3. **Codebase Patterns**: When context files don't provide specific guidance, scan the codebase for established patterns
4. **Architectural Consistency**: Maintain the Layered architectural style and established boundaries
5. **Code Quality**: Prioritize maintainability, performance, security, accessibility, and testability in all generated code

## Technology Version Detection

Before generating code, scan the codebase to identify:

### Exact Technology Versions (from package.json)

**Core Framework**:
- Next.js: 16.0.10 (App Router, Server Components, Standalone output)
- React: 19.2.0 (with react-jsx transform)
- TypeScript: 5.9.3 (target ES6, strict mode enabled)
- Node.js: Version 22+ (detected from @types/node)

**UI & Styling**:
- Tailwind CSS: 4.1.9 (with @tailwindcss/postcss)
- Radix UI Components: Latest versions (20+ primitives)
- Lucide React: 0.454.0
- Framer Motion: 12.23.26
- next-themes: 0.4.6

**Data & State**:
- Supabase: Latest (@supabase/supabase-js, @supabase/ssr)
- Zustand: 5.0.9 (with persist middleware)
- React Hook Form: 7.60.0
- Zod: 3.25.76

**PWA Stack**:
- Workbox: 7.4.0 (routing, strategies, precaching, expiration, background-sync, window)
- idb: 8.0.3 (IndexedDB wrapper)

**Email & Communication**:
- @react-email/components: Latest
- Resend: Latest

**Development**:
- PostCSS: 8.5+
- Autoprefixer: 10.4.20
- Sharp: 0.34.5
- Supabase CLI: 1.200.3

### Language Features to Use
- **TypeScript**: ES6 target, strict mode, react-jsx transform, module: esnext
- **React**: Use React 19 features (concurrent rendering, automatic batching)
- **Next.js 16**: App Router patterns, Server Components by default, Server Actions, Metadata API

## Context Files

Reference these files in .github directory:
- **copilot-migration-instructions.md**: Migration guidelines and coding standards
- **SECRETS_CHECKLIST.md**: Environment variable and security guidelines

## Codebase Scanning Instructions

### Naming Conventions
- **Components**: PascalCase (e.g., `SpeakerCard`, `PWAInstallPrompt`)
- **Files**: kebab-case for components (e.g., `speaker-card.tsx`), camelCase for utilities
- **Functions**: camelCase (e.g., `createClient`, `validateRequestSecurity`)
- **Hooks**: use prefix + PascalCase (e.g., `usePWA`, `useFormSecurity`)
- **Stores**: use + FeatureName + Store (e.g., `usePWAInstallStore`, `useNetworkStore`)
- **Types/Interfaces**: PascalCase (e.g., `Speaker`, `SecurityEvent`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `RATE_LIMITS`, `HONEYPOT_FIELDS`)

### Component Patterns

**Named Export for UI Components**:
```typescript
export function ComponentName({ prop }: Props) {
  return <div>...</div>
}