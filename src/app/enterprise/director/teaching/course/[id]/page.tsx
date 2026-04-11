import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { getServerSession } from '@/lib/server-fetch';
import { TrainerCourseDashboard } from '@/features/employee/components/teaching/trainer-course-dashboard';
import { isCourseOwnedByUser } from '@/features/hr/utils/course-workflow';
import { canAccessTeachingWorkspace } from '@/features/hr/utils/teaching-access';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const canAccess = canAccessTeachingWorkspace(session.user, session.role);

    if (!canAccess) {
        redirect('/enterprise/director/dashboard');
    }

    const { id } = await params;
    const course = await trainingServerService.getCourseDetails(id).catch(() => null);

    if (!course) {
        notFound();
    }

    const ownsCourse = isCourseOwnedByUser(course, session.user, session.role);

    if (!ownsCourse) {
        notFound();
    }

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0F4C75]" />
                </div>
            }
        >
            <TrainerCourseDashboard initialCourse={course} teachingBasePath="/enterprise/director/teaching" />
        </Suspense>
    );
}
