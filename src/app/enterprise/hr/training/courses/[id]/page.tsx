import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { feedbackServerService } from '@/features/employee/api/feedback-server-service';
import type { CourseFeedbackDto } from '@/features/employee/api/feedback-service';
import { CourseWorkspaceClient } from './course-workspace-client';

export const metadata = {
    title: 'Không gian Khóa học - Hệ thống Đào tạo nội bộ',
    description: 'Quản lý toàn diện thông tin khóa học.',
};

export default async function CourseDetailPage(props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const tab = searchParams.tab || 'overview';

    const course = await trainingServerService.getCourseDetails(params.id).catch(() => null);
    if (!course) {
        return notFound();
    }

    let feedbacks: CourseFeedbackDto[] = [];
    if (tab === 'feedback') {
        const allFeedbacks = await feedbackServerService.getAllFeedbacks().catch(() => []);
        feedbacks = allFeedbacks.filter(f => f.courseName === course.courseName);
    }

    return (
        <Suspense fallback={<div className="flex h-64 items-center justify-center text-gray-400">Đang tải cấu trúc khóa học...</div>}>
            <CourseWorkspaceClient 
                course={course} 
                initialTab={tab} 
                feedbacks={feedbacks} 
            />
        </Suspense>
    );
}
