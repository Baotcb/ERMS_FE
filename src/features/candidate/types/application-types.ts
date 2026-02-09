export interface Application {
    id: string
    jobId: string
    candidateId: string
    fullName: string
    email: string
    phone: string
    cvUrl: string
    coverLetter?: string
    status: 'Pending' | 'Reviewing' | 'Interviewing' | 'Rejected' | 'Hired'
    appliedAt: string
    jobTitle?: string // Joined from job
    enterpriseName?: string // Joined from job
    enterpriseLogoUrl?: string // Joined from job
}

export interface CreateApplicationRequest {
    jobId: string
    coverLetter?: string
    cvFile: File
    // Optional contact info if not using profile
    fullName?: string
    email?: string
    phone?: string
}

export interface ApplicationHistoryParams {
    page?: number
    pageSize?: number
    status?: string
}
