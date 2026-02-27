import { apiClient } from '@/lib/api-client'
import type {
    ShortlistedResponse,
    AssignInterviewerRequest,
    AssignInterviewerResult,
    SubmitFeedbackRequest,
    SubmitFeedbackResult,
    SubmitFinalDecisionRequest,
    SubmitFinalDecisionResult,
} from '../types/interview-types'

const APPLICATIONS_URL = '/api/applications'
const PLAN_DETAILS_URL = '/api/plan-details'

// ===== GET shortlisted candidates =====
// Backend: GET /api/plan-details/{planDetailId}/shortlisted
export async function getShortlistedApplications(
    planDetailId: string,
    params?: { pageNumber?: number; pageSize?: number }
): Promise<ShortlistedResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pageNumber) searchParams.set('pageNumber', String(params.pageNumber))
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize))

    const response = await apiClient.get(
        `${PLAN_DETAILS_URL}/${planDetailId}/shortlisted?${searchParams}`
    )
    if (!response.ok) throw new Error('Không thể tải danh sách ứng viên sơ tuyển')
    return response.json()
}

// ===== POST assign interviewer =====
// Backend: POST /api/applications/assign-interviewer
export async function assignInterviewer(
    data: AssignInterviewerRequest
): Promise<AssignInterviewerResult> {
    const response = await apiClient.post(`${APPLICATIONS_URL}/assign-interviewer`, data)
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message || 'Không thể phân công người phỏng vấn')
    }
    const result = await response.json()
    return result.data ?? result
}


// ===== POST submit interview feedback =====
// Backend: POST /api/applications/submit-interview-feedback
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

// ===== POST submit final decision =====
// Backend: POST /api/applications/submit-final-decision
export async function submitFinalDecision(
    data: SubmitFinalDecisionRequest
): Promise<SubmitFinalDecisionResult> {
    const response = await apiClient.post(`${APPLICATIONS_URL}/submit-final-decision`, data)
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message || 'Không thể gửi quyết định')
    }
    const result = await response.json()
    return result.data ?? result
}
