export const DEFAULT_SWR_CONFIG = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 10000,
    errorRetryCount: 1, // API client (fetchWithRetry) already retries → avoid double retry
    errorRetryInterval: 3000,
    keepPreviousData: true,
    refreshInterval: 0,
} as const
