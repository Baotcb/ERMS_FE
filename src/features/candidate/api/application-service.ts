import { apiClient } from '@/lib/api-client'
import { CreateApplicationRequest, CVScreeningResult } from '../types/application-types'

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

    const response = await apiClient.post(BASE_URL, formData)

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }))
        throw new Error(error.message || 'Không thể gửi đơn ứng tuyển')
    }

    return response.json()
}

// ⚠️ Backend CHƯA CÓ endpoint getApplications và getApplicationById cho Candidate
