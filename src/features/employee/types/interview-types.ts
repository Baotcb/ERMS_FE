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
    myRole: string                   // "Interviewer" (backend field name)
    myConfirmationStatus: string     // "Pending" | "Confirmed" (backend field name)
    hasSubmittedFeedback: boolean    // backend field name
}

export interface MyInterviewsResponse {
    items: MyInterviewDto[]
    totalCount: number
    pageNumber: number
    pageSize: number
}