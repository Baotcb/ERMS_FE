// ── Match backend CandidateApplicationDto (GET /api/applications/my-applications) ──
export interface CandidateApplicationDto {
    applicationId: string
    jobPostingId: string
    jobTitle: string
    jobCode?: string
    companyName?: string
    location?: string
    employmentType: string
    stage: ApplicationStage
    status: string
    appliedAt: string
    stageUpdatedAt?: string
    hasInterview: boolean
    hasOffer: boolean
}

export interface GetMyApplicationsResponse {
    items: CandidateApplicationDto[]
    totalCount: number
    pageNumber: number
    pageSize: number
}

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

// Match backend CVScreeningResultSummary exactly
export interface CVScreeningResult {
    overallScore: number
    skillMatchScore: number
    experienceMatchScore: number
    educationMatchScore: number
    matchedSkills: string[]
    missingSkills: string[]
    strengths: string[]
    summary: string
}

// Match backend SubmitApplicationCommand exactly
export interface CreateApplicationRequest {
    jobId: string
    cvFile: File
    coverLetter?: string
    expectedSalary?: number
    availableStartDate?: string
}

export interface ApplicationHistoryParams {
    pageNumber?: number
    pageSize?: number
    stageFilter?: string
}

export interface WithdrawApplicationRequest {
    reason?: string
}
