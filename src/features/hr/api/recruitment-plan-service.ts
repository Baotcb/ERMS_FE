import { apiClient } from '@/lib/api-client'
import {
    RecruitmentPlan,
    GetRecruitmentPlansParams,
    PaginatedResult,
    CreateRecruitmentPlanRequest,
    UpdateRecruitmentPlanRequest
} from '../types/recruitment-plan-types'

// Types (re-exported or imported)

export async function getRecruitmentPlans(params: GetRecruitmentPlansParams, token?: string): Promise<PaginatedResult<RecruitmentPlan>> {
    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 20),
    })

    if (params.search) searchParams.set('search', params.search)
    if (params.status) searchParams.set('status', params.status)
    if (params.campaignId) searchParams.set('campaignId', params.campaignId)
    if (params.departmentId) searchParams.set('departmentId', String(params.departmentId))

    const headers: HeadersInit = {}
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await apiClient.get(`/api/RecruitmentPlans?${searchParams}`, {
        headers,
    })

    if (!response.ok) {
        throw new Error('Không thể tải danh sách kế hoạch tuyển dụng')
    }

    const text = await response.text()
    if (!text) return { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }

    return JSON.parse(text)
}

export async function getRecruitmentPlanById(id: string): Promise<RecruitmentPlan> {
    const response = await apiClient.get(`/api/RecruitmentPlans/${id}`, {
        // cache: 'no-store' is handled by Next.js fetch defaults usually, or passing request init
        // apiClient passes options to fetch, so cache: 'no-store' works if passed
        cache: 'no-store'
    })

    if (!response.ok) {
        throw new Error('Không thể tải thông tin kế hoạch tuyển dụng')
    }

    return response.json()
}

export async function createRecruitmentPlan(data: CreateRecruitmentPlanRequest): Promise<{ recruitmentPlanId: string }> {
    const response = await apiClient.post(`/api/RecruitmentPlans`, data)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể tạo kế hoạch tuyển dụng')
    }

    return response.json()
}

export async function updateRecruitmentPlan(id: string, data: UpdateRecruitmentPlanRequest): Promise<void> {
    const response = await apiClient.put(`/api/RecruitmentPlans/${id}`, data)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể cập nhật kế hoạch tuyển dụng')
    }
}

export async function deleteRecruitmentPlan(id: string): Promise<void> {
    const response = await apiClient.delete(`/api/RecruitmentPlans/${id}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể xóa kế hoạch tuyển dụng')
    }
}
