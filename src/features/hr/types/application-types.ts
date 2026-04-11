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
    candidateId: string | null
    candidateName: string
    candidateEmail: string
    candidatePhone?: string
    stage: ApplicationStage
    status: string
    appliedAt: string
    cvUrl: string
    hrNote?: string
    isExternal?: boolean
    source?: string
    cvScreeningResult?: CVScreeningResult
}

// Extracted CV info from HR-uploaded CV
export interface ExtractedCvInfo {
    resumeUrl: string
    resumePublicId: string
    fullName?: string
    email?: string
    phone?: string
    resumeText: string
}

// Request to add external candidate application
export interface AddExternalApplicationRequest {
    jobPostingId: string
    candidateName: string
    candidateEmail: string
    candidatePhone?: string
    resumeUrl: string
    resumeText: string
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

export interface RejectApplicationRequest {
    rejectionReason: string
}
