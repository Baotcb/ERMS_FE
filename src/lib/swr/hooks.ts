import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { mutate as swrMutate } from 'swr'
import type { SWRConfiguration } from 'swr'

export type Key = string | readonly unknown[] | null | undefined

export interface Fetcher<T> {
    (url: string | readonly unknown[]): Promise<T>
}

export interface UseDataConfig<T> extends SWRConfiguration {
    fetcher?: Fetcher<T>
}

// Generic SWR hook
export function useData<T>(
    key: Key,
    config?: UseDataConfig<T>
) {
    const fetcherFn = config?.fetcher as Fetcher<T>
    return useSWR<T>(
        key,
        fetcherFn,
        config
    )
}

// Hook for mutation
export function useMutation<T, D = unknown>(
    key: Key,
    mutationFetcher: (data: D) => Promise<T>,
    options?: {
        onSuccess?: (data: T, variables: D) => void
        onError?: (error: Error, variables: D) => void
    }
) {
    return useSWRMutation<T, Error, Key, D>(
        key,
        (_key: Key, { arg }: { arg: D }) => mutationFetcher(arg),
        {
            onSuccess: options?.onSuccess
                ? (data, key, config) => options.onSuccess!(data, (config as { arg: D }).arg)
                : undefined,
            onError: options?.onError
                ? (error, key, config) => options.onError!(error, (config as { arg: D }).arg)
                : undefined,
            throwOnError: false,
        }
    )
}

// Re-export mutate
export const mutate = swrMutate
