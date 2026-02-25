import useSWRMutation from 'swr/mutation'
import * as service from '../api/interview-service'
import type {
    ConfirmScheduleRequest,
    ConfirmScheduleResult,
} from '../types/interview-types'

// ===== Confirm Schedule (HR only) =====
export function useConfirmSchedule() {
    return useSWRMutation<ConfirmScheduleResult, Error, string, ConfirmScheduleRequest>(
        '/api/applications/confirm-schedule',
        (_, { arg }) => service.confirmSchedule(arg)
    )
}
