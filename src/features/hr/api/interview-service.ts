import { apiClient } from '@/lib/api-client'
import type {
    ConfirmScheduleRequest,
    ConfirmScheduleResult,
} from '../types/interview-types'

const APPLICATIONS_URL = '/api/applications'

// ===== POST confirm schedule =====
// Backend: POST /api/applications/confirm-schedule
// Quyền: HRManager ONLY
export async function confirmSchedule(
    data: ConfirmScheduleRequest
): Promise<ConfirmScheduleResult> {
    const response = await apiClient.post(`${APPLICATIONS_URL}/confirm-schedule`, data)
    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message || 'Không thể xác nhận lịch phỏng vấn')
    }
    const result = await response.json()
    return result.data ?? result
}
