import { apiClient } from '@/lib/api-client';
import { TrainingRequestsResult } from '../../dept-head/types/training-types';
import { CreateTrainingPlan, TrainingPlansResult } from '../types/training-plan-types';

export const hrTrainingService = {
    async getRequests(params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        status?: string;
    }): Promise<TrainingRequestsResult> {
        const searchParams = new URLSearchParams({
            page: String(params?.page ?? 1),
            pageSize: String(params?.pageSize ?? 7),
            status: params?.status || 'Pending',
        });

        if (params?.search) searchParams.set('search', params.search);

        const response = await apiClient.get(`/api/TrainingRequest?${searchParams}`);

        if (!response.ok) {
            throw new Error('Không thể tải danh sách yêu cầu');
        }

        return response.json();
    },

    /** Fetch ALL pending requests (no paging). Only used by consolidate-requests page. */
    async getAllPendingRequests(): Promise<TrainingRequestsResult> {
        const allItems: TrainingRequestsResult['items'] = [];
        let page = 1;
        const pageSize = 20;

        while (true) {
            const searchParams = new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
                status: 'Pending',
            });

            const response = await apiClient.get(`/api/TrainingRequest?${searchParams}`);

            if (!response.ok) {
                throw new Error('Không thể tải danh sách yêu cầu');
            }

            const result: TrainingRequestsResult = await response.json();
            allItems.push(...result.items);

            if (page >= result.totalPages || result.items.length === 0) break;
            page++;
        }

        return {
            items: allItems,
            totalCount: allItems.length,
            page: 1,
            pageSize: allItems.length,
            totalPages: 1,
        };
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
            throw new Error('Không thể tải danh sách kế hoạch');
        }

        return response.json();
    },

    async createPlan(data: CreateTrainingPlan): Promise<{ ok: boolean; planId?: string }> {
        const response = await apiClient.post('/api/TrainingPlan', data);

        if (!response.ok) {
            throw new Error('Không thể tạo kế hoạch đào tạo');
        }

        const result = await response.json() as { id?: string; trainingRequestId?: string };
        return {
            ok: true,
            planId: result.id || result.trainingRequestId
        };
    }
};
