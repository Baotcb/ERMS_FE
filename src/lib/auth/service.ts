import { api, ApiException } from '@/lib/api'
import { LoginRequest, AuthResponse, RegisterRequest } from './types'
import { extractUserFromToken } from './utils'

export const authService = {
    /**
     * Login user
     */
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>(
                '/api/Auth/login',
                credentials
            )

            // Store token if present
            if (response.token) {
                localStorage.setItem('token', response.token)

                // Extract user info from JWT token
                const user = extractUserFromToken(response.token)
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user))
                }
            }

            return response
        } catch (error) {
            if (error instanceof ApiException) {
                throw error
            }
            throw new ApiException('Login failed', 0)
        }
    },

    /**
     * Register new user (candidate)
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>(
                '/api/Auth/register',
                {
                    ...data,
                    role: data.role || 'candidate', // Default to candidate role
                }
            )

            return response
        } catch (error) {
            if (error instanceof ApiException) {
                throw error
            }
            throw new ApiException('Registration failed', 0)
        }
    },

    /**
     * Logout user
     */
    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    },

    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user')
            if (userStr) {
                try {
                    return JSON.parse(userStr)
                } catch {
                    return null
                }
            }
        }
        return null
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem('token')
        }
        return false
    },

    /**
     * Get auth token
     */
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token')
        }
        return null
    },
}
