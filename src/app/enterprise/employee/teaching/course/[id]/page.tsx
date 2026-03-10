import { Suspense } from 'react';
import { TrainerCourseDashboard } from '@/features/employee/components/teaching/trainer-course-dashboard';
import { Loader2 } from 'lucide-react';
import { courseService } from '@/features/hr/api/course-service';

export default async function Page({ params }: { params: { id: string } }) {
    const course = await courseService.getCourseDetails(params.id);

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F4C75]" />
            </div>
        }>
            <TrainerCourseDashboard initialCourse={course} />
        </Suspense>
    );
}
