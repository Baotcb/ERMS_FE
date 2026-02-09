// Application Stage
export type ApplicationStage =
    | 'Applied'
    | 'Reviewing'
    | 'Shortlisted'
    | 'InterviewScheduled'
    | 'Interviewed'
    | 'Offered'
    | 'Hired'
    | 'Rejected'
    | 'Withdrawn'

// CV Screening Result
export interface CVScreeningResult {
    overallScore: number
    skillMatchScore: number
    experienceMatchScore: number
    educationMatchScore: number
    keywordMatchScore: number
    matchedSkills: string[]
    missingSkills: string[]
    strengths: string[]
    concerns: string[]
    summary: string
}

// Application DTO
export interface ApplicationDto {
    id: string
    jobPostingId: string
    candidateId: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string
    stage: ApplicationStage
    status: string
    appliedAt: string
    stageUpdatedAt: string
    cvUrl: string
    hrNote?: string
    rejectionReason?: string
    cvScreeningResult?: CVScreeningResult
}

// Paginated Response
export interface ApplicationsResponse {
    data: ApplicationDto[]
    totalCount: number
    pageNumber: number
    pageSize: number
    totalPages: number
}

// Forward Request
export interface ForwardApplicationRequest {
    hrNote?: string
}
