import QRCode from 'qrcode'

export interface QRCodeOptions {
  width?: number
  margin?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  color?: {
    dark?: string
    light?: string
  }
  logoUrl?: string
  logoSize?: number
}

/**
 * Generate QR code as data URL with optional centered logo
 */
export async function generateQRCode(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    width = 300,
    margin = 4,
    errorCorrectionLevel = 'H', // High error correction for logo overlay
    color = { dark: '#000000', light: '#ffffff' },
    logoUrl,
    logoSize = 60,
  } = options

  try {
    // Generate base QR code
    const qrDataUrl = await QRCode.toDataURL(data, {
      width,
      margin,
      errorCorrectionLevel,
      color,
    })

    // If no logo, return base QR code
    if (!logoUrl) {
      return qrDataUrl
    }

    // Check if running in browser environment
    if (typeof document === 'undefined') {
      console.warn('Logo overlay requires browser environment, returning base QR code')
      return qrDataUrl
    }

    // Create canvas to overlay logo
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return qrDataUrl
    }

    // Load QR code image
    const qrImage = new Image()
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve
      qrImage.onerror = reject
      qrImage.src = qrDataUrl
    })

    // Set canvas size
    canvas.width = width
    canvas.height = width

    // Draw QR code
    ctx.drawImage(qrImage, 0, 0, width, width)

    // Load and draw logo
    const logoImage = new Image()
    logoImage.crossOrigin = 'anonymous'
    await new Promise((resolve, reject) => {
      logoImage.onload = resolve
      logoImage.onerror = reject
      logoImage.src = logoUrl
    })

    // Calculate logo position (centered)
    const logoX = (width - logoSize) / 2
    const logoY = (width - logoSize) / 2

    // Draw white background for logo (for better visibility)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10)

    // Draw logo
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)

    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error generating QR code:', error)
    // Fallback to basic QR code without logo
    return QRCode.toDataURL(data, {
      width,
      margin,
      errorCorrectionLevel,
      color,
    })
  }
}

/**
 * Generate QR code for ticket (server-side compatible)
 */
export async function generateTicketQRCode(
  ticketData: string,
  options: Omit<QRCodeOptions, 'logoUrl'> = {}
): Promise<string> {
  const {
    width = 300,
    margin = 4,
    errorCorrectionLevel = 'H',
    color = { dark: '#000000', light: '#ffffff' },
  } = options

  try {
    return await QRCode.toDataURL(ticketData, {
      width,
      margin,
      errorCorrectionLevel,
      color,
    })
  } catch (error) {
    console.error('Error generating ticket QR code:', error)
    throw error
  }
}

/**
 * Generate QR code data for a ticket
 */
export function createTicketQRData(ticket: {
  id: string
  ticket_number: string
  user_id: string
  ticket_type: string
}): string {
  // Create a JSON payload with ticket verification data
  const qrData = {
    ticket_id: ticket.id,
    ticket_number: ticket.ticket_number,
    user_id: ticket.user_id,
    ticket_type: ticket.ticket_type,
    timestamp: Date.now(),
  }

  return JSON.stringify(qrData)
}

/**
 * Verify ticket QR code data
 */
export function verifyTicketQRData(qrData: string): {
  valid: boolean
  data?: any
  error?: string
} {
  try {
    const parsed = JSON.parse(qrData)

    // Validate required fields
    if (!parsed.ticket_id || !parsed.ticket_number || !parsed.user_id) {
      return {
        valid: false,
        error: 'Invalid ticket data: missing required fields',
      }
    }

    // Check timestamp (reject if older than 24 hours for security)
    const now = Date.now()
    const qrAge = now - (parsed.timestamp || 0)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (qrAge > maxAge) {
      return {
        valid: false,
        error: 'QR code expired',
      }
    }

    return {
      valid: true,
      data: parsed,
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid QR code format',
    }
  }
}

/**
 * Generate 2FA QR code from TOTP URL
 */
export async function generate2FAQRCode(
  otpauthUrl: string,
  options: Omit<QRCodeOptions, 'logoUrl'> = {}
): Promise<string> {
  const {
    width = 300,
    margin = 2,
    errorCorrectionLevel = 'H',
    color = { dark: '#000000', light: '#ffffff' },
  } = options

  try {
    return await QRCode.toDataURL(otpauthUrl, {
      width,
      margin,
      errorCorrectionLevel,
      color,
    })
  } catch (error) {
    console.error('Error generating 2FA QR code:', error)
    throw error
  }
}

/**
 * Generate profile URL QR code
 */
export async function generateProfileQRCode(
  profileUrl: string,
  options: Omit<QRCodeOptions, 'logoUrl'> = {}
): Promise<string> {
  const {
    width = 400,
    margin = 2,
    errorCorrectionLevel = 'M',
    color = { dark: '#000000', light: '#FFFFFF' },
  } = options

  try {
    return await QRCode.toDataURL(profileUrl, {
      width,
      margin,
      errorCorrectionLevel,
      color,
    })
  } catch (error) {
    console.error('Error generating profile QR code:', error)
    throw error
  }
}

/**
 * Generate QR code as PNG buffer (server-side)
 */
export async function generateQRCodeBuffer(
  data: string,
  options: Omit<QRCodeOptions, 'logoUrl'> = {}
): Promise<Buffer> {
  const {
    width = 300,
    margin = 4,
    errorCorrectionLevel = 'H',
    color = { dark: '#000000', light: '#ffffff' },
  } = options

  try {
    return await QRCode.toBuffer(data, {
      type: 'png',
      width,
      margin,
      errorCorrectionLevel,
      color,
    })
  } catch (error) {
    console.error('Error generating QR code buffer:', error)
    throw error
  }
}