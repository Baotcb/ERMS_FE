import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole, AuthResponse, LoginCredentials, RegisterData, ResetPasswordData } from '@/types'
import type { AuthResponse as ApiAuthResponse } from '@/lib/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  register: (data: RegisterData) => Promise<AuthResponse>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
  logout: () => void
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      login: async (credentials): Promise<AuthResponse> => {
        set({ isLoading: true, error: null })
        try {
          const { authService } = await import('@/lib/auth')
          const apiResponse = await authService.login(credentials) as ApiAuthResponse
          if (apiResponse.token) {
            // Get user data from JWT (already extracted and stored by authService)
            const currentUser = authService.getCurrentUser()
            if (currentUser) {
              const mappedUser: User = {
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                role: currentUser.role as UserRole,
                fullName: currentUser.fullName
              }
              set({
                user: mappedUser,
                token: apiResponse.token,
                isAuthenticated: true,
                isLoading: false
              })
            }
          }
          // Convert ApiAuthResponse to AuthResponse
          const response: AuthResponse = {
            ...apiResponse,
            user: apiResponse.user ? {
              id: apiResponse.user.id,
              name: apiResponse.user.fullName,
              email: apiResponse.user.email,
              role: apiResponse.user.role as UserRole,
              fullName: apiResponse.user.fullName
            } : undefined
          }
          return response
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      register: async (data): Promise<AuthResponse> => {
        set({ isLoading: true, error: null })
        try {
          const { authService } = await import('@/lib/auth')
          const response = await authService.register(data) as ApiAuthResponse
          // Convert ApiAuthResponse to AuthResponse
          const convertedResponse: AuthResponse = {
            ...response,
            user: response.user ? {
              id: response.user.id,
              name: response.user.fullName,
              email: response.user.email,
              role: response.user.role as UserRole,
              fullName: response.user.fullName
            } : undefined
          }
          set({ isLoading: false })
          return convertedResponse
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null })
        try {
          const { authService } = await import('@/lib/auth')
          await authService.forgotPassword(email)
          set({ isLoading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      resetPassword: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const { authService } = await import('@/lib/auth')
          await authService.resetPassword({
            email: data.email,
            token: data.token,
            newPassword: data.newPassword
          })
          set({ isLoading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to reset password'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      logout: () => {
        const { authService } = require('@/lib/auth')
        authService.logout()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
