import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import * as service from '../api/interview-service'
import type {
    ConfirmScheduleRequest,
    ConfirmScheduleResult,
    GetAllInterviewsResponse,
} from '../types/interview-types'

// ===== GET all interviews (HR/Director) =====
export function useAllInterviews(params?: {
    pageNumber?: number
    pageSize?: number
    statusFilter?: string
}) {
    const key = params
        ? `/api/applications/all-interviews?page=${params.pageNumber ?? 1}&size=${params.pageSize ?? 20}&status=${params.statusFilter ?? ''}`
        : '/api/applications/all-interviews'

    return useSWR<GetAllInterviewsResponse, Error>(
        key,
        () => service.getAllInterviews(params),
        { revalidateOnFocus: false }
    )
}

// ===== Confirm Schedule (HR only) =====
export function useConfirmSchedule() {
    return useSWRMutation<ConfirmScheduleResult, Error, string, ConfirmScheduleRequest>(
        '/api/applications/confirm-schedule',
        (_, { arg }) => service.confirmSchedule(arg)
    )
}
