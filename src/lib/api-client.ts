/**
 * API Client
 * centralized fetch wrapper with timeout, retries, and error handling
 */

import { config } from '@/config'

interface RequestOptions extends RequestInit {
    timeout?: number
    retries?: number
}

const DEFAULT_TIMEOUT = 15000
const DEFAULT_RETRIES = 1

async function fetchWithRetry(url: string, options: RequestOptions = {}): Promise<Response> {
    const { timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES, ...fetchOptions } = options

    // Ensure we use the configured base URL if the URL is relative
    const baseUrl = config.apiUrl
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`

    let attempt = 0
    let lastError: unknown

    while (attempt <= retries) {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), timeout)

        try {
            const response = await fetch(fullUrl, {
                ...fetchOptions,
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
    post: (url: string, body: unknown, options?: RequestOptions) => fetchWithRetry(url, { ...options, method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...options?.headers } }),
    put: (url: string, body: unknown, options?: RequestOptions) => fetchWithRetry(url, { ...options, method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...options?.headers } }),
    delete: (url: string, options?: RequestOptions) => fetchWithRetry(url, { ...options, method: 'DELETE' }),
    patch: (url: string, body: unknown, options?: RequestOptions) => fetchWithRetry(url, { ...options, method: 'PATCH', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...options?.headers } }),
}
