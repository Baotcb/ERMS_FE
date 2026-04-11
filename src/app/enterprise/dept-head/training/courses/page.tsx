import { DeptHeadAvailableCoursesList } from '@/features/dept-head/components/training/dept-head-available-courses-list';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import type { CourseResult } from '@/features/hr/types/course-types';

export default async function DeptHeadAvailableCoursesPage() {
    let initialData: CourseResult = { items: [], totalCount: 0, page: 1, pageSize: 7, totalPages: 1 };

    try {
        initialData = await trainingServerService.getAllCourses({ pageSize: 7 });
    } catch {
        // fallback to empty list, client will retry
    }

    return (
        <div className="container mx-auto py-2">
            <DeptHeadAvailableCoursesList initialData={initialData} />
        </div>
    );
}
