/**
 * Application Configuration
 * Centralized config for API and environment settings
 */

export const config = {
    /**
     * Base API URL
     * Empty = use relative path, Next.js rewrites will proxy to actual backend
     * This hides the real backend URL from browser DevTools
     */
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    apiUrl: '',
} as const

export type AppConfig = typeof config
