import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import * as service from '../api/interview-service'
import type {
    ShortlistedResponse,
    AssignInterviewerRequest,
    AssignInterviewerResult,
    SubmitFeedbackRequest,
    SubmitFeedbackResult,
    SubmitFinalDecisionRequest,
    SubmitFinalDecisionResult,
} from '../types/interview-types'

// ===== Shortlisted candidates =====
export function useShortlistedApplications(
    jobPostingId: string | null,
    params?: { pageNumber?: number; pageSize?: number }
) {
    const key = jobPostingId
        ? [`/api/job-postings/${jobPostingId}/shortlisted`, params?.pageNumber, params?.pageSize]
        : null

    return useSWR<ShortlistedResponse>(key, () =>
        service.getShortlistedApplications(jobPostingId!, params)
    )
}

// ===== Assign Interviewer =====
export function useAssignInterviewer() {
    return useSWRMutation<AssignInterviewerResult, Error, string, AssignInterviewerRequest>(
        '/api/applications/assign-interviewer',
        (_, { arg }) => service.assignInterviewer(arg)
    )
}


// ===== Submit Interview Feedback =====
export function useSubmitFeedback() {
    return useSWRMutation<SubmitFeedbackResult, Error, string, SubmitFeedbackRequest>(
        '/api/applications/submit-interview-feedback',
        (_, { arg }) => service.submitInterviewFeedback(arg)
    )
}

// ===== Submit Final Decision =====
export function useSubmitFinalDecision() {
    return useSWRMutation<SubmitFinalDecisionResult, Error, string, SubmitFinalDecisionRequest>(
        '/api/applications/submit-final-decision',
        (_, { arg }) => service.submitFinalDecision(arg)
    )
}
