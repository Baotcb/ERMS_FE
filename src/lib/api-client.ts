/**
 * API Client
 * centralized fetch wrapper with timeout, retries, and error handling
 */

import { config } from '@/config'

interface RequestOptions extends RequestInit {
    timeout?: number
    retries?: number
}

const DEFAULT_TIMEOUT = 30000
const DEFAULT_RETRIES = 1

async function fetchWithRetry(url: string, options: RequestOptions = {}): Promise<Response> {
    const { timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES, ...fetchOptions } = options

    const baseUrl = config.apiUrl
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`

    // Get CSRF token from cookie if available
    const csrfCookieName = process.env.NODE_ENV === 'production' ? '__Host-csrf-token' : 'csrf-token'
    const csrfMatch = typeof document !== 'undefined'
        ? document.cookie.split('; ').find(row => row.startsWith(`${csrfCookieName}=`))
        : undefined
    const csrfToken = csrfMatch ? csrfMatch.substring(csrfCookieName.length + 1) : undefined

    const headers = new Headers(fetchOptions.headers || {})
    if (csrfToken) {
        headers.set('x-csrf-token', csrfToken)
    }

    // Explicitly set headers in fetchOptions to override/merge
    // We need to convert Headers back to object or pass as Headers object
    // fetch supports Headers object

    // Merge existing headers
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
        // Default content type if not FormData
        // But let methods handle it
    }

    let attempt = 0
    let lastError: unknown

    while (attempt <= retries) {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), timeout)

        try {
            const response = await fetch(fullUrl, {
                ...fetchOptions,
                headers, // Use our headers with CSRF token
                credentials: 'include', // Ensure cookies are sent with requests
                signal: controller.signal,
            })
            clearTimeout(id)

            // Retry on 5xx server errors
            if (response.status >= 500 && attempt < retries) {
                attempt++
                // Exponential backoff
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
                continue
            }

            return response
        } catch (error: unknown) {
            clearTimeout(id)
            lastError = error

            // Don't retry if aborted (timeout)
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new Error(`Request timeout after ${timeout}ms`)
            }

            if (attempt < retries) {
                attempt++
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
                continue
            }
        }

        attempt++
    }

    throw lastError || new Error('Request failed after max retries')
}

export const apiClient = {
    get: (url: string, options?: RequestOptions) => fetchWithRetry(url, { ...options, method: 'GET' }),
    post: (url: string, body: unknown, options?: RequestOptions) => {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
        return fetchWithRetry(url, {
            ...options,
            method: 'POST',
            body: isFormData ? (body as BodyInit) : JSON.stringify(body),
            headers: {
                ...(!isFormData && { 'Content-Type': 'application/json' }),
                ...options?.headers
            }
        })
    },
    put: (url: string, body: unknown, options?: RequestOptions) => {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
        return fetchWithRetry(url, {
            ...options,
            method: 'PUT',
            body: isFormData ? (body as BodyInit) : JSON.stringify(body),
            headers: {
                ...(!isFormData && { 'Content-Type': 'application/json' }),
                ...options?.headers
            }
        })
    },
    delete: (url: string, options?: RequestOptions) => fetchWithRetry(url, { ...options, method: 'DELETE' }),
    patch: (url: string, body: unknown, options?: RequestOptions) => {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
        const headers = {
            ...options?.headers,
        } as Record<string, string>

        if (!isFormData) {
            headers['Content-Type'] = 'application/json'
        }

        return fetchWithRetry(url, {
            ...options,
            method: 'PATCH',
            body: isFormData ? (body as BodyInit) : JSON.stringify(body),
            headers
        })
    },
}
