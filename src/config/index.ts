/**
 * Application Configuration
 * Centralized config for API and environment settings
 */

export const config = {
    /**
     * Base API URL
     * Server-side: Use absolute URL from env
     * Client-side: Force empty string to use relative path (Next.js rewrites/middleware)
     */
    apiUrl: typeof window === 'undefined'
        ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '')
        : '',
} as const

export type AppConfig = typeof config
