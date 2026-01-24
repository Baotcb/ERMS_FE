/**
 * Application Configuration
 * Centralized config for API and environment settings
 */

export const config = {
    /**
     * Base API URL
     * Uses NEXT_PUBLIC_API_URL environment variable
     */
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
} as const

export type AppConfig = typeof config
