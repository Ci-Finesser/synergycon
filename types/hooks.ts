/**
 * Hook Return Types
 * Centralized type definitions for custom React hooks
 */


/* ================================
   TOAST HOOK TYPES
   ================================ */

export type ToastActionElement = React.ReactElement<any>

export interface ToastProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: 'default' | 'destructive'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ActionType = typeof TOAST_ACTION_TYPES

export const TOAST_ACTION_TYPES = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const

export type Toast = Omit<ToasterToast, 'id'>

export interface ToastState {
  toasts: ToasterToast[]
}

export interface ToastAction {
  type: keyof typeof TOAST_ACTION_TYPES
  toast?: Toast
  toastId?: string
}

/* ================================
   USE TOAST HOOK TYPES
   ================================ */

export interface UseToastReturn {
  toast: (props: Toast) => void
  dismiss: (toastId?: string) => void
  toasts: ToasterToast[]
}

/* ================================
   FORM SECURITY HOOK TYPES
   ================================ */

export interface SecurityState {
  csrfToken: string | null
  formStartTime: number | null
  isValidating: boolean
  validationError: string | null
}

export interface UseFormSecurityReturn {
  csrfToken: string | null
  isLoading: boolean
  error: string | null
  addSecurityFields: (formData: FormData) => FormData
  validateSecurity: (formData: FormData) => Promise<boolean>
}

/* ================================
   PWA INSTALL HOOK TYPES
   ================================ */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface UsePWAReturn {
  isInstallable: boolean
  isInstalled: boolean
  isIOS: boolean
  showPrompt: boolean
  install: () => Promise<void>
  dismiss: () => void
  setShowPrompt: (show: boolean) => void
}

/* ================================
   PAGINATION HOOK TYPES
   ================================ */

export interface UsePaginationReturn {
  currentPage: number
  totalPages: number
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  canNextPage: boolean
  canPrevPage: boolean
  pageSize: number
  setPageSize: (size: number) => void
}

/* ================================
   FETCH HOOK TYPES
   ================================ */

export interface UseFetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export interface UseFetchReturn<T> extends UseFetchState<T> {
  refetch: () => Promise<void>
}

/* ================================
   INFINITE SCROLL HOOK TYPES
   ================================ */

export interface UseInfiniteScrollReturn {
  items: any[]
  isLoading: boolean
  hasMore: boolean
  observerTarget: React.RefObject<HTMLDivElement>
  reset: () => void
}

/* ================================
   LOCAL STORAGE HOOK TYPES
   ================================ */

export interface UseLocalStorageReturn<T> {
  value: T | null
  setValue: (value: T) => void
  removeValue: () => void
  loading: boolean
}

/* ================================
   DEBOUNCE HOOK TYPES
   ================================ */

export interface UseDebouncedReturn<T> {
  value: T
}

export interface UseDebouncedOptions {
  delay: number
}

/* ================================
   THROTTLE HOOK TYPES
   ================================ */

export interface UseThrottledReturn<T> {
  value: T
}

export interface UseThrottledOptions {
  interval: number
}

/* ================================
   ADMIN PAYMENTS HOOK TYPES
   ================================ */

export interface AnalyticsResult {
  success: boolean
  data?: any
  error?: Error
}

export interface PaymentsListResult {
  success: boolean
  data?: any
  error?: Error
}

export interface UseAdminPaymentsReturn {
  analytics: AnalyticsResult
  paymentsList: PaymentsListResult
  isLoading: boolean
  refetch: () => Promise<void>
}

/* ================================
   CUSTOM HOOK RETURN TYPE UTILITIES
   ================================ */

export type AsyncHookState<T, E = Error> = {
  data: T | null
  loading: boolean
  error: E | null
}

export type AsyncHookReturn<T, E = Error> = AsyncHookState<T, E> & {
  refetch: () => Promise<void>
  reset: () => void
}
