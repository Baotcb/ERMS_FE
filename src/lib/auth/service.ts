import { api, ApiException } from '@/lib/api'
import { LoginRequest, AuthResponse, RegisterRequest, ResetPasswordRequest } from './types'
import { extractUserFromToken } from './utils'

export interface UserProfile {
    userName: string;
    email: string;
    fullName: string;
    dateOfBirth?: string;
    hometown?: string;
    phones?: string;
    departmentId?: number;
    departmentName?: string;
    status: number;
    dateJoined: string;
}

export interface UpdateProfileRequest {
    fullName: string;
    dateOfBirth?: string;
    hometown?: string;
    phones?: string;
}

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

                // Also set in cookie for Middleware
                document.cookie = `token=${response.token}; path=/; max-age=86400; SameSite=Strict`

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
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
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

    /**
     * Get user profile from backend
     */
    async getProfile(): Promise<UserProfile> {
        return api.get<UserProfile>('/api/User/profile')
    },

    /**
     * Update user profile
     */
    async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
        return api.put<UserProfile>('/api/User/profile', data)
    },

    /**
     * Request password reset
     */
    async forgotPassword(email: string): Promise<void> {
        return api.post('/api/Auth/forgot-password', { email })
    },

    /**
     * Change password
     */
    async changePassword(data: import('./types').ChangePasswordRequest): Promise<void> {
        return api.post('/api/Auth/change-password', data)
    },

    /**
     * Reset password using token
     */
    async resetPassword(data: ResetPasswordRequest): Promise<void> {
        return api.post('/api/Auth/reset-password', data)
    }
}
