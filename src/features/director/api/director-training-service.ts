import { apiClient } from '@/lib/api-client';
import { TrainingPlansResult } from '../../hr/types/training-plan-types';

export const directorTrainingService = {
    async getPendingPlans(): Promise<TrainingPlansResult> {
        const searchParams = new URLSearchParams({
            status: 'Pending',
            pageSize: '100'
        });

        const response = await apiClient.get(`/api/TrainingPlan?${searchParams}`);

        if (!response.ok) {
            throw new Error('Không thể tải danh sách kế hoạch chờ duyệt');
        }

        return response.json();
    },

    async approvePlan(planId: string, reviewNote?: string): Promise<{ ok: boolean }> {
        const response = await apiClient.put('/api/TrainingPlan/approve', {
            trainingPlanId: planId,
            reviewNote
        });
        return { ok: response.status === 200 };
    },

    async rejectPlan(planId: string, reviewNote: string): Promise<{ ok: boolean }> {
        const response = await apiClient.put('/api/TrainingPlan/reject', {
            trainingPlanId: planId,
            reviewNote
        });
        return { ok: response.status === 200 };
    }
};
