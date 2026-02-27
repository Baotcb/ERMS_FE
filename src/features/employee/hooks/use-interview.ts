import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import * as service from '../api/interview-service'
import type { MyInterviewsResponse } from '../types/interview-types'
import type {
    SubmitFeedbackRequest,
    SubmitFeedbackResult,
} from '@/features/dept-head/types/interview-types'

// ===== Danh sách interview của employee đang login =====
export function useMyInterviews(
    params?: { pageNumber?: number; pageSize?: number; status?: string }
) {
    const key = ['/api/applications/my-interviews', params?.pageNumber, params?.pageSize, params?.status]

    return useSWR<MyInterviewsResponse>(key, () =>
        service.getMyInterviews(params)
    )
}

// ===== Submit Feedback =====
export function useSubmitFeedback() {
    return useSWRMutation<SubmitFeedbackResult, Error, string, SubmitFeedbackRequest>(
        '/api/applications/submit-interview-feedback',
        (_, { arg }) => service.submitInterviewFeedback(arg)
    )
}
