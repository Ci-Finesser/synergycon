/**
 * Honeypot Anti-Bot Protection Utilities
 * 
 * This module provides honeypot field validation to catch automated bots.
 * Honeypots are hidden fields that should remain empty - bots typically
 * fill all fields, while humans won't see or fill hidden fields.
 */

/**
 * Honeypot field names to be used in forms
 * These should be named to look legitimate to bots
 */
export const HONEYPOT_FIELDS = {
  // Primary honeypot - hidden with CSS
  website: 'website_url',
  // Secondary honeypot - positioned off-screen
  company: 'org_company_name',
  // Tertiary honeypot - opacity 0
  address: 'business_address',
} as const

/**
 * Time-based validation - forms submitted too quickly are likely bots
 */
const MIN_FORM_FILL_TIME = 3000 // 3 seconds minimum

/**
 * Validate honeypot fields - they should all be empty
 */
export function validateHoneypot(formData: Record<string, any>): {
  isValid: boolean
  reason?: string
} {
  // Check if any honeypot field is filled
  for (const [fieldName, fieldKey] of Object.entries(HONEYPOT_FIELDS)) {
    const value = formData[fieldKey]
    if (value && value.trim() !== '') {
      console.warn(`[Security] Honeypot field '${fieldKey}' was filled - potential bot detected`)
      return {
        isValid: false,
        reason: `Honeypot field '${fieldName}' should be empty`,
      }
    }
  }

  return { isValid: true }
}

/**
 * Validate form submission timing
 */
export function validateFormTiming(startTime: number, currentTime: number): {
  isValid: boolean
  reason?: string
} {
  const timeDiff = currentTime - startTime

  if (timeDiff < MIN_FORM_FILL_TIME) {
    console.warn(`[Security] Form submitted too quickly (${timeDiff}ms) - potential bot detected`)
    return {
      isValid: false,
      reason: 'Form submitted too quickly',
    }
  }

  return { isValid: true }
}

/**
 * Comprehensive bot detection validation
 */
export function validateBotProtection(
  formData: Record<string, any>,
  startTime?: number
): {
  isValid: boolean
  reason?: string
} {
  // Validate honeypot fields
  const honeypotResult = validateHoneypot(formData)
  if (!honeypotResult.isValid) {
    return honeypotResult
  }

  // Validate timing if provided
  if (startTime) {
    const timingResult = validateFormTiming(startTime, Date.now())
    if (!timingResult.isValid) {
      return timingResult
    }
  }

  return { isValid: true }
}

/**
 * Get honeypot field props for React forms
 */
export function getHoneypotFieldProps(fieldKey: keyof typeof HONEYPOT_FIELDS) {
  return {
    name: HONEYPOT_FIELDS[fieldKey],
    'aria-hidden': 'true',
    tabIndex: -1,
    autoComplete: 'off',
  }
}
