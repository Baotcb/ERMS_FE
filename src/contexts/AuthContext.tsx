'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/lib/auth'

interface User {
  id: string
  name: string
  email: string
  role: string
  fullName?: string
  phoneNumber?: string
  address?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken()
      if (token) {
        // Sync cookie if missing (for middleware compatibility)
        if (typeof window !== 'undefined') {
          const hasCookie = document.cookie.includes('token=')
          if (!hasCookie) {
            document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`
          }
        }

        try {
          const localUser = authService.getCurrentUser()

          // Set user from localStorage first for instant UI (no flicker)
          if (localUser) {
            setUser(localUser)
          }

          const profile = await authService.getProfile()

          setUser({
            id: localUser?.id || profile.userName,
            name: profile.userName,
            email: profile.email,
            role: localUser?.role || 'user',
            fullName: profile.fullName,
            phoneNumber: profile.phones,
            address: profile.hometown
          })
        } catch (error) {
          console.error('Failed to load user profile', error)
          // Fallback to local storage
          const localUser = authService.getCurrentUser()
          if (localUser) setUser(localUser)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    const token = authService.getToken()
    if (!token) return

    try {
      const localUser = authService.getCurrentUser()
      const profile = await authService.getProfile()

      setUser({
        id: localUser?.id || profile.userName,
        name: profile.userName,
        email: profile.email,
        role: localUser?.role || 'user',
        fullName: profile.fullName,
        phoneNumber: profile.phones,
        address: profile.hometown
      })
    } catch (error) {
      console.error('Failed to refresh user', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
