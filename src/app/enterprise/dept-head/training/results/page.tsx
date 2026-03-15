import { TrainingResultsTrackingPage } from '@/features/dept-head/components/training/training-results-tracking-page';
import { getDepartmentTrainingResults } from '@/features/dept-head/api/dept-head-service';

export default async function Page() {
    const initialData = await getDepartmentTrainingResults();

    return (
        <div className="container mx-auto py-2">
            <TrainingResultsTrackingPage initialData={initialData} />
        </div>
    );
}