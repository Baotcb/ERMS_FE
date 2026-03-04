/**
 * Auth Cookie Utilities
 * Centralized cookie management for authentication
 */

// Max age constants kept for reference

/**
 * Set all authentication cookies
 * @deprecated Use /api/auth/session/login API route instead for HttpOnly cookies
 */
export function setAuthCookies(): void {
  console.warn('setAuthCookies is deprecated. Use API route for HttpOnly cookies.')
}

/**
 * Clear all authentication cookies
 * @deprecated Use /api/auth/session/logout API route instead
 */
export function clearAuthCookies(): void {
  console.warn('clearAuthCookies is deprecated. Use API route.')
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
  if (!match) return undefined
  // Use substring instead of split('=')[1] to handle values containing '='
  return match.substring(name.length + 1)
}
