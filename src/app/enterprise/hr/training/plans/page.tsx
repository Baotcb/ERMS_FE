import { TrainingPlansList } from '@/features/hr/components/training/training-plans-list';
import { trainingServerService } from '@/features/hr/api/training-server-service';

export default async function TrainingPlansPage() {
    const initialData = await trainingServerService.getPlans();

    return (
        <div className="container mx-auto py-2">
            <TrainingPlansList initialData={initialData} />
        </div>
    );
}
