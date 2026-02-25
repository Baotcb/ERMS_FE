import { apiClient } from '@/lib/api-client'
import type {
    ApplicationDto,
    ApplicationsResponse,
    ForwardApplicationRequest
} from '../types/application-types'

const BASE_URL = '/api/applications'

// Get applications by job posting
export async function getApplicationsByJob(
    jobPostingId: string,
    params?: {
        pageNumber?: number
        pageSize?: number
        stageFilter?: string
    }
): Promise<ApplicationsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pageNumber) searchParams.set('pageNumber', String(params.pageNumber))
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize))
    if (params?.stageFilter) searchParams.set('stageFilter', params.stageFilter)

    const response = await apiClient.get(
        `${BASE_URL}/job/${jobPostingId}?${searchParams}`
    )
    if (!response.ok) throw new Error('Không thể tải danh sách ứng tuyển')
    const result = await response.json()
    // Map backend { items, applicationId, resumeUrl } → FE { data, id, cvUrl }
    return {
        data: (result.items || []).map((item: Record<string, unknown>) => ({
            id: item.applicationId,
            jobPostingId: jobPostingId,
            candidateId: item.candidateId,
            candidateName: item.candidateName,
            candidateEmail: item.candidateEmail || '',
            candidatePhone: item.candidatePhone,
            stage: item.stage,
            status: item.status,
            appliedAt: item.appliedAt,
            stageUpdatedAt: item.appliedAt,
            cvUrl: item.resumeUrl || '',
            hrNote: item.hrNote,
            cvScreeningResult: item.overallScore != null ? {
                overallScore: item.overallScore as number,
                skillMatchScore: item.skillMatchScore as number,
                experienceMatchScore: item.experienceMatchScore as number,
                educationMatchScore: 0,
                keywordMatchScore: 0,
                matchedSkills: [],
                missingSkills: [],
                strengths: [],
                concerns: [],
                summary: (item.aiSummary as string) || '',
            } : undefined,
        })),
        totalCount: result.totalCount || 0,
        pageNumber: result.pageNumber || 1,
        pageSize: result.pageSize || 20,
        totalPages: result.totalPages || 1,
    }
}

// Get application detail
export async function getApplicationById(id: string): Promise<ApplicationDto> {
    const response = await apiClient.get(`${BASE_URL}/${id}`)
    if (!response.ok) throw new Error('Không thể tải thông tin ứng tuyển')
    return response.json()
}

// Forward application to Dept Head
// Backend: PATCH /api/applications/forward — { applicationId, hrNote } in body
export async function forwardApplication(
    id: string,
    data: ForwardApplicationRequest
): Promise<ApplicationDto> {
    const response = await apiClient.patch(`${BASE_URL}/forward`, {
        applicationId: id,
        hrNote: data.hrNote,
    })
    if (!response.ok) throw new Error('Không thể chuyển hồ sơ')
    return response.json()
}
