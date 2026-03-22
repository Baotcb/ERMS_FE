import { useData, type Fetcher } from '@/lib/swr/hooks'
import { apiClient } from '@/lib/api-client'

export interface EnterpriseInfo {
    logoUrl: string
    enterpriseName: string
}

// Uses centralized useData() hook → inherits DEFAULT_SWR_CONFIG
// (revalidateOnFocus: false, dedupingInterval: 10000, etc.)
export function useEnterpriseInfo() {
    const fetcher: Fetcher<EnterpriseInfo> = async (url) => {
        const response = await apiClient.get(url as string)
        if (!response.ok) {
            throw new Error('Failed to fetch enterprise info')
        }
        return response.json()
    }

    const { data, error, isLoading } = useData<EnterpriseInfo>(
        '/api/Enterprise/get-url-avata-enterprise',
        {
            fetcher,
            shouldRetryOnError: false,
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    )

    return {
        enterpriseInfo: data,
        isLoading,
        isError: error
    }
}
