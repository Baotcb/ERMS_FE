import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { TeachingTasksPage } from '@/features/employee/components/teaching/teaching-tasks-page';
import { getServerSession } from '@/lib/server-fetch';
import { trainingServerService } from '@/features/hr/api/training-server-service';

export default async function Page() {
    const session = await getServerSession();
    const canAccess = Boolean(session.user?.isTrainer || session.role === 'Trainer');

    if (!canAccess) {
        redirect('/enterprise/dept-head/dashboard');
    }

    const allCourses = await trainingServerService.getAllCourses({ pageSize: 100 }).catch(() => ({ items: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 0 }));
    const initialCourses = allCourses.items.filter((course) => {
        if (course.trainerId === session.user?.id) {
            return true;
        }

        if (session.user?.fullName && course.trainerName) {
            return course.trainerName.trim().toLowerCase() === session.user.fullName.trim().toLowerCase();
        }

        return false;
    });

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0F4C75]" />
                </div>
            }
        >
            <TeachingTasksPage teachingBasePath="/enterprise/dept-head/teaching" initialCourses={initialCourses} />
        </Suspense>
    );
}
