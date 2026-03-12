import { DeptHeadPlansList } from '@/features/dept-head/components/training/dept-head-plans-list';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import type { TrainingPlan } from '@/features/hr/types/training-plan-types';

export default async function DeptHeadTrainingPlansPage() {
    let initialData: { items: TrainingPlan[] } = { items: [] };
    try {
        initialData = await trainingServerService.getPlans({ status: 'Approved' });
    } catch {
        // fallback to empty — client-side SWR will retry
    }

    return (
        <div className="container mx-auto py-2">
            <DeptHeadPlansList initialData={initialData} />
        </div>
    );
}
