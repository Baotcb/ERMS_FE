import useSWR, { SWRConfiguration, mutate, Key, Fetcher } from 'swr'
import { useCallback, useState } from 'react'
import type { SWRMutationConfiguration } from 'swr/mutation'

// Global SWR configuration with caching
const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000, // Deduplicate requests within 5 seconds
    errorRetryCount: 3,
    errorRetryInterval: 5000,
}

// Fetcher function with error handling
export async function fetcher<T>(url: string): Promise<T> {
    let authToken = ''
    if (typeof window !== 'undefined') {
        authToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth_token='))
            ?.split('=')[1] || ''
    }

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { Authorization: `Bearer ${authToken}` })
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        try {
            const errorJson = JSON.parse(errorText)
            throw new Error(errorJson.message || errorText || 'Lỗi không xác định')
        } catch {
            throw new Error(errorText || 'Lỗi không xác định')
        }
    }

    return response.json()
}

// Fetcher for POST requests
export async function postFetcher<T>(url: string, data: any): Promise<T> {
    let authToken = ''
    if (typeof window !== 'undefined') {
        authToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth_token='))
            ?.split('=')[1] || ''
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { Authorization: `Bearer ${authToken}` })
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const errorText = await response.text()
        try {
            const errorJson = JSON.parse(errorText)
            throw new Error(errorJson.message || errorText || 'Lỗi không xác định')
        } catch {
            throw new Error(errorText || 'Lỗi không xác định')
        }
    }

    return response.json()
}

export interface UseDataConfig<T> extends SWRConfiguration {
    fetcher?: Fetcher<T>
}

// Generic SWR hook
export function useData<T>(
    key: Key,
    config?: UseDataConfig<T>
) {
    const fetcherFn = config?.fetcher || fetcher as unknown as Fetcher<T>
    return useSWR<T>(
        key,
        fetcherFn,
        { ...swrConfig, ...config }
    )
}

// Hook for paginated data
export function usePaginatedData<T>(
    key: Key,
    config?: UseDataConfig<T>
) {
    const fetcherFn = config?.fetcher || fetcher as unknown as Fetcher<T>
    const swr = useSWR<T>(
        key,
        fetcherFn,
        { ...swrConfig, ...config }
    )

    return {
        ...swr,
        data: swr.data,
        isLoading: !swr.error && !swr.data,
    }
}

// Hook for mutation
export function useMutation<T, D = any>(
    key: Key,
    mutationFetcher: (data: D) => Promise<T>,
    options?: {
        onSuccess?: (data: T, variables: D) => void
        onError?: (error: Error, variables: D) => void
    }
) {
    const [isMutating, setIsMutating] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const trigger = useCallback(
        async (data: D) => {
            setIsMutating(true)
            setError(null)

            try {
                const result = await mutationFetcher(data)

                // Update cache with real data
                if (key) {
                    // For array keys or string keys, mutate works same way
                    mutate(key as any, result)
                }

                options?.onSuccess?.(result, data)
                return result
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Lỗi không xác định')
                setError(error)
                options?.onError?.(error, data)
                throw error
            } finally {
                setIsMutating(false)
            }
        },
        [key, mutationFetcher, options]
    )

    return { trigger, isMutating, error }
}

// Prefetch data for navigation
export function prefetchData(key: string) {
    if (typeof window !== 'undefined') {
        mutate(key, fetcher(key), { revalidate: false })
    }
}

// Revalidate multiple keys
export function revalidateKeys(keys: Key[]) {
    keys.forEach(key => mutate(key))
}
