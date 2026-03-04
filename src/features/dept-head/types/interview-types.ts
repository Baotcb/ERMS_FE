// Types cho interview workflow — maps to backend Commands/Results

// ===== GET /api/applications/department/interviews-feedback (DeptHead list) =====
export interface InterviewFeedbackSummaryDto {
    interviewId: string
    applicationId: string
    candidateName: string
    candidateEmail: string
    jobTitle: string
    interviewType: string
    roundNumber: number
    completedAt: string | null
    feedbacksReceived: number
    totalInterviewers: number
    departmentHeadDecision: string | null
}

export interface InterviewsForFeedbackResponse {
    items: InterviewFeedbackSummaryDto[]
    totalCount: number
    pageNumber: number
    pageSize: number
}

// ===== GET /api/applications/department/interviews-feedback/{id} (Detail) =====
export interface ParticipantFeedbackDto {
    participantId: string
    employeeName: string
    role: string
    rating: number | null
    feedback: string | null
    recommendation: string | null      // 'Hire' | 'Consider' | 'Reject'
    feedbackSubmittedAt: string | null
}

export interface InterviewFeedbackDetailResponse {
    interviewId: string
    applicationId: string
    candidateName: string
    candidateEmail: string
    jobTitle: string
    departmentId: number | null
    interviewType: string
    roundNumber: number
    completedAt: string | null
    departmentHeadDecision: string | null
    departmentHeadOverallRating: number | null
    departmentHeadOverallFeedback: string | null
    departmentHeadNote: string | null
    participantsFeedback: ParticipantFeedbackDto[]
}

// ===== Shortlisted Applications =====
export interface ShortlistedApplicationDto {
    applicationId: string
    candidateId: string
    candidateName: string
    candidateEmail?: string
    candidatePhone?: string
    resumeUrl?: string
    stage: string
    appliedAt: string
    hrNote?: string
    overallScore?: number
    skillMatchScore?: number
    experienceMatchScore?: number
    educationMatchScore?: number
    aiSummary?: string
    matchedSkills?: string
    missingSkills?: string
}

export interface ShortlistedResponse {
    planDetailId: string
    positionTitle: string
    items: ShortlistedApplicationDto[]
    totalCount: number
    pageNumber: number
    pageSize: number
}

// ===== Assign Interviewer =====
export interface AssignInterviewerRequest {
    applicationId: string
    interviewType: 'Technical' | 'Cultural' | 'Combined'
    interviewerIds: string[]
    note?: string
}

export interface InterviewParticipantDto {
    participantId: string
    employeeId: string
    employeeName: string
    role: string
    confirmationStatus: string
}

export interface AssignInterviewerResult {
    interviewId: string
    applicationId: string
    interviewType: string
    status: string
    participants: InterviewParticipantDto[]
}

// ===== Confirm Interview Schedule =====
export type InterviewFormatType = 'Online' | 'Offline'

export interface ConfirmScheduleRequest {
    applicationId: string
    interviewFormat: number // 0 = Online, 1 = Offline
    scheduledAt: string     // ISO datetime
    duration: number        // minutes
    location?: string
    meetingLink?: string
}

export interface ConfirmScheduleResult {
    interviewId: string
    status: string
    interviewFormat: number
    scheduledAt: string
    duration: number
    meetingLink?: string
    location?: string
}

// ===== Submit Interview Feedback (Employee/Interviewer) =====
export interface SubmitFeedbackRequest {
    applicationId: string
    interviewId: string
    rating: number // 1-5
    feedback: string
    recommendation?: 'Hire' | 'Consider' | 'Reject'
}

export interface SubmitFeedbackResult {
    participantId: string
    interviewId: string
    rating: number
    feedbackSubmittedAt: string
}

// ===== Submit Final Decision (Dept Head) =====
export type FinalDecision = 'Passed' | 'Fail' | 'NextRound'

export interface SubmitFinalDecisionRequest {
    applicationId: string
    interviewId: string
    decision: FinalDecision
    overallRating?: number
    overallFeedback?: string
    note?: string
    nextRoundInterviewerIds?: string[]
}

export interface SubmitFinalDecisionResult {
    interviewId: string
    decision: string
    applicationStage: string
    newInterviewId?: string
}
