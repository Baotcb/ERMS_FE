import { apiClient } from '@/lib/api-client'
import type { MyInterviewsResponse } from '../types/interview-types'
import type {
    SubmitFeedbackRequest,
    SubmitFeedbackResult,
} from '@/features/dept-head/types/interview-types'

const APPLICATIONS_URL = '/api/applications'

// ===== GET danh sách phỏng vấn của employee đang login =====
// Backend: GET /api/applications/my-interviews (CHƯA CÓ — cần tạo)
export async function getMyInterviews(
    params?: { pageNumber?: number; pageSize?: number; status?: string }
): Promise<MyInterviewsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pageNumber) searchParams.set('pageNumber', String(params.pageNumber))
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize))
    if (params?.status) searchParams.set('status', params.status)

    const response = await apiClient.get(
        `${APPLICATIONS_URL}/my-interviews?${searchParams}`
    )
    if (!response.ok) throw new Error('Không thể tải danh sách phỏng vấn')
    return response.json()
}

// ===== POST submit interview feedback =====
// Backend: POST /api/applications/submit-interview-feedback (ĐÃ CÓ)
// Quyền: Authenticated employee là participant của interview đó
export async function submitInterviewFeedback(
    data: SubmitFeedbackRequest
): Promise<SubmitFeedbackResult> {
    const response = await apiClient.post(`${APPLICATIONS_URL}/submit-interview-feedback`, data)
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message || 'Không thể gửi đánh giá')
    }
    const result = await response.json()
    return result.data ?? result
}
