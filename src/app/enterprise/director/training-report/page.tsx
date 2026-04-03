import { trainingServerService } from '@/features/hr/api/training-server-service';
import type { Course } from '@/features/hr/types/course-types';
import type { TrainingPlan } from '@/features/hr/types/training-plan-types';
import { TrainingReportDashboard } from '@/features/director/components/training/training-report-dashboard';
import { fetchAllPages } from '@/features/hr/utils/fetch-all-pages';

async function getAllPlans(status?: string): Promise<TrainingPlan[]> {
    return fetchAllPages(async (page, pageSize) => {
        const response = await trainingServerService.getPlans({ page, pageSize, status }).catch(() => ({ items: [], totalCount: 0 }));
        return { items: response.items || [], totalCount: response.totalCount || 0 };
    });
}

async function getAllCourses(status?: string): Promise<Course[]> {
    return fetchAllPages(async (page, pageSize) => {
        const response = await trainingServerService
            .getAllCourses({ page, pageSize, status })
            .catch(() => ({ items: [], totalCount: 0 }));
        return { items: response.items || [], totalCount: response.totalCount || 0 };
    });
}

export default async function TrainingReportPage() {
    const [pendingPlans, approvedPlans, rejectedPlans, allCourses, publishedCourses] = await Promise.all([
        getAllPlans('Pending'),
        getAllPlans('Approved'),
        getAllPlans('Rejected'),
        getAllCourses(),
        getAllCourses('Public'),
    ]);

    const totalPlans = pendingPlans.length + approvedPlans.length + rejectedPlans.length;
    const totalBudget = approvedPlans.reduce((sum, plan) => sum + (plan.totalBudget || 0), 0);
    const totalCourses = allCourses.length;
    const publishedRate = totalCourses > 0 ? Math.round((publishedCourses.length / totalCourses) * 100) : 0;

    const totalEnrollments = publishedCourses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
    const averageEnrollments = publishedCourses.length > 0 ? Math.round(totalEnrollments / publishedCourses.length) : 0;

    const completionReadyCourses = publishedCourses.filter((course) => (course.lessonCount || 0) > 0).length;
    const completionReadyRate = publishedCourses.length > 0
        ? Math.round((completionReadyCourses / publishedCourses.length) * 100)
        : 0;

    const statusBars = [
        { label: 'Chờ duyệt', value: pendingPlans.length, color: 'bg-yellow-500' },
        { label: 'Đã duyệt', value: approvedPlans.length, color: 'bg-green-500' },
        { label: 'Từ chối', value: rejectedPlans.length, color: 'bg-red-500' },
    ];

    const maxStatusValue = Math.max(1, ...statusBars.map((item) => item.value));

    return (
        <TrainingReportDashboard
            pendingPlansLength={pendingPlans.length}
            approvedPlansLength={approvedPlans.length}
            totalPlans={totalPlans}
            totalBudget={totalBudget}
            totalCourses={totalCourses}
            publishedCoursesLength={publishedCourses.length}
            publishedRate={publishedRate}
            completionReadyRate={completionReadyRate}
            completionReadyCourses={completionReadyCourses}
            statusBars={statusBars}
            maxStatusValue={maxStatusValue}
            totalEnrollments={totalEnrollments}
            averageEnrollments={averageEnrollments}
        />
    );
}
