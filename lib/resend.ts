import { Resend } from "resend"

let resendInstance: Resend | null = null

// Lazy initialization to avoid build-time errors when API key is missing
export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

// Legacy export for backward compatibility (will throw if key is missing)
export const resend = {
  get emails() {
    return getResend().emails
  },
  get domains() {
    return getResend().domains
  },
  get apiKeys() {
    return getResend().apiKeys
  },
  get audiences() {
    return getResend().audiences
  },
  get contacts() {
    return getResend().contacts
  }
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 0
}
