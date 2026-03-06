import {
    TrainingRequest,
    CreateTrainingRequest,
    TrainingRequestsResult
} from '../types/training-types';

const STORAGE_KEY = 'mock_training_requests';

// Initial dummy data
const INITIAL_DATA: TrainingRequest[] = [
    {
        id: '1',
        subject: 'Đào tạo kỹ năng bán hàng B2B',
        urgency: 'Normal',
        status: 'Pending',
        estimatedParticipants: 10,
        estimatedBudget: 5000000,
        requestedById: 'user-1',
        requestedByName: 'Trần Văn A',
        departmentId: 1,
        departmentName: 'Phòng Kinh doanh',
        createdAt: new Date('2026-03-01').toISOString()
    },
    {
        id: '2',
        subject: 'Cập nhật luật thuế 2026',
        urgency: 'High',
        status: 'Approved',
        estimatedParticipants: 3,
        estimatedBudget: 2000000,
        requestedById: 'user-1',
        requestedByName: 'Trần Văn A',
        departmentId: 1,
        departmentName: 'Phòng Kinh doanh',
        createdAt: new Date('2026-03-02').toISOString()
    },
];

const getStoredRequests = (): TrainingRequest[] => {
    if (typeof window === 'undefined') return INITIAL_DATA;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
        return INITIAL_DATA;
    }
    return JSON.parse(stored);
};

const saveRequests = (requests: TrainingRequest[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    }
};

export const trainingService = {
    async getRequests(params: {
        page?: number;
        pageSize?: number;
        search?: string;
        status?: string;
        departmentId?: number;
    }): Promise<TrainingRequestsResult | null> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let items = getStoredRequests();

        // Filters
        if (params.departmentId) {
            items = items.filter(t => t.departmentId === params.departmentId);
        }
        if (params.search) {
            const s = params.search.toLowerCase();
            items = items.filter(t => t.subject.toLowerCase().includes(s));
        }
        if (params.status && params.status !== 'All') {
            items = items.filter(t => t.status === params.status);
        }

        // Sorting
        items = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalCount = items.length;
        const page = params.page || 1;
        const pageSize = params.pageSize || 20;
        const totalPages = Math.ceil(totalCount / pageSize);

        const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

        return {
            items: paginatedItems,
            totalCount,
            page,
            pageSize,
            totalPages
        };
    },

    async createRequest(data: CreateTrainingRequest): Promise<{ ok: boolean; message?: string; trainingRequestId?: string }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const requests = getStoredRequests();
            const newRequest: TrainingRequest = {
                id: Math.random().toString(36).substr(2, 9),
                ...data,
                status: 'Pending',
                createdAt: new Date().toISOString(),
                requestedById: 'mock-user-id',
                requestedByName: 'Dept Head User', // Simplification for mock
                departmentName: 'Phòng ban của bạn', // Simplification for mock
            };

            const updatedRequests = [newRequest, ...requests];
            saveRequests(updatedRequests);

            return { ok: true, trainingRequestId: newRequest.id };
        } catch (error) {
            return { ok: false, message: 'Lỗi khi lưu yêu cầu' };
        }
    }
};
