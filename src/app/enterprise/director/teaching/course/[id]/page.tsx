import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { getServerSession } from '@/lib/server-fetch';
import { TrainerCourseDashboard } from '@/features/employee/components/teaching/trainer-course-dashboard';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const canAccess = Boolean(session.user?.isTrainer || session.role === 'Trainer');

    if (!canAccess) {
        redirect('/enterprise/director/dashboard');
    }

    const { id } = await params;
    const course = await trainingServerService.getCourseDetails(id).catch(() => null);

    if (!course) {
        notFound();
    }

    const normalizedTrainerName = course.trainerName?.trim().toLowerCase();
    const normalizedUserFullName = session.user?.fullName?.trim().toLowerCase();
    const ownsCourse = course.trainerId === session.user?.id || (
        Boolean(normalizedTrainerName) &&
        Boolean(normalizedUserFullName) &&
        normalizedTrainerName === normalizedUserFullName
    );

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
