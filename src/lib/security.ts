/**
 * Security Utilities
 * Provides security-related functions for token management, validation, and protection
 */

/**
 * Validate JWT token format and expiration
 */
export function validateToken(token: string): { valid: boolean; expired: boolean; payload?: any } {
  if (!token || typeof token !== 'string') {
    return { valid: false, expired: false }
  }

  try {
    // Basic JWT format validation
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, expired: false }
    }

    // Decode payload without verification (verification should happen server-side)
    const payload = JSON.parse(atob(parts[1]))

    // Check expiration
    const currentTime = Math.floor(Date.now() / 1000)
    const isExpired = payload.exp && payload.exp < currentTime

    return {
      valid: true,
      expired: isExpired,
      payload,
    }
  } catch {
    return { valid: false, expired: false }
  }
}

/**
 * Get time until token expiration in seconds
 */
export function getTokenExpiryTime(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    const currentTime = Math.floor(Date.now() / 1000)

    if (!payload.exp) return null

    const timeLeft = payload.exp - currentTime
    return timeLeft > 0 ? timeLeft : 0
  } catch {
    return null
  }
}

/**
 * Check if token is near expiration (within 5 minutes)
 */
export function isTokenNearExpiry(token: string, bufferSeconds: number = 300): boolean {
  const timeLeft = getTokenExpiryTime(token)
  return timeLeft !== null && timeLeft <= bufferSeconds
}

/**
 * Sanitize URL to prevent open redirects
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin)

    // Ensure the URL is same-origin
    if (parsed.origin !== window.location.origin) {
      return '/'
    }

    return url
  } catch {
    return '/'
  }
}

/**
 * Generate a CSRF token for forms
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate user role for authorization
 */
export function hasRequiredRole(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (!userRole) return false
  return requiredRoles.includes(userRole)
}

/**
 * Rate limit helper for client-side (basic implementation)
 * Server-side rate limiting should be implemented on the backend
 */
export class RateLimiter {
  private timestamps: number[] = []
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  /**
   * Check if request is allowed
   */
  isAllowed(): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Remove old timestamps
    this.timestamps = this.timestamps.filter(t => t > windowStart)

    // Check limit
    if (this.timestamps.length >= this.maxRequests) {
      return false
    }

    // Add current timestamp
    this.timestamps.push(now)
    return true
  }

  /**
   * Get time until next request is allowed
   */
  getTimeUntilAllowed(): number {
    if (this.timestamps.length < this.maxRequests) return 0

    const oldestTimestamp = this.timestamps[0]
    const windowStart = Date.now() - this.windowMs
    const timeUntilAllowed = oldestTimestamp - windowStart

    return Math.max(0, timeUntilAllowed)
  }

  /**
   * Reset the limiter
   */
  reset(): void {
    this.timestamps = []
  }
}

/**
 * Password strength checker
 */
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
  isStrong: boolean
} {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) score++
  else feedback.push('Mật khẩu phải có ít nhất 8 ký tự')

  if (password.length >= 12) score++

  // Uppercase
  if (/[A-Z]/.test(password)) score++
  else feedback.push('Mật khẩu phải chứa chữ hoa')

  // Lowercase
  if (/[a-z]/.test(password)) score++
  else feedback.push('Mật khẩu phải chứa chữ thường')

  // Numbers
  if (/\d/.test(password)) score++
  else feedback.push('Mật khẩu phải chứa số')

  // Special characters
  if (/[@$!%*?&]/.test(password)) score++
  else feedback.push('Mật khẩu phải chứa ký tự đặc biệt (@$!%*?&)')

  // Common patterns
  if (/^[a-zA-Z]+$/.test(password) || /^\d+$/.test(password)) {
    score--
    feedback.push('Tránh sử dụng chỉ chữ hoặc chỉ số')
  }

  // Sequential patterns
  if (/(012|123|234|345|456|567|678|789|890|abc|bcd|cde)/i.test(password)) {
    score--
    feedback.push('Tránh sử dụng các ký tự liên tiếp')
  }

  return {
    score: Math.max(0, Math.min(score, 5)),
    feedback,
    isStrong: score >= 4,
  }
}

/**
 * Check if an IP address is from a trusted source
 * This is a basic implementation - use a proper IP validation library in production
 */
export function isTrustedIp(ip: string): boolean {
  // List of trusted IPs (can be configured)
  const trustedIps = [
    '127.0.0.1',
    '::1',
    // Add more trusted IPs as needed
  ]

  return trustedIps.includes(ip)
}

/**
 * Validate file type for upload
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

/**
 * Validate file size for upload
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Generate a secure random ID
 */
export function generateSecureId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
  return `${timestamp}-${randomPart}`
}
