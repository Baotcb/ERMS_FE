// Global type definitions
// Export your types and interfaces from this file

/**
 * Base user interface
 */
export interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'hr' | 'candidate' | 'employee'
    avatar?: string
    createdAt: Date
    updatedAt: Date
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
    status: 'success' | 'error'
    data: T | null
    message: string
    error?: {
        code: string
        details: string
    }
    meta?: {
        page: number
        limit: number
        total: number
    }
}

/**
 * Pagination params
 */
export interface PaginationParams {
    page: number
    limit: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}
