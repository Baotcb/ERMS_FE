import { Suspense } from 'react';
import { AssignTrainingPage } from '@/features/dept-head/components/training/assign-training-page';
import { trainingServerService } from '@/features/hr/api/training-server-service';

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const planId = typeof resolvedParams.planId === 'string' ? resolvedParams.planId : undefined;
    const courseId = typeof resolvedParams.courseId === 'string' ? resolvedParams.courseId : undefined;

    const [allDraftCourses, initialTrainers, initialTrainees] = await Promise.all([
        trainingServerService.getAllCourses({ status: 'Draft', pageSize: 100 }),
        trainingServerService.getEmployees({ pageSize: 5 }),
        trainingServerService.getEmployees({ pageSize: 10 }),
    ]);

    const initialCourses = {
        ...allDraftCourses,
        items: allDraftCourses.items.filter((course) => {
            if (courseId) {
                return course.id === courseId;
            }
            if (planId) {
                return course.trainingPlanId === planId;
            }
            return true;
        }),
    };

    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Đang tải...</div>}>
            <AssignTrainingPage
                initialCourses={initialCourses}
                initialTrainers={initialTrainers}
                initialTrainees={initialTrainees}
            />
        </Suspense>
    );
}
