# User-Facing Error Handling Implementation Guide

**Priority**: Medium  
**Effort**: 3-4 hours  
**Impact**: High - Improves UX significantly by giving users visibility into errors

## Overview

Currently, the application uses primarily **invisible** error handling:
- `console.error()` - Only visible in browser DevTools
- `alert()` - Jarring and blocks UI
- Silent failures - User doesn't know what happened

This guide provides a pattern to replace all error handling with the **toast notification system** (Sonner library).

## Current State

### ❌ Current Pattern

```typescript
// In Zustand stores or components
try {
  const response = await fetch('/api/endpoint')
  const data = await response.json()
  // ... use data
} catch (error) {
  console.error('Error:', error)  // ❌ User won't see this
}
```

### ✅ Correct Pattern

```typescript
// In Zustand stores or components
try {
  const response = await fetch('/api/endpoint')
  const data = await response.json()
  // ... use data
} catch (error) {
  // Emit error for UI to handle
  set((state) => ({
    ...state,
    error: error instanceof Error ? error.message : 'An error occurred',
  }))
}

// In component using the store:
const { error } = useMyStore()

useEffect(() => {
  if (error) {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    })
    // Clear error after showing
    set((state) => ({ ...state, error: null }))
  }
}, [error, toast])
```

## Implementation Strategy

### Step 1: Identify Error-Prone Stores

These stores have the most error handling:
1. **tickets-store.ts** - 8 try-catch blocks (ticket operations)
2. **security-store.ts** - 4 try-catch blocks (2FA, sessions)
3. **sharing-store.ts** - 2 try-catch blocks (QR, sharing)
4. **profile-store.ts** - Profile update operations
5. **auth-store.ts** - Authentication operations

### Step 2: Add Error State to Each Store

```typescript
interface MyStoreState {
  // ... existing state
  error: string | null
  success: string | null
  isLoading: boolean
}

export const useMyStore = create<MyStoreState>((set, get) => ({
  // ... existing state
  error: null,
  success: null,
  isLoading: false,
  
  setError: (error: string | null) => set({ error }),
  setSuccess: (success: string | null) => set({ success }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))
```

### Step 3: Update Error Handling in Stores

```typescript
// ❌ OLD: Silent failure
const { error } = await someApiCall()
if (error) {
  console.error('Error:', error)
  return
}

// ✅ NEW: Store the error
const { error } = await someApiCall()
if (error) {
  set((state) => ({
    ...state,
    error: error.message || 'Operation failed',
  }))
  return
}
```

### Step 4: Add Toast Display in Components

Create a hook to automatically show errors/successes from stores:

```typescript
// hooks/use-store-notifications.ts
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export function useStoreNotifications<T extends { error?: string | null; success?: string | null }>(
  store: T,
  onErrorClear?: () => void,
  onSuccessClear?: () => void
) {
  const { toast } = useToast()

  useEffect(() => {
    if (store.error) {
      toast({
        title: 'Error',
        description: store.error,
        variant: 'destructive',
      })
      onErrorClear?.()
    }
  }, [store.error, toast, onErrorClear])

  useEffect(() => {
    if (store.success) {
      toast({
        title: 'Success',
        description: store.success,
        variant: 'default',
      })
      onSuccessClear?.()
    }
  }, [store.success, toast, onSuccessClear])
}
```

Usage:
```typescript
'use client'

import { useTicketsStore } from '@/lib/stores/tickets-store'
import { useStoreNotifications } from '@/hooks/use-store-notifications'

export function MyComponent() {
  const { error, success, setError, setSuccess } = useTicketsStore()

  // Automatically show error/success toasts
  useStoreNotifications(
    { error, success },
    () => setError(null),
    () => setSuccess(null)
  )

  return (
    // ... component JSX
  )
}
```

## Affected Areas

### 1. Ticket Operations (lib/stores/tickets-store.ts)

**Methods to update**:
- `assignTicket()` - Replace console.error with error state
- `fetchTickets()` - Add error notification
- `downloadTicket()` - Add error notification
- `emailTicket()` - Add success/error notification
- `generateQRCode()` - Add error notification
- `purchaseTeamTickets()` - Add error notification
- `validateTicket()` - Add error notification
- `transferTicket()` - Add error notification
- `refreshQRCode()` - Add error notification
- `cancelTicket()` - Add error notification

**Example update**:
```typescript
// Before
const assignTicket = async (ticketId: string, memberId: string) => {
  try {
    const response = await fetch('/api/tickets/assign', {
      method: 'POST',
      body: JSON.stringify({ ticketId, memberId }),
    })
    // ... handle response
  } catch (error) {
    console.error('Assign ticket error:', error)
  }
}

// After
const assignTicket = async (ticketId: string, memberId: string) => {
  set((state) => ({ ...state, isLoading: true }))
  try {
    const response = await fetch('/api/tickets/assign', {
      method: 'POST',
      body: JSON.stringify({ ticketId, memberId }),
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to assign ticket')
    }
    
    set((state) => ({ ...state, success: 'Ticket assigned successfully' }))
  } catch (error) {
    set((state) => ({
      ...state,
      error: error instanceof Error ? error.message : 'Failed to assign ticket',
    }))
  } finally {
    set((state) => ({ ...state, isLoading: false }))
  }
}
```

### 2. Security Operations (lib/stores/security-store.ts)

**Methods to update**:
- `setup2FA()` - Add success/error notification
- `verify2FA()` - Add success/error notification
- `disable2FA()` - Add success/error notification
- `fetchSessions()` - Add error notification

### 3. Sharing Operations (lib/stores/sharing-store.ts)

**Methods to update**:
- `shareProfile()` - Add success/error notification
- `generateQRCode()` - Add error notification

### 4. Other Stores

- **profile-store.ts** - Profile update operations
- **auth-store.ts** - Login/logout operations
- **cache-store.ts** - Cache management (optional - less visible to users)

## Error Message Standards

### Standard Error Messages

```typescript
// Network errors
"No internet connection. Please check your network."
"Connection lost. Please try again."

// Validation errors
"Please fill in all required fields."
"Invalid email address."

// Server errors
"Server error. Please try again later."
"Unable to process your request. Please contact support."

// Specific errors (better when possible)
"Ticket already transferred."
"Cannot transfer validated ticket."
"User not found."
```

### Success Messages

```typescript
"Ticket transferred successfully!"
"Profile updated successfully!"
"2FA enabled successfully!"
```

## Priority Order

Implement in this order:

1. **Week 1**: Ticket operations (highest impact, most commonly used)
2. **Week 2**: Security operations (important for admin panel)
3. **Week 3**: Profile/sharing operations
4. **Week 4**: Auth operations and cleanup

## Testing Checklist

- [ ] Error appears in toast (not console)
- [ ] Error is descriptive and helpful
- [ ] Error clears after user acknowledges
- [ ] Success messages appear appropriately
- [ ] Error doesn't block UI
- [ ] Multiple errors queue properly
- [ ] Works on mobile devices
- [ ] Accessibility: Error is announced to screen readers

## Code Review Checklist

- [ ] All `console.error()` replaced with error state
- [ ] All `alert()` replaced with toast notifications
- [ ] Error messages are user-friendly
- [ ] Error state is cleared after use
- [ ] Loading states added where appropriate
- [ ] Store type definitions updated
- [ ] Components subscribe to error/success state

## Future Improvements

### 1. Error Recovery Patterns
```typescript
// Automatic retry on network error
if (error === 'Network error') {
  // Offer retry button
}
```

### 2. Error Context
```typescript
// Group related errors
const errors = {
  payment: 'Payment failed',
  validation: 'Form validation error',
  network: 'No connection',
}
```

### 3. Error Analytics
```typescript
// Track error patterns
logError({
  type: 'ticket_transfer_failed',
  reason: error.message,
  timestamp: Date.now(),
})
```

## Quick Reference

### Before

```typescript
console.error('Error:', error)
alert('Something went wrong')
```

### After

```typescript
set((state) => ({
  ...state,
  error: error instanceof Error ? error.message : 'An error occurred',
}))

// In component:
toast({
  title: 'Error',
  description: store.error,
  variant: 'destructive',
})
```

---

**Status**: Ready for implementation  
**Owner**: Frontend team  
**Updated**: January 7, 2026
