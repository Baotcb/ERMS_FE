import { apiClient } from '@/lib/api-client';
import { CreateTrainingRequest, TrainingRequestsResult } from '../types/training-types';

export const trainingService = {
    async getRequests(params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        departmentId?: number;
        status?: string;
        urgency?: string;
    }): Promise<TrainingRequestsResult> {
        const searchParams = new URLSearchParams({
            page: String(params?.page ?? 1),
            pageSize: String(params?.pageSize ?? 20),
        });

        if (params?.search) searchParams.set('search', params.search);
        if (params?.departmentId) searchParams.set('departmentId', String(params.departmentId));
        if (params?.status) searchParams.set('status', params.status);
        if (params?.urgency) searchParams.set('urgency', params.urgency);

        const response = await apiClient.get(`/api/TrainingRequest?${searchParams}`);

        if (!response.ok) {
            let message = 'Không thể tải danh sách yêu cầu đào tạo';
            try {
                const error = await response.json();
                message = error.message || message;
            } catch { /* response body is not JSON */ }
            throw new Error(message);
        }

        return response.json();
    },

    async createRequest(data: CreateTrainingRequest): Promise<{ ok: boolean; trainingRequestId?: string }> {
        const response = await apiClient.post('/api/TrainingRequest', data);

        if (!response.ok) {
            let message = 'Không thể tạo yêu cầu đào tạo';
            try {
                const error = await response.json();
                message = error.message || message;
            } catch { /* response body is not JSON */ }
            throw new Error(message);
        }

        const result = await response.json();
        return {
            ok: true,
            trainingRequestId: result.trainingRequestId
        };
    }
};
