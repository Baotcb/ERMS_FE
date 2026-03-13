import { TrainingRequestList } from '@/features/dept-head/components/training/training-request-list';
import { trainingServerService } from '@/features/hr/api/training-server-service';

export default async function TrainingPage() {
    const initialData = await trainingServerService.getRequests();

    return (
        <div className="container mx-auto py-2">
            <TrainingRequestList initialData={initialData} />
        </div>
    );
}
