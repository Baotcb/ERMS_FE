import { apiClient } from '@/lib/api-client';
import { CreateTrainingRequest, TrainingRequestsResult } from '../types/training-types';

async function readApiErrorMessage(response: Response, fallback: string): Promise<string> {
    try {
        const body = await response.text();
        if (!body) {
            return fallback;
        }

        try {
            const json = JSON.parse(body) as {
                message?: string;
                Message?: string;
                title?: string;
                detail?: string;
            };

            return json.message ?? json.Message ?? json.title ?? json.detail ?? body;
        } catch {
            return body;
        }
    } catch {
        return fallback;
    }
}

function mapCreateTrainingRequestError(status: number, rawMessage: string): string {
    const normalized = rawMessage.toLowerCase();

    if (status === 403) {
        if (normalized.includes('csrf') || normalized.includes('invalid csrf token')) {
            return 'Phiên bảo mật đã hết hạn (CSRF). Vui lòng tải lại trang rồi gửi lại yêu cầu đào tạo.';
        }

        return 'Bạn không có quyền gửi yêu cầu đào tạo với tài khoản hiện tại. Vui lòng liên hệ HR/Admin kiểm tra role và policy của endpoint TrainingRequest.';
    }

    if (status === 401) {
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }

    return rawMessage || 'Không thể tạo yêu cầu đào tạo';
}

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
            const rawMessage = await readApiErrorMessage(response, 'Không thể tạo yêu cầu đào tạo');
            throw new Error(mapCreateTrainingRequestError(response.status, rawMessage));
        }

        const result = await response.json();
        return {
            ok: true,
            trainingRequestId: result.trainingRequestId
        };
    }
};
