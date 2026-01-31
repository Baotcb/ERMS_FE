import { config } from '@/config'
import {
    RecruitmentPlan,
    GetRecruitmentPlansParams,
    PaginatedResult,
    CreateRecruitmentPlanRequest,
    UpdateRecruitmentPlanRequest
} from '../types/recruitment-plan-types'

const API_BASE = config.apiUrl

async function getAuthHeaders(token?: string): Promise<HeadersInit> {
    let authToken = token || ''

    if (!authToken && typeof window !== 'undefined') {
        authToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth_token='))
            ?.split('=')[1] || ''
    }

    return {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
    }
}

export async function getRecruitmentPlans(params: GetRecruitmentPlansParams, token?: string): Promise<PaginatedResult<RecruitmentPlan>> {
    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 20),
    })

    if (params.search) searchParams.set('search', params.search)
    if (params.status) searchParams.set('status', params.status)

    const response = await fetch(`${API_BASE}/api/RecruitmentPlans?${searchParams}`, {
        headers: await getAuthHeaders(token),
        cache: 'no-store'
    })

    if (!response.ok) {
        throw new Error('Không thể tải danh sách kế hoạch tuyển dụng')
    }

    const text = await response.text()
    if (!text) return { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }

    return JSON.parse(text)
}

export async function getRecruitmentPlanById(id: string): Promise<RecruitmentPlan> {
    const response = await fetch(`${API_BASE}/api/RecruitmentPlans/${id}`, {
        headers: await getAuthHeaders(),
        cache: 'no-store'
    })

    if (!response.ok) {
        throw new Error('Không thể tải thông tin kế hoạch tuyển dụng')
    }

    return response.json()
}

export async function createRecruitmentPlan(data: CreateRecruitmentPlanRequest): Promise<{ recruitmentPlanId: string }> {
    const response = await fetch(`${API_BASE}/api/RecruitmentPlans`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể tạo kế hoạch tuyển dụng')
    }

    return response.json()
}

export async function updateRecruitmentPlan(id: string, data: UpdateRecruitmentPlanRequest): Promise<void> {
    const response = await fetch(`${API_BASE}/api/RecruitmentPlans/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể cập nhật kế hoạch tuyển dụng')
    }
}

export async function deleteRecruitmentPlan(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/RecruitmentPlans/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể xóa kế hoạch tuyển dụng')
    }
}
