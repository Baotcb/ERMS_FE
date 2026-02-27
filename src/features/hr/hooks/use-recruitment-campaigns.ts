import { useData, type Fetcher } from '@/lib/swr/hooks'
import { apiClient } from '@/lib/api-client'
import type {
    RecruitmentCampaign,
    GetRecruitmentCampaignsParams,
    PaginatedResult,
} from '../types/recruitment-campaign-types'

function serializeParams(params: GetRecruitmentCampaignsParams): string {
    return JSON.stringify(params)
}

export const campaignsKeys = {
    all: ['campaigns'] as const,
    lists: () => [...campaignsKeys.all, 'list'] as const,
    list: (params: GetRecruitmentCampaignsParams) => [...campaignsKeys.lists(), serializeParams(params)] as const,
}

async function fetchCampaigns([, , paramsString]: readonly [string, string, string]): Promise<PaginatedResult<RecruitmentCampaign>> {
    const params = JSON.parse(paramsString) as GetRecruitmentCampaignsParams

    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 7),
    })

    if (params.search) searchParams.set('search', params.search)
    if (params.status) searchParams.set('status', params.status)

    const response = await apiClient.get(`/api/recruitment-campaigns?${searchParams}`)

    if (!response.ok) {
        throw new Error('Không thể tải danh sách chiến dịch tuyển dụng')
    }

    const text = await response.text()
    if (!text) return { items: [], totalCount: 0, page: 1, pageSize: 7, totalPages: 0 }

    return JSON.parse(text)
}

export function useRecruitmentCampaigns(params: GetRecruitmentCampaignsParams = {}) {
    const key = campaignsKeys.list(params)

    const swr = useData<PaginatedResult<RecruitmentCampaign>>(key, {
        fetcher: fetchCampaigns as unknown as Fetcher<PaginatedResult<RecruitmentCampaign>>
    })

    return {
        ...swr,
        campaigns: swr.data?.items ?? [],
        totalCount: swr.data?.totalCount ?? 0,
        currentPage: swr.data?.page ?? 1,
        totalPages: swr.data?.totalPages ?? 1,
        isLoading: !swr.error && !swr.data,
    }
}
