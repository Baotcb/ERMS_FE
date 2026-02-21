// Match backend response exactly
export interface Application {
    id: string
    jobPostingId: string
    candidateId: string
    resumeId?: string
    resumeUrl?: string
    coverLetter?: string
    expectedSalary?: number
    availableStartDate?: string
    stage: ApplicationStage
    status: string
    appliedAt: string
    createdAt: string
    // Job info
    jobTitle: string
    jobCode?: string
    enterpriseName: string
    enterpriseLogoUrl?: string
    departmentName?: string
    // Screening Results
    cvScreeningResult?: CVScreeningResult
}

export type ApplicationStage =
    | 'Applied'
    | 'Screening'
    | 'Shortlisted'
    | 'Interview'
    | 'Offer'
    | 'Rejected'
    | 'Hired'
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
    page?: number
    pageSize?: number
    status?: string
}
