import { TrainingResultsTrackingPage } from '@/features/dept-head/components/training/training-results-tracking-page';
import { trainingServerService } from '@/features/hr/api/training-server-service';

export default async function Page() {
    const result = await trainingServerService.getDepartmentTrainingResults()
        .catch((error) => ({
            items: [],
            sourceEndpoint: null,
            errorMessage: error instanceof Error ? error.message : 'Không thể tải kết quả đào tạo theo phòng ban.',
        }));

    return (
        <div className="container mx-auto py-2">
            <TrainingResultsTrackingPage
                initialData={result.items}
                sourceEndpoint={result.sourceEndpoint}
                initialError={'errorMessage' in result ? result.errorMessage : undefined}
            />
        </div>
    );
}
