// Types cho HR Interview workflow — maps to backend Commands/Results

export type InterviewFormat = 'Online' | 'Offline'

export interface ConfirmScheduleRequest {
    applicationId: string
    interviewFormat: InterviewFormat
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
