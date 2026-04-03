import { apiClient } from '@/lib/api-client';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { TrainingRequestsResult } from '../../dept-head/types/training-types';
import { CreateTrainingPlan, CloseTrainingPlanRequest, TrainingPlansResult } from '../types/training-plan-types';
import { fetchAllPages } from '../utils/fetch-all-pages';

export const hrTrainingService = {
    async getRequests(params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        status?: string;
    }): Promise<TrainingRequestsResult> {
        const searchParams = new URLSearchParams({
            page: String(params?.page ?? 1),
            pageSize: String(params?.pageSize ?? DEFAULT_PAGE_SIZE),
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
        const allItems = await fetchAllPages<TrainingRequestsResult['items'][number]>(
            async (page, pageSize) => {
                const searchParams = new URLSearchParams({
                    page: String(page),
                    pageSize: String(pageSize),
                    status: 'Pending',
                });

                const response = await apiClient.get(`/api/TrainingRequest?${searchParams}`);

                if (!response.ok) {
                    throw new Error('Không thể tải danh sách yêu cầu');
                }

                return response.json();
            }
        );

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
            pageSize: String(params?.pageSize ?? DEFAULT_PAGE_SIZE),
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
    },

    async getPlanDetail(id: string): Promise<import('../types/training-plan-types').TrainingPlanDetailDto> {
        const response = await apiClient.get(`/api/TrainingPlan/${id}`);
        if (!response.ok) {
            throw new Error('Không thể tải chi tiết kế hoạch');
        }
        return response.json();
    },

    async updatePlan(data: import('../types/training-plan-types').UpdateTrainingPlan): Promise<{ ok: boolean }> {
        const response = await apiClient.put(`/api/TrainingPlan/${data.id}`, data);

        if (!response.ok) {
            let message = 'Không thể cập nhật kế hoạch đào tạo';
            try {
                const error = await response.json();
                message = error.message || message;
            } catch { /* response body is not JSON */ }
            throw new Error(message);
        }

        return { ok: true };
    },

    async closePlan(data: CloseTrainingPlanRequest): Promise<{ ok: boolean }> {
        const response = await apiClient.put('/api/TrainingPlan/close', data);

        if (!response.ok) {
            let message = 'Không thể đóng kế hoạch đào tạo';
            try {
                const error = await response.json();
                message = error.message || message;
            } catch { /* response body is not JSON */ }
            throw new Error(message);
        }

        return { ok: true };
    }
};
