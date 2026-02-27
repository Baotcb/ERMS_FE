import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import * as service from '../api/interview-service'
import type {
    ShortlistedResponse,
    AssignInterviewerRequest,
    AssignInterviewerResult,
    ConfirmScheduleRequest,
    ConfirmScheduleResult,
    SubmitFeedbackRequest,
    SubmitFeedbackResult,
    SubmitFinalDecisionRequest,
    SubmitFinalDecisionResult,
    InterviewsForFeedbackResponse,
    InterviewFeedbackDetailResponse,
} from '../types/interview-types'

// ===== DeptHead: danh sách interviews chờ quyết định =====
export function useInterviewsForFeedback(params?: {
    pageNumber?: number
    pageSize?: number
}) {
    const key = [
        '/api/applications/department/interviews-feedback',
        params?.pageNumber,
        params?.pageSize,
    ]

    return useSWR<InterviewsForFeedbackResponse, Error>(
        key,
        () => service.getInterviewsForFeedback(params),
        { revalidateOnFocus: false }
    )
}

// ===== DeptHead: chi tiết interview feedback =====
export function useInterviewFeedbackDetail(interviewId: string | null) {
    return useSWR<InterviewFeedbackDetailResponse, Error>(
        interviewId ? `/api/applications/department/interviews-feedback/${interviewId}` : null,
        () => service.getInterviewFeedbackById(interviewId!),
        { revalidateOnFocus: false }
    )
}

// ===== Shortlisted candidates =====
export function useShortlistedApplications(
    planDetailId: string | null,
    params?: { pageNumber?: number; pageSize?: number }
) {
    const key = planDetailId
        ? [`/api/plan-details/${planDetailId}/shortlisted`, params?.pageNumber, params?.pageSize]
        : null

    return useSWR<ShortlistedResponse>(key, () =>
        service.getShortlistedApplications(planDetailId!, params)
    )
}

// ===== Assign Interviewer =====
export function useAssignInterviewer() {
    return useSWRMutation<AssignInterviewerResult, Error, string, AssignInterviewerRequest>(
        '/api/applications/assign-interviewer',
        (_, { arg }) => service.assignInterviewer(arg)
    )
}

// ===== Confirm Interview Schedule =====
export function useConfirmSchedule() {
    return useSWRMutation<ConfirmScheduleResult, Error, string, ConfirmScheduleRequest>(
        '/api/applications/confirm-schedule',
        (_, { arg }) => service.confirmInterviewSchedule(arg)
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
