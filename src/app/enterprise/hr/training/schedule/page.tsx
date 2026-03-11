import { SetupTrainingSchedulePage } from '@/features/hr/components/training/setup-training-schedule-page';
import { trainingServerService } from '@/features/hr/api/training-server-service';

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const courseId = typeof resolvedParams.courseId === 'string' ? resolvedParams.courseId : undefined;

    const initialCourses = await trainingServerService.getAllCourses({ status: 'Draft', pageSize: 100 });
    
    let initialCourseDetails;
    if (courseId) {
        initialCourseDetails = await trainingServerService.getCourseDetails(courseId);
    }

    return (
        <SetupTrainingSchedulePage 
            initialCourses={initialCourses} 
            initialCourseDetails={initialCourseDetails} 
        />
    );
}
