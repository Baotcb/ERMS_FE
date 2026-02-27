// Types cho interview workflow — maps to backend Commands/Results

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
