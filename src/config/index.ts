/**
 * Application Configuration
 * Centralized config for API and environment settings
 */

export const config = {
    /**
     * Base API URL
     * Force empty string to use relative path, ensuring Next.js rewrites and middleware
     * can intercept requests to inject HttpOnly cookies.
     */
    apiUrl: '',
} as const

export type AppConfig = typeof config
