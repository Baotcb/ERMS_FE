import { apiClient } from '@/lib/api-client'
import type {
    ApplicationDto,
    ApplicationsResponse,
    ForwardApplicationRequest,
    CVScreeningResult,
} from '../types/application-types'

const BASE_URL = '/api/applications'

/**
 * BE Response shape (flat fields from ApplicationListDto):
 *   applicationId, candidateId, candidateName, candidateEmail, candidatePhone,
 *   resumeUrl, stage, status, appliedAt, hrNote,
 *   overallScore?, skillMatchScore?, experienceMatchScore?, educationMatchScore?,
 *   keywordMatchScore?, matchedSkills?: string[], missingSkills?: string[],
 *   strengths?: string[], concerns?: string[], aiSummary?
 */
interface BEApplicationItem {
    applicationId: string
    candidateId: string
    candidateName: string
    candidateEmail?: string
    candidatePhone?: string
    resumeUrl?: string
    stage: string
    status: string
    appliedAt: string
    hrNote?: string
    overallScore?: number
    skillMatchScore?: number
    experienceMatchScore?: number
    educationMatchScore?: number
    keywordMatchScore?: number
    matchedSkills?: string[]
    missingSkills?: string[]
    strengths?: string[]
    concerns?: string[]
    aiSummary?: string
}

function mapCvScreeningResult(item: BEApplicationItem): CVScreeningResult | undefined {
    // CV scoring chạy background → overallScore có thể null khi chưa xong
    if (item.overallScore == null) return undefined

    return {
        overallScore: item.overallScore,
        skillMatchScore: item.skillMatchScore,
        experienceMatchScore: item.experienceMatchScore,
        educationMatchScore: item.educationMatchScore,
        keywordMatchScore: item.keywordMatchScore,
        matchedSkills: item.matchedSkills ?? [],
        missingSkills: item.missingSkills ?? [],
        strengths: item.strengths ?? [],
        concerns: item.concerns ?? [],
        summary: item.aiSummary ?? '',
    }
}

// Get applications by job posting
// Backend: GET /api/applications/job/{jobPostingId}?pageNumber=&pageSize=&stageFilter=
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

    return {
        jobPostingId: result.jobPostingId || jobPostingId,
        jobTitle: result.jobTitle || '',
        data: (result.items || []).map((item: BEApplicationItem): ApplicationDto => ({
            id: item.applicationId,
            jobPostingId: jobPostingId,
            candidateId: item.candidateId,
            candidateName: item.candidateName,
            candidateEmail: item.candidateEmail || '',
            candidatePhone: item.candidatePhone,
            stage: item.stage as ApplicationDto['stage'],
            status: item.status,
            appliedAt: item.appliedAt,
            cvUrl: item.resumeUrl || '',
            hrNote: item.hrNote,
            cvScreeningResult: mapCvScreeningResult(item),
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
