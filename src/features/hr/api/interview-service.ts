import { apiClient } from '@/lib/api-client'
import type {
    ConfirmScheduleRequest,
    ConfirmScheduleResult,
    GetAllInterviewsResponse,
} from '../types/interview-types'

const APPLICATIONS_URL = '/api/applications'

// ===== GET all interviews (HR/Director) =====
// Backend: GET /api/applications/all-interviews?pageNumber=1&pageSize=20&statusFilter=...
export async function getAllInterviews(params?: {
    pageNumber?: number
    pageSize?: number
    statusFilter?: string
}): Promise<GetAllInterviewsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pageNumber) searchParams.set('pageNumber', String(params.pageNumber))
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize))
    if (params?.statusFilter) searchParams.set('statusFilter', params.statusFilter)

    const qs = searchParams.toString()
    const url = `${APPLICATIONS_URL}/all-interviews${qs ? `?${qs}` : ''}`

    const response = await apiClient.get(url)
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message || 'Không thể tải danh sách phỏng vấn')
    }
    return response.json()
}

// ===== POST confirm schedule =====
// Backend: POST /api/applications/confirm-schedule
// Quyền: HRManager ONLY
export async function confirmSchedule(
    data: ConfirmScheduleRequest
): Promise<ConfirmScheduleResult> {
    const response = await apiClient.post(`${APPLICATIONS_URL}/confirm-schedule`, data)
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message || 'Không thể xác nhận lịch phỏng vấn')
    }
    const result = await response.json()
    return result.data ?? result
}
