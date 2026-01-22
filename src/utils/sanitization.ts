/**
 * Data Sanitization Utilities
 * Provides functions to clean and sanitize input/output data
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim()
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]/g, '') // Allow only email-safe characters
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''
  
  return phone
    .replace(/\D/g, '') // Keep only digits
    .trim()
}

/**
 * Mask sensitive data for logging
 * @param data - The data to mask
 * @param visibleChars - Number of characters to show at start and end (default: 2)
 */
export function maskSensitiveData(
  data: string,
  visibleChars: number = 2
): string {
  if (!data || typeof data !== 'string') return '[REDACTED]'
  
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length)
  }
  
  const start = data.slice(0, visibleChars)
  const end = data.slice(-visibleChars)
  const middle = '*'.repeat(Math.max(data.length - visibleChars * 2, 3))
  
  return `${start}${middle}${end}`
}

/**
 * Mask email for logging
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '[REDACTED]'
  
  const [local, domain] = email.split('@')
  const maskedLocal = local.length > 2
    ? `${local.slice(0, 2)}${'*'.repeat(local.length - 2)}`
    : '*'.repeat(local.length)
  
  return `${maskedLocal}@${domain}`
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T
  } catch {
    return fallback
  }
}

/**
 * Sanitize API error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    // Don't expose stack traces or sensitive technical details
    if (error.includes('stack') || error.includes('Error:')) {
      return 'Đã có lỗi xảy ra. Vui lòng thử lại.'
    }
    return error
  }
  
  if (error instanceof Error) {
    // Don't expose stack traces
    return 'Đã có lỗi xảy ra. Vui lòng thử lại.'
  }
  
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.'
}
