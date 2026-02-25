// Types cho Employee Interviewer module

// ===== Interview mà employee được phân công ===== 
export interface MyInterviewDto {
    interviewId: string
    applicationId: string
    candidateName: string
    candidateEmail?: string
    jobTitle: string
    interviewType: string            // Technical | Cultural | Combined
    interviewFormat: 'Online' | 'Offline'
    roundNumber: number
    scheduledAt: string              // ISO date
    duration: number                 // minutes
    location?: string
    meetingLink?: string
    status: string                   // PendingSchedule | Scheduled | Completed | Cancelled
    participantRole: string          // "Interviewer"
    confirmationStatus: string       // "Pending" | "Confirmed"
    hasFeedbackSubmitted: boolean
    feedbackSubmittedAt?: string
}

export interface MyInterviewsResponse {
    items: MyInterviewDto[]
    totalCount: number
    pageNumber: number
    pageSize: number
}
