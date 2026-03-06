import { TrainingRequest } from '../../dept-head/types/training-types';
import { TrainingPlan, CreateTrainingPlan } from '../types/training-plan-types';

const REQUESTS_STORAGE_KEY = 'mock_training_requests';
const PLANS_STORAGE_KEY = 'mock_training_plans';

// Initial dummy plans
const INITIAL_PLANS: TrainingPlan[] = [
    {
        id: 'plan-2026',
        planName: 'Kế hoạch đào tạo tổng thể năm 2026',
        year: 2026,
        description: 'Kế hoạch đào tạo nâng cao năng lực đội ngũ nhân sự năm 2026',
        status: 'Approved',
        totalBudget: 150000000,
        totalCourses: 12,
        createdAt: new Date('2025-12-15').toISOString(),
        updatedAt: new Date('2025-12-20').toISOString(),
    }
];

const getStoredRequests = (): TrainingRequest[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(REQUESTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const getStoredPlans = (): TrainingPlan[] => {
    if (typeof window === 'undefined') return INITIAL_PLANS;
    const stored = localStorage.getItem(PLANS_STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(INITIAL_PLANS));
        return INITIAL_PLANS;
    }
    return JSON.parse(stored);
};

const savePlans = (plans: TrainingPlan[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
    }
};

const updateRequestStatus = (requestId: string, status: string) => {
    const requests = getStoredRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
        requests[index].status = status as any;
        localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    }
};

export const hrTrainingService = {
    async getAllRequests(): Promise<TrainingRequest[]> {
        await new Promise(resolve => setTimeout(resolve, 600));
        return getStoredRequests();
    },

    async getPlans(): Promise<TrainingPlan[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return getStoredPlans();
    },

    async createPlan(data: CreateTrainingPlan): Promise<{ ok: boolean; planId?: string }> {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const plans = getStoredPlans();
        const requests = getStoredRequests();

        // Calculate totals from selected requests
        const selectedRequests = requests.filter(r => data.courseIds.includes(r.id));
        const totalBudget = selectedRequests.reduce((sum, r) => sum + (r.estimatedBudget || 0), 0);

        const newPlan: TrainingPlan = {
            id: Math.random().toString(36).substr(2, 9),
            planName: data.planName,
            year: data.year,
            description: data.description,
            status: 'Pending',
            totalBudget: totalBudget,
            totalCourses: selectedRequests.length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Update status of included requests to "Approved" (or "Planned")
        data.courseIds.forEach(id => updateRequestStatus(id, 'Approved'));

        const updatedPlans = [newPlan, ...plans];
        savePlans(updatedPlans);

        return { ok: true, planId: newPlan.id };
    }
};
