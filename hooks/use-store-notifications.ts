/**
 * Hook to display store notifications (errors and successes) as toasts
 * Usage: useStoreNotifications(store, onErrorClear, onSuccessClear)
 */

import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface Notifiable {
  error?: string | null
  success?: string | null
  warning?: string | null
}

export interface NotificationOptions {
  autoClose?: boolean // Auto-close after showing (default: true)
  duration?: number // Duration before auto-close in ms (default: 5000)
}

/**
 * Use store notifications - automatically display error/success messages from Zustand stores
 * @param store - Store object with error, success, warning properties
 * @param onErrorClear - Callback to clear error from store
 * @param onSuccessClear - Callback to clear success from store
 * @param onWarningClear - Callback to clear warning from store
 * @param options - Configuration options
 */
export function useStoreNotifications(
  store: Notifiable,
  onErrorClear?: () => void,
  onSuccessClear?: () => void,
  onWarningClear?: () => void,
  options: NotificationOptions = {}
) {
  const { toast } = useToast()
  const { autoClose = true, duration = 5000 } = options

  // Handle errors
  useEffect(() => {
    if (store && store.error) {
      toast({
        title: 'Error',
        description: store.error,
        variant: 'destructive',
      })

      if (autoClose) {
        const timeout = setTimeout(() => {
          onErrorClear?.()
        }, duration)

        return () => clearTimeout(timeout)
      } else {
        // Clear on user action
        onErrorClear?.()
      }
    }
  }, [store, store?.error, toast, onErrorClear, autoClose, duration])

  // Handle successes
  useEffect(() => {
    if (store && store.success) {
      toast({
        title: 'Success',
        description: store.success,
        variant: 'default',
      })

      if (autoClose) {
        const timeout = setTimeout(() => {
          onSuccessClear?.()
        }, duration)

        return () => clearTimeout(timeout)
      } else {
        // Clear on user action
        onSuccessClear?.()
      }
    }
  }, [store, store?.success, toast, onSuccessClear, autoClose, duration])

  // Handle warnings
  useEffect(() => {
    if (store && store.warning) {
      toast({
        title: 'Warning',
        description: store.warning,
        variant: 'default',
      })

      if (autoClose) {
        const timeout = setTimeout(() => {
          onWarningClear?.()
        }, duration)

        return () => clearTimeout(timeout)
      } else {
        // Clear on user action
        onWarningClear?.()
      }
    }
  }, [store, store?.warning, toast, onWarningClear, autoClose, duration])
}

/**
 * Simplified version for use with store selectors
 * Usage: const { showError } = useErrorNotification()
 *        showError('Something went wrong')
 */
export function useErrorNotification() {
  const { toast } = useToast()

  const showError = (message: string, title: string = 'Error') => {
    toast({
      title,
      description: message,
      variant: 'destructive',
    })
  }

  const showSuccess = (message: string, title: string = 'Success') => {
    toast({
      title,
      description: message,
      variant: 'default',
    })
  }

  const showWarning = (message: string, title: string = 'Warning') => {
    toast({
      title,
      description: message,
      variant: 'default',
    })
  }

  return { showError, showSuccess, showWarning }
}
