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

export interface CVScreeningResult {
    id: string
    applicationId: string
    overallScore: number
    skillMatchScore: number
    experienceMatchScore: number
    educationMatchScore: number
    matchedSkills: string[] // Backend returns List<string> or JSON? Plan says list in example
    missingSkills: string[]
    strengths: string[]
    summary?: string
    concerns?: string[]
}

export interface CreateApplicationRequest {
    jobId: string
    cvFile: File
    fullName?: string
    email?: string
    phone?: string
    coverLetter?: string
}

export interface ApplicationHistoryParams {
    page?: number
    pageSize?: number
    status?: string
}

