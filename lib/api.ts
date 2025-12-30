// API Base Configuration
// Use proxy in development to avoid CORS issues
const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? '/api/proxy'
  : (process.env.NEXT_PUBLIC_API_URL || 'https://ermsbe-dcbtdfezebashgb7.southeastasia-01.azurewebsites.net')

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

export class ApiException extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiException'
    this.status = status
    this.errors = errors
  }
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  // Add auth token if exists
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      }
    }
  }

  try {
    const response = await fetch(url, config)
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new ApiException(
          'Server error occurred',
          response.status
        )
      }
      return {} as T
    }

    const data = await response.json()

    if (!response.ok) {
      throw new ApiException(
        data.message || data.title || 'An error occurred',
        response.status,
        data.errors
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiException) {
      throw error
    }
    
    if (error instanceof Error) {
      throw new ApiException(
        error.message || 'Network error occurred',
        0
      )
    }
    
    throw new ApiException('An unknown error occurred', 0)
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
}