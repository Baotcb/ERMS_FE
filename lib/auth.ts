import { api, ApiException } from './api'

// Auth Types based on your API
export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  role?: string
}

export interface AuthResponse {
  token?: string
  user?: {
    id: string
    email: string
    fullName: string
    role: string
  }
  message?: string
  success?: boolean
  userId?: string
}

export interface JWTPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string
  exp: number
  iss: string
  aud: string
}

/**
 * Decode JWT token without verification (client-side only)
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Extract user info from JWT token
 */
function extractUserFromToken(token: string) {
  const payload = decodeJWT(token)
  if (!payload) return null

  return {
    id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
    name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
    email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
    role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    fullName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
  }
}

// Auth Service
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

  async forgotPassword(data: ForgotPasswordRequest): Promise<string> {
    try {
      const response = await api.post<string>(
        '/api/Auth/forgot-password',
        data
      )
      return response
    } catch (error) {
      if (error instanceof ApiException){
        throw error
      }
      throw new ApiException('fail to execute', 0)
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
