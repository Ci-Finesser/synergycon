/**
 * Bot and scraper detection utility
 * Protects admin routes from automated attacks and reconnaissance
 */

// Common bot and scraper user agents
const KNOWN_BOTS = [
  "bot",
  "crawler",
  "spider",
  "scraper",
  "slurp",
  "curl",
  "wget",
  "python",
  "java",
  "perl",
  "ruby",
  "go-http-client",
  "httpx",
  "aiohttp",
  "requests",
  "scrapy",
  "selenium",
  "puppeteer",
  "headless",
  "phantomjs",
  "sqlmap",
  "nikto",
  "nmap",
  "masscan",
  "nessus",
  "metasploit",
  "burpsuite",
  "zap",
]

// Suspicious header patterns
const SUSPICIOUS_HEADERS = [
  "x-forwarded-for",
  "x-real-ip",
  "x-originating-ip",
  "x-client-ip",
  "cf-connecting-ip",
]

// Suspicious URL patterns that indicate reconnaissance
const SUSPICIOUS_PATTERNS = [
  /\/admin\/[a-z0-9-]+\/\.\.\//i, // Directory traversal attempts
  /\/admin.*[;'"]/i, // SQL injection indicators
  /\/admin.*%[0-9a-f]{2}/i, // URL encoding suspicious characters
  /\.[a-z]{3,4}~$/i, // Backup file patterns
  /\.bak$/i,
  /\.backup$/i,
  /\.old$/i,
  /\.orig$/i,
  /web\.config$/i,
  /\.git\//i,
  /\.env$/i,
  /\.aws$/i,
  /\.ssh$/i,
]

interface BotCheckResult {
  isBot: boolean
  reason?: string
  severity: "low" | "medium" | "high"
}

/**
 * Detect if request appears to be from a bot or scraper
 */
export function detectBot(userAgent: string | null, pathname: string): BotCheckResult {
  if (!userAgent) {
    return {
      isBot: false,
      severity: "low",
    }
  }

  const lowerUA = userAgent.toLowerCase()

  // Check for known bots
  for (const botName of KNOWN_BOTS) {
    if (lowerUA.includes(botName)) {
      return {
        isBot: true,
        reason: `Known bot detected: ${botName}`,
        severity: "high",
      }
    }
  }

  // Check for suspicious patterns in URL
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(pathname)) {
      return {
        isBot: true,
        reason: `Suspicious URL pattern detected`,
        severity: "high",
      }
    }
  }

  return {
    isBot: false,
    severity: "low",
  }
}

/**
 * Check for suspicious headers that indicate proxy/VPN/bot
 */
export function hasSuspiciousHeaders(headers: Headers): {
  isSuspicious: boolean
  details: string[]
} {
  const suspicious: string[] = []

  // Check for too many forwarding headers (indicates proxy chain)
  let forwardingCount = 0
  for (const [key] of headers) {
    if (SUSPICIOUS_HEADERS.includes(key.toLowerCase())) {
      forwardingCount++
      suspicious.push(`Multiple forwarding header: ${key}`)
    }
  }

  if (forwardingCount > 2) {
    suspicious.push("Multiple proxy headers detected")
  }

  // Check for missing common browser headers
  const referer = headers.get("referer")
  const accept = headers.get("accept")
  const acceptLanguage = headers.get("accept-language")

  // Bots often don't have these headers or have unusual patterns
  if (!referer && !accept) {
    suspicious.push("Missing common browser headers")
  }

  // Check for unusual accept header (bots might request unusual content types)
  if (accept && !accept.includes("text/html") && !accept.includes("*/*")) {
    suspicious.push("Unusual accept header")
  }

  return {
    isSuspicious: suspicious.length > 0,
    details: suspicious,
  }
}

/**
 * Validate request appears to be from legitimate browser
 */
export function validateBrowserSignature(headers: Headers): {
  isValid: boolean
  reason?: string
} {
  // Modern browsers should have these headers
  const userAgent = headers.get("user-agent")
  const acceptEncoding = headers.get("accept-encoding")
  const accept = headers.get("accept")

  if (!userAgent) {
    return {
      isValid: false,
      reason: "Missing user-agent header",
    }
  }

  if (!acceptEncoding) {
    return {
      isValid: false,
      reason: "Missing accept-encoding header",
    }
  }

  if (!accept) {
    return {
      isValid: false,
      reason: "Missing accept header",
    }
  }

  // Check if user agent looks like a real browser
  const browserPatterns = [
    /chrome|safari|firefox|edge|opera|brave|vivaldi/i,
    /mozilla/i,
  ]

  const isBrowserUA = browserPatterns.some((pattern) => pattern.test(userAgent))

  if (!isBrowserUA) {
    return {
      isValid: false,
      reason: "User-agent does not match known browsers",
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Log bot/scraper detection event
 */
export function logBotDetection(details: {
  userAgent: string | null
  path: string
  ip?: string | null
  reason: string
  severity: "low" | "medium" | "high"
}) {
  const timestamp = new Date().toISOString()
  const logLevel = details.severity === "high" ? "error" : "warn"

  console[logLevel](
    `[BOT_DETECTION] ${details.reason}`,
    {
      timestamp,
      path: details.path,
      ip: details.ip,
      userAgent: details.userAgent?.substring(0, 100),
      severity: details.severity,
    }
  )
}
