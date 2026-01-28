/**
 * Security Hook for Forms
 * 
 * Custom React hook that provides CSRF protection and honeypot functionality
 */

'use client'

import { useState, useEffect } from 'react'
import { HONEYPOT_FIELDS, getHoneypotFieldProps } from '@/lib/honeypot'

interface SecurityState {
  csrfToken: string | null
  isLoading: boolean
  formStartTime: number
  honeypotFields: Record<string, string>
}

export function useFormSecurity() {
  const [security, setSecurity] = useState<SecurityState>({
    csrfToken: null,
    isLoading: true,
    formStartTime: Date.now(),
    honeypotFields: {
      [HONEYPOT_FIELDS.website]: '',
      [HONEYPOT_FIELDS.company]: '',
      [HONEYPOT_FIELDS.address]: '',
    },
  })

  useEffect(() => {
    // Fetch CSRF token when component mounts
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.token) {
          throw new Error('No token in response')
        }
        
        setSecurity(prev => ({
          ...prev,
          csrfToken: data.token,
          isLoading: false,
        }))
      } catch (error) {
        console.error('[Security] Failed to fetch CSRF token:', error)
        setSecurity(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchCSRFToken()
  }, [])

  const updateHoneypot = (field: string, value: string) => {
    setSecurity(prev => ({
      ...prev,
      honeypotFields: {
        ...prev.honeypotFields,
        [field]: value,
      },
    }))
  }

  const getSecureFormData = (formData: Record<string, any>) => {
    return {
      ...formData,
      _csrf: security.csrfToken,
      _formStartTime: security.formStartTime,
      ...security.honeypotFields,
    }
  }

  return {
    csrfToken: security.csrfToken,
    isLoading: security.isLoading,
    formStartTime: security.formStartTime,
    honeypotFields: security.honeypotFields,
    updateHoneypot,
    getSecureFormData,
    getHoneypotFieldProps,
    HONEYPOT_FIELDS,
  }
}
