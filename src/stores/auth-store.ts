import { create } from 'zustand'
import { validateToken, isTokenNearExpiry } from '@/lib/security'

export interface User {
    id: string
    email: string
    fullName?: string
    role?: string
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    tokenExpiryCheckInterval: NodeJS.Timeout | null

    // Actions
    login: (token: string, user: User, rememberMe?: boolean) => void
    logout: () => void
    updateUser: (userData: Partial<User>) => void
    initialize: () => void
    checkTokenExpiry: () => void
}

const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data',
} as const

const TOKEN_EXPIRY_CHECK_INTERVAL = 60000 // Check every minute

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    tokenExpiryCheckInterval: null,

    login: (token, user, rememberMe = false) => {
        const storage = rememberMe ? localStorage : sessionStorage

        // Validate token before storing
        const validation = validateToken(token)
        if (!validation.valid || validation.expired) {
            console.error('Invalid or expired token provided')
            return
        }

        // Clear other storage first to avoid duplicates/conflicts
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
        sessionStorage.removeItem(STORAGE_KEYS.USER)

        // Store in memory (most secure)
        // In production, use httpOnly cookies via server actions
        storage.setItem(STORAGE_KEYS.TOKEN, token)
        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

        set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
        })

        // Start token expiry check
        get().checkTokenExpiry()
    },

    logout: () => {
        // Clear interval
        const { tokenExpiryCheckInterval } = get()
        if (tokenExpiryCheckInterval) {
            clearInterval(tokenExpiryCheckInterval)
        }

        // Clear storage
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
        sessionStorage.removeItem(STORAGE_KEYS.USER)

        // Clear auth cookie
        if (typeof document !== 'undefined') {
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }

        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            tokenExpiryCheckInterval: null,
        })
    },

    updateUser: (userData) => {
        set((state) => {
            if (!state.user) return state

            const updatedUser = { ...state.user, ...userData }

            // Update in existing storage (whichever has the token)
            if (localStorage.getItem(STORAGE_KEYS.TOKEN)) {
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
            }
            if (sessionStorage.getItem(STORAGE_KEYS.TOKEN)) {
                sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
            }

            return { user: updatedUser }
        })
    },

    initialize: () => {
        try {
            // Check localStorage first (remember me)
            let token = localStorage.getItem(STORAGE_KEYS.TOKEN)
            let userData = localStorage.getItem(STORAGE_KEYS.USER)

            // Fall back to sessionStorage
            if (!token) {
                token = sessionStorage.getItem(STORAGE_KEYS.TOKEN)
                userData = sessionStorage.getItem(STORAGE_KEYS.USER)
            }

            if (token && userData) {
                // Validate token
                const validation = validateToken(token)

                if (!validation.valid || validation.expired) {
                    // Clear invalid/expired token
                    localStorage.removeItem(STORAGE_KEYS.TOKEN)
                    localStorage.removeItem(STORAGE_KEYS.USER)
                    sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
                    sessionStorage.removeItem(STORAGE_KEYS.USER)

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                    })
                } else {
                    const user = JSON.parse(userData) as User
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    })

                    // Start token expiry check
                    get().checkTokenExpiry()
                }
            } else {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                })
            }
        } catch (error) {
            // Clear corrupted data
            console.error('Error initializing auth store:', error)
            localStorage.removeItem(STORAGE_KEYS.TOKEN)
            localStorage.removeItem(STORAGE_KEYS.USER)
            sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
            sessionStorage.removeItem(STORAGE_KEYS.USER)

            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            })
        }
    },

    checkTokenExpiry: () => {
        const { token, tokenExpiryCheckInterval, logout } = get()

        // Clear existing interval
        if (tokenExpiryCheckInterval) {
            clearInterval(tokenExpiryCheckInterval)
        }

        if (!token) return

        // Set up new interval
        const interval = setInterval(() => {
            if (isTokenNearExpiry(token, 300)) {
                // Token near expiry (5 minutes) or expired
                logout()
            }
        }, TOKEN_EXPIRY_CHECK_INTERVAL)

        set({ tokenExpiryCheckInterval: interval })
    },
}))
