import { AssignTrainingPage } from '@/features/dept-head/components/training/assign-training-page';
import { trainingServerService } from '@/features/hr/api/training-server-service';

export default async function Page() {
    const [initialCourses, initialTrainees] = await Promise.all([
        trainingServerService.getAllCourses({ status: 'Draft', pageSize: 100 }),
        trainingServerService.getEmployees({ pageSize: 50 }),
    ]);

    return (
        <AssignTrainingPage
            initialCourses={initialCourses}
            initialTrainees={initialTrainees}
        />
    );
}