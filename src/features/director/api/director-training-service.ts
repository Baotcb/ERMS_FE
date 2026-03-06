import { TrainingPlan } from '../../hr/types/training-plan-types';

const PLANS_STORAGE_KEY = 'mock_training_plans';

const getStoredPlans = (): TrainingPlan[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(PLANS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const savePlans = (plans: TrainingPlan[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
    }
};

export const directorTrainingService = {
    async getPendingPlans(): Promise<TrainingPlan[]> {
        await new Promise(resolve => setTimeout(resolve, 600));
        const plans = getStoredPlans();
        return plans.filter(p => p.status === 'Pending');
    },

    async approvePlan(planId: string): Promise<{ ok: boolean }> {
        await new Promise(resolve => setTimeout(resolve, 800));
        const plans = getStoredPlans();
        const index = plans.findIndex(p => p.id === planId);
        if (index !== -1) {
            plans[index].status = 'Approved';
            plans[index].updatedAt = new Date().toISOString();
            savePlans(plans);

            // In a real app, this would also trigger "Notify & Open Course Schedule"
            // For now, we mock the side effect or just update the plan status
            return { ok: true };
        }
        return { ok: false };
    },

    async rejectPlan(planId: string, reason: string): Promise<{ ok: boolean }> {
        await new Promise(resolve => setTimeout(resolve, 800));
        const plans = getStoredPlans();
        const index = plans.findIndex(p => p.id === planId);
        if (index !== -1) {
            plans[index].status = 'Rejected';
            plans[index].description += `\nLý do từ chối: ${reason}`;
            plans[index].updatedAt = new Date().toISOString();
            savePlans(plans);
            return { ok: true };
        }
        return { ok: false };
    }
};
