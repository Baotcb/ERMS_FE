/**
 * Global Constants
 * Centralized source of truth for application keys and configuration
 */

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_ROLE: 'user_role',
    USER_NAME: 'user_name',
} as const

export const COOKIE_OPTIONS = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
}
