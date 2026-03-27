
import { Suspense } from 'react';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { feedbackServerService } from '@/features/employee/api/feedback-server-service';
import { HRCoursesView } from './components/courses-view';

export const metadata = {
    title: 'Quản lý khóa học - Hệ thống Đào tạo nội bộ',
    description: 'Danh sách khóa học và phản hồi từ học viên.',
};

export default async function HRCoursesPage(props: { searchParams: Promise<{ tab?: string; search?: string; courseFilter?: string; }> }) {
    const searchParams = await props.searchParams;
    const tab = searchParams.tab || 'courses';
    const search = searchParams.search || '';
    const courseFilter = searchParams.courseFilter || 'all';

    // We fetch data in parallel on the server depending on the current tab
    // This entirely removes the need for SWR waterfall requests on mount.
    const [coursesResponse, feedbacksResponse] = await Promise.all([
        tab === 'courses' ? trainingServerService.getAllCourses({ search, pageSize: 100 }) : Promise.resolve({ items: [] }),
        tab === 'feedback' ? feedbackServerService.getAllFeedbacks() : Promise.resolve([])
    ]);

    return (
        <Suspense fallback={<div className="flex h-64 items-center justify-center text-gray-400">Đang tải cấu trúc trang...</div>}>
            <HRCoursesView
                tab={tab}
                search={search}
                courseFilter={courseFilter}
                initialCourses={coursesResponse?.items || []}
                initialFeedbacks={feedbacksResponse || []}
            />
        </Suspense>
    );
}
