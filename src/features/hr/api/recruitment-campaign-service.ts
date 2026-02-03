import { apiClient } from '@/lib/api-client'
import {
    RecruitmentCampaign,
    GetRecruitmentCampaignsParams,
    PaginatedResult,
    CreateRecruitmentCampaignRequest,
    UpdateRecruitmentCampaignRequest
} from '../types/recruitment-campaign-types'

export async function getRecruitmentCampaigns(params: GetRecruitmentCampaignsParams, token?: string): Promise<PaginatedResult<RecruitmentCampaign>> {
    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 20),
    })

    if (params.search) searchParams.set('search', params.search)
    if (params.status) searchParams.set('status', params.status)

    const headers: HeadersInit = {}
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await apiClient.get(`/api/recruitment-campaigns?${searchParams}`, {
        headers,
    })

    if (!response.ok) {
        throw new Error('Không thể tải danh sách chiến dịch tuyển dụng')
    }

    const text = await response.text()
    if (!text) return { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }

    return JSON.parse(text)
}

export async function getRecruitmentCampaignById(id: string, token?: string): Promise<RecruitmentCampaign> {
    const headers: HeadersInit = {}
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await apiClient.get(`/api/recruitment-campaigns/${id}`, {
        headers,
        cache: 'no-store'
    })

    if (!response.ok) {
        throw new Error('Không thể tải thông tin chiến dịch tuyển dụng')
    }

    return response.json()
}

export async function createRecruitmentCampaign(data: CreateRecruitmentCampaignRequest): Promise<{ campaignId: string }> {
    const response = await apiClient.post(`/api/recruitment-campaigns`, data)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể tạo chiến dịch tuyển dụng')
    }

    return response.json()
}

export async function updateRecruitmentCampaign(id: string, data: UpdateRecruitmentCampaignRequest): Promise<void> {
    const response = await apiClient.put(`/api/recruitment-campaigns/${id}`, data)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể cập nhật chiến dịch tuyển dụng')
    }
}

export async function updateRecruitmentCampaignStatus(id: string, status: string): Promise<void> {
    const response = await apiClient.put(`/api/recruitment-campaigns/${id}/status`, { newStatus: status })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể cập nhật trạng thái chiến dịch')
    }
}

export async function deleteRecruitmentCampaign(id: string): Promise<void> {
    const response = await apiClient.delete(`/api/recruitment-campaigns/${id}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể xóa chiến dịch tuyển dụng')
    }
}
