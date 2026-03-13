import { apiClient } from '@/lib/api-client';
import { TrainingPlansResult } from '../../hr/types/training-plan-types';

export const directorTrainingService = {
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

    async rejectPlan(planId: string, reviewNote: string): Promise<{ ok: boolean }> {
        const response = await apiClient.put('/api/TrainingPlan/reject', {
            trainingPlanId: planId,
            reviewNote
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
    }
};
