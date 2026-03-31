import { Suspense } from 'react';
import { TrainerCourseDashboard } from '@/features/employee/components/teaching/trainer-course-dashboard';
import { Loader2 } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-fetch';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { isCourseOwnedByUser } from '@/features/hr/utils/course-workflow';
import { HR_ROLES } from '@/utils/constants';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession();

    if (!session.role || !HR_ROLES.includes(session.role as typeof HR_ROLES[number])) {
        redirect('/enterprise/hr/dashboard');
    }

    const course = await trainingServerService.getCourseDetails(id).catch(() => null);

    if (!course) {
        notFound();
    }

    const ownsCourse = isCourseOwnedByUser(course, session.user, session.role);

    if (!ownsCourse) {
        notFound();
    }

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F4C75]" />
            </div>
        }>
            <TrainerCourseDashboard initialCourse={course} teachingBasePath="/enterprise/hr/teaching" />
        </Suspense>
    );
}
