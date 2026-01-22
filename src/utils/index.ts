// Utility functions
// Export your utility functions from this file

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Re-export sanitization utilities
export * from './sanitization'

// Re-export error handler utilities
export * from './error-handler'

// Export logger utility
export { logger } from './logger'