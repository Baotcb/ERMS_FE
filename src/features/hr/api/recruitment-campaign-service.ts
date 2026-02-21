import { apiClient } from '@/lib/api-client'
import {
    RecruitmentCampaign,
    GetRecruitmentCampaignsParams,
    PaginatedResult,
    CreateRecruitmentCampaignRequest,
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
        console.error('getRecruitmentCampaigns failed:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            text: await response.text()
        })
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
        const text = await response.text()
        let errorMessage = 'Không thể tạo chiến dịch tuyển dụng'
        try {
            const error = JSON.parse(text)
            if (error.message) errorMessage = error.message
        } catch {
            console.error('Failed to parse error response:', text)
        }
        throw new Error(errorMessage)
    }

    return response.json()
}

// ⚠️ Backend KHÔNG CÓ route PUT /{id} cho update campaign
// Chỉ có PUT /status để đổi trạng thái
// export async function updateRecruitmentCampaign() → REMOVED (route không tồn tại)

// PUT /api/recruitment-campaigns/status - Cập nhật trạng thái chiến dịch
export async function updateRecruitmentCampaignStatus(id: string, status: string): Promise<void> {
    const response = await apiClient.put(`/api/recruitment-campaigns/status`, { id, newStatus: status })

    if (!response.ok) {
        const text = await response.text()
        let errorMessage = 'Không thể cập nhật trạng thái chiến dịch'
        try {
            const error = JSON.parse(text)
            if (error.message) errorMessage = error.message
        } catch {
            console.error('Failed to parse error response:', text)
        }
        throw new Error(errorMessage)
    }
}

// ⚠️ Backend KHÔNG CÓ route DELETE /{id} cho xóa campaign
// export async function deleteRecruitmentCampaign() → REMOVED (route không tồn tại)
