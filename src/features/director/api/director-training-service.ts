import { apiClient } from '@/lib/api-client';
import { TrainingPlansResult } from '../../hr/types/training-plan-types';

const RESUBMIT_REQUEST_NOTE_PREFIX = '[RESUBMIT_REQUEST]';
const FINAL_REJECT_NOTE_PREFIX = '[FINAL_REJECT]';

function withPrefix(prefix: string, note: string): string {
    const trimmed = note.trim();
    if (trimmed.startsWith(prefix)) {
        return trimmed;
    }
    return `${prefix} ${trimmed}`;
}

export const directorTrainingService = {
    async getPlans(params?: {
        page?: number;
        pageSize?: number;
        status?: string;
    }): Promise<TrainingPlansResult> {
        const searchParams = new URLSearchParams({
            status: params?.status || 'Pending',
            page: String(params?.page ?? 1),
            pageSize: String(params?.pageSize ?? 7),
        });

        const response = await apiClient.get(`/api/TrainingPlan?${searchParams}`);

        if (!response.ok) {
            throw new Error('Không thể tải danh sách kế hoạch chờ duyệt');
        }

        return response.json();
    },

    /** @deprecated Use getPlans() with pagination instead */
    async getPendingPlans(): Promise<TrainingPlansResult> {
        const allItems: TrainingPlansResult['items'] = [];
        let page = 1;
        const pageSize = 20;

        while (true) {
            const searchParams = new URLSearchParams({
                status: 'Pending',
                page: String(page),
                pageSize: String(pageSize),
            });

            const response = await apiClient.get(`/api/TrainingPlan?${searchParams}`);

            if (!response.ok) {
                throw new Error('Không thể tải danh sách kế hoạch chờ duyệt');
            }

            const result: TrainingPlansResult = await response.json();
            allItems.push(...result.items);

            if (result.items.length < pageSize || allItems.length >= result.totalCount) break;
            page++;
        }

        return {
            items: allItems,
            totalCount: allItems.length,
        };
    },

    async approvePlan(planId: string, reviewNote?: string): Promise<{ ok: boolean }> {
        const response = await apiClient.put('/api/TrainingPlan/approve', {
            trainingPlanId: planId,
            reviewNote
        });
        if (!response.ok) {
            let message = 'Không thể phê duyệt kế hoạch';
            try {
                const error = await response.json();
                message = error.message || message;
            } catch {
                // Keep fallback message when response is not JSON
            }
            throw new Error(message);
        }
        return { ok: true };
    },

    async requestPlanResubmission(planId: string, reviewNote: string): Promise<{ ok: boolean }> {
        const response = await apiClient.put('/api/TrainingPlan/reject', {
            trainingPlanId: planId,
            reviewNote: withPrefix(RESUBMIT_REQUEST_NOTE_PREFIX, reviewNote)
        });
        if (!response.ok) {
            let message = 'Không thể gửi yêu cầu chỉnh sửa kế hoạch';
            try {
                const error = await response.json();
                message = error.message || message;
            } catch {
                // Keep fallback message when response is not JSON
            }
            throw new Error(message);
        }
        return { ok: true };
    },

    async rejectPlan(planId: string, reviewNote: string): Promise<{ ok: boolean }> {
        const response = await apiClient.put('/api/TrainingPlan/reject', {
            trainingPlanId: planId,
            reviewNote: withPrefix(FINAL_REJECT_NOTE_PREFIX, reviewNote)
        });
        if (!response.ok) {
            let message = 'Không thể từ chối kế hoạch';
            try {
                const error = await response.json();
                message = error.message || message;
            } catch {
                // Keep fallback message when response is not JSON
            }
            throw new Error(message);
        }
        return { ok: true };
    },

    async closePlan(planId: string, closingNote?: string): Promise<{ ok: boolean }> {
        const response = await apiClient.put('/api/TrainingPlan/close', {
            trainingPlanId: planId,
            closingNote,
        });
        if (!response.ok) {
            let message = 'Không thể đóng kế hoạch đào tạo';
            try {
                const error = await response.json();
                message = error.message || message;
            } catch {
                // Keep fallback message when response is not JSON
            }
            throw new Error(message);
        }
        return { ok: true };
    }
};
