/**
 * Auth Cookie Utilities
 * Centralized cookie management for authentication
 */

const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

interface SetAuthCookiesOptions {
  token: string;
  role: string;
  displayName: string;
  maxAge?: number;
}

/**
 * Set all authentication cookies
 */
export function setAuthCookies({
  token,
  role,
  displayName,
  maxAge = DEFAULT_MAX_AGE,
}: SetAuthCookiesOptions): void {
  // Use secure flags for production
  const isSecure = window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  
  document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}${secureFlag}; HttpOnly; SameSite=Strict`;
  document.cookie = `user_role=${role}; path=/; max-age=${maxAge}${secureFlag}; SameSite=Strict`;
  document.cookie = `user_name=${encodeURIComponent(displayName)}; path=/; max-age=${maxAge}${secureFlag}; SameSite=Strict`;
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies(): void {
  const expiredDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `auth_token=; path=/; expires=${expiredDate}`;
  document.cookie = `user_role=; path=/; expires=${expiredDate}`;
  document.cookie = `user_name=; path=/; expires=${expiredDate}`;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}
