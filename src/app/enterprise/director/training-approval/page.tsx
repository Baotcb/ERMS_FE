import { TrainingPlansApprovalList } from '@/features/director/components/training/training-plans-approval-list';
import { trainingServerService } from '@/features/hr/api/training-server-service';

export default async function TrainingApprovalPage() {
    const initialData = await trainingServerService.getPlans({ status: 'Pending' })
        .catch(() => ({ items: [], totalCount: 0, page: 1, pageSize: 7, totalPages: 1 }));

    return (
        <div className="container mx-auto py-2">
            <TrainingPlansApprovalList initialData={initialData} />
        </div>
    );
}
