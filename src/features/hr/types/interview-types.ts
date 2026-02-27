// Types cho HR Interview workflow — maps to backend Commands/Results

export type InterviewFormat = 'Online' | 'Offline'

// ===== GET /api/applications/all-interviews =====
export interface InterviewParticipantSummary {
    participantId: string
    employeeId: string
    employeeName: string
    role: string
    confirmationStatus: string
    hasSubmittedFeedback: boolean
}

export interface InterviewDto {
    interviewId: string
    applicationId: string
    candidateName: string
    candidateEmail: string
    jobTitle: string
    interviewType: string
    interviewFormat: string // 'Online' | 'Offline'
    roundNumber: number
    scheduledAt: string | null
    duration: number
    location: string | null
    meetingLink: string | null
    status: string // PendingSchedule | Scheduled | Completed | Cancelled
    scheduledById: string
    scheduledByName: string
    participants: InterviewParticipantSummary[]
}

export interface GetAllInterviewsResponse {
    items: InterviewDto[]
    totalCount: number
    pageNumber: number
    pageSize: number
}

// ===== POST /api/applications/confirm-schedule =====
export interface ConfirmScheduleRequest {
    applicationId: string
    interviewFormat: number // 0 = Online, 1 = Offline (backend enum)
    scheduledAt: string // ISO date
    duration: number // minutes
    location?: string
    meetingLink?: string
}

export interface ConfirmScheduleResult {
    interviewId: string
    status: string
    interviewFormat: InterviewFormat
    scheduledAt: string
    duration: number
    meetingLink?: string
    location?: string
}
