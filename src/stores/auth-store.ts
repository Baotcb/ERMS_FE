import { create } from 'zustand'
import { getCookie } from '../features/core/auth/utils/auth-cookies'

export interface User {
    id: string
    email: string
    fullName?: string
    role?: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean

    // Actions
    login: (token: string, user: User, rememberMe?: boolean) => void
    logout: () => void
    updateUser: (userData: Partial<User>) => void
    initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: (_token, user) => {
        // Token is now handled by HttpOnly cookies
        set({
            user,
            isAuthenticated: true,
            isLoading: false,
        })
    },

    logout: () => {
        // Server action handles cookie deletion
        set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        })
    },

    updateUser: (userData) => {
        set((state) => {
            if (!state.user) return state
            return { user: { ...state.user, ...userData } }
        })
    },

    initialize: () => {
        try {
            // Restore session from client-accessible cookies (role/name)
            // The actual security is handled by the HttpOnly auth_token
            const userRole = getCookie('user_role')
            const userNameEncoded = getCookie('user_name')

            if (userRole) {
                const fullName = userNameEncoded ? decodeURIComponent(userNameEncoded) : 'User'

                // We don't have ID or Email in the public cookie, but we can assume session is valid clearly enough for UI
                // For critical data, components will fetch /api/me where middleware injects the real token

                const user: User = {
                    id: 'current', // Placeholder
                    email: '',     // Placeholder
                    fullName,
                    role: userRole
                }

                set({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                })
            } else {
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                })
            }
        } catch (error) {
            console.error('Error initializing auth store:', error)
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            })
        }
    },
}))
