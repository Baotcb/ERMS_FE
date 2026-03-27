import { Suspense } from 'react';
import { TeachingTasksPage } from '@/features/employee/components/teaching/teaching-tasks-page';
import { Loader2 } from 'lucide-react';
import { getServerSession } from '@/lib/server-fetch';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { isCourseOwnedByUser } from '@/features/hr/utils/course-workflow';

export default async function Page() {
    const session = await getServerSession();

    const allCourses = await trainingServerService.getAllCourses({ pageSize: 100 }).catch(() => ({ items: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 0 }));
    const initialCourses = allCourses.items.filter((course) => isCourseOwnedByUser(course, session.user));

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F4C75]" />
            </div>
        }>
            <TeachingTasksPage initialCourses={initialCourses} />
        </Suspense>
    );
}
