export const DEFAULT_SWR_CONFIG = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    keepPreviousData: true,
    refreshInterval: 0,
} as const
