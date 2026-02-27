// Application Stage — khớp 100% với BE ApplicationStage constants
export type ApplicationStage =
    | 'Applied'
    | 'Reviewing'
    | 'Shortlisted'
    | 'InterviewScheduled'
    | 'Interviewed'
    | 'OfferProcessing'
    | 'Offered'
    | 'Hired'
    | 'Rejected'
    | 'Withdrawn'

// CV Screening Result — khớp với BE ApplicationListDto (flat fields → grouped)
export interface CVScreeningResult {
    overallScore: number
    skillMatchScore?: number
    experienceMatchScore?: number
    educationMatchScore?: number
    keywordMatchScore?: number
    matchedSkills: string[]
    missingSkills: string[]
    strengths: string[]
    concerns: string[]
    summary: string
}

// Application DTO — khớp với BE ApplicationListDto
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
    cvUrl: string
    hrNote?: string
    cvScreeningResult?: CVScreeningResult
}

// Paginated Response — khớp với BE GetApplicationsByJobResponse
export interface ApplicationsResponse {
    jobPostingId: string
    jobTitle: string
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
