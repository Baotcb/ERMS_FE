import { apiClient } from '@/lib/api-client'
import type {
    CreateApplicationRequest,
    CVScreeningResult,
    GetMyApplicationsResponse,
    ApplicationHistoryParams,
    WithdrawApplicationRequest,
} from '../types/application-types'

const BASE_URL = '/api/applications'

export interface CreateApplicationResponse {
    message: string
    data: {
        applicationId: string
        resumeId: string
        resumeUrl: string
        stage: string
        appliedAt: string
        cvScreeningResult?: CVScreeningResult
    }
}

// Match backend SubmitApplicationCommand: JobPostingId, CvFile, CoverLetter, ExpectedSalary, AvailableStartDate
export async function createApplication(data: CreateApplicationRequest): Promise<CreateApplicationResponse> {
    const formData = new FormData()
    formData.append('JobPostingId', data.jobId)
    formData.append('CvFile', data.cvFile)

    if (data.coverLetter) formData.append('CoverLetter', data.coverLetter)
    if (data.expectedSalary != null) formData.append('ExpectedSalary', data.expectedSalary.toString())
    if (data.availableStartDate) formData.append('AvailableStartDate', data.availableStartDate)

    // Upload CV + AI processing nên backend cần thời gian xử lý (upload Cloudinary + parse PDF)
    const response = await apiClient.post(BASE_URL, formData, { timeout: 120000 })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }))
        throw new Error(error.message || 'Không thể gửi đơn ứng tuyển')
    }

    return response.json()
}

// GET /api/applications/my-applications — Candidate's own application history
export async function getMyApplications(params?: ApplicationHistoryParams): Promise<GetMyApplicationsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pageNumber) searchParams.set('pageNumber', params.pageNumber.toString())
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
    if (params?.stageFilter) searchParams.set('stageFilter', params.stageFilter)

    const qs = searchParams.toString()
    const url = `${BASE_URL}/my-applications${qs ? `?${qs}` : ''}`

    const response = await apiClient.get(url)

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }))
        throw new Error(error.message || 'Không thể lấy danh sách ứng tuyển')
    }

    return response.json()
}

// Withdraw application
// Backend: PATCH /api/applications/withdraw — { applicationId, reason? } in body
export async function withdrawApplication(
    applicationId: string,
    data?: WithdrawApplicationRequest
): Promise<void> {
    const response = await apiClient.patch(`${BASE_URL}/withdraw`, {
        applicationId,
        reason: data?.reason,
    })
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }))
        throw new Error(error.message || 'Không thể rút đơn ứng tuyển')
    }
}
