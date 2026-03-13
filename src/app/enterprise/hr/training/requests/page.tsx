import { ConsolidateRequests } from '@/features/hr/components/training/consolidate-requests';
import { trainingServerService } from '@/features/hr/api/training-server-service';

export default async function TrainingRequestsPage() {
    const initialData = await trainingServerService.getRequests({ status: 'Pending' });

    return (
        <div className="container mx-auto py-2">
            <ConsolidateRequests initialData={initialData} />
        </div>
    );
}
