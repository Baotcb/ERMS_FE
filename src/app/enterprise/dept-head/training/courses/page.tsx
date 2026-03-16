import { DeptHeadAvailableCoursesList } from '@/features/dept-head/components/training/dept-head-available-courses-list';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import type { Course } from '@/features/hr/types/course-types';

export default async function DeptHeadAvailableCoursesPage() {
    let initialData: { items: Course[] } = { items: [] };

    try {
        initialData = await trainingServerService.getAllCourses({ pageSize: 100 });
    } catch {
        // fallback to empty list, client will retry
    }

    return (
        <div className="container mx-auto py-2">
            <DeptHeadAvailableCoursesList initialData={initialData} />
        </div>
    );
}
