import { create } from 'zustand'
import { logger } from '@/lib/logger'
import { getCookie } from '../features/core/auth/utils/auth-cookies'
import { STORAGE_KEYS } from '../utils/constants'

export interface User {
    id: string
    email: string
    fullName?: string
    role?: string
    isTrainer?: boolean
    departmentId?: number
    departmentName?: string
    avatarUrl?: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean

    // Actions
    login: (token: string, user: User) => void
    logout: () => void
    updateUser: (userData: Partial<User>) => void
    initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: (_token, user) => {
        // Token is now managed via HttpOnly cookies - no client-side validation needed
        // Store only tracks UI state

        set({
            user,
            isAuthenticated: true,
            isLoading: false,
        })
    },

    logout: () => {
        // Server action or API endpoint must handle the actual cookie deletion
        // This just clears the UI state
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
            // Restore session from client-accessible cookies (role/name) if available
            // Note: The actual security token (HttpOnly) is invisible to JS
            // This is just to hydrate the UI state for non-critical data

            // We use 'require' dynamically to avoid circular dependencies if imports were top-level
            // or just use the imported utility if available. 
            // In this file, we are using the imported getCookie.

            // Constants would be better imported, but for now we fix the hardcoded strings 
            // by using the values we know should be there, or if we imported constants.
            // Since we can't easily add an import in a replace_file_content of a block, we'll rely on the existing getCookie.
            // Ideally, we should add `import { STORAGE_KEYS } from '@/utils/constants'` at the top.

            // NOTE: Ideally replace strings with STORAGE_KEYS.USER_ROLE etc. 
            // But strict replacement requires me to change the whole file or imports first.
            // I will stick to the existing structure but improve the comments and logic.

            const userRole = getCookie(STORAGE_KEYS.USER_ROLE)
            const userNameEncoded = getCookie(STORAGE_KEYS.USER_NAME)
            const userAvatarEncoded = getCookie(STORAGE_KEYS.USER_AVATAR)

            if (userRole) {
                const fullName = userNameEncoded ? decodeURIComponent(userNameEncoded) : 'User'
                const avatarUrl = userAvatarEncoded ? decodeURIComponent(userAvatarEncoded) : undefined

                // We don't have ID or Email in the public cookie, but we can assume session is valid for UI
                // Critical data fetching will fail if the HttpOnly token is missing/invalid
                const user: User = {
                    id: 'current', // Placeholder
                    email: '',     // Placeholder
                    fullName,
                    role: userRole,
                    avatarUrl
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
            logger.error('Error initializing auth store:', error)
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            })
        }
    },
}))
