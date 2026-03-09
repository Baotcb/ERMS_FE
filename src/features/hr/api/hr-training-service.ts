import { apiClient } from '@/lib/api-client';
import { TrainingRequest, TrainingRequestsResult } from '../../dept-head/types/training-types';
import { TrainingPlan, CreateTrainingPlan, TrainingPlansResult } from '../types/training-plan-types';

export const hrTrainingService = {
    async getAllRequests(params?: {
        search?: string;
        departmentId?: number;
        status?: string;
    }): Promise<TrainingRequestsResult> {
        const searchParams = new URLSearchParams();
        searchParams.set('pageSize', '100'); // Get all for consolidation
        searchParams.set('status', params?.status || 'Pending');

        if (params?.search) searchParams.set('search', params.search);
        if (params?.departmentId) searchParams.set('departmentId', String(params.departmentId));

        const response = await apiClient.get(`/api/TrainingRequest?${searchParams}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể tải danh sách yêu cầu');
        }

        return response.json();
    },

    async getPlans(params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        status?: string;
    }): Promise<TrainingPlansResult> {
        const searchParams = new URLSearchParams({
            page: String(params?.page ?? 1),
            pageSize: String(params?.pageSize ?? 20),
        });

        if (params?.search) searchParams.set('search', params.search);
        if (params?.status) searchParams.set('status', params.status);

        const response = await apiClient.get(`/api/TrainingPlan?${searchParams}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể tải danh sách kế hoạch');
        }

        return response.json();
    },

    async createPlan(data: CreateTrainingPlan): Promise<{ ok: boolean; planId?: string }> {
        const response = await apiClient.post('/api/TrainingPlan', data);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể tạo kế hoạch đào tạo');
        }

        const result = await response.json();
        return {
            ok: true,
            planId: result.trainingRequestId
        };
    }
};
