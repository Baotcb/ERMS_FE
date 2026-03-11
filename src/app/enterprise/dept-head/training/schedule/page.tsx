import { redirect } from 'next/navigation';
import { SetupTrainingSchedulePage } from '@/features/hr/components/training/setup-training-schedule-page';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { getServerSession } from '@/lib/server-fetch';

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await getServerSession();
    if (!session.user) {
        redirect('/login');
    }

    const resolvedParams = await searchParams;
    const courseId = typeof resolvedParams.courseId === 'string' ? resolvedParams.courseId : undefined;

    let initialCourseDetails;
    if (courseId) {
        initialCourseDetails = await trainingServerService.getCourseDetails(courseId);
    }

    const initialCourses = initialCourseDetails
        ? {
            items: [initialCourseDetails],
            totalCount: 1,
            page: 1,
            pageSize: 1,
            totalPages: 1,
        }
        : {
            items: [],
            totalCount: 0,
            page: 1,
            pageSize: 1,
            totalPages: 0,
        };

    return (
        <SetupTrainingSchedulePage
            initialCourses={initialCourses}
            initialCourseDetails={initialCourseDetails}
            headingTitle="Thiết lập lịch trình đào tạo"
            headingDescription="Trưởng bộ phận cấu hình lịch học, địa điểm và gửi thông báo để bắt đầu triển khai khóa học."
            stepTwoLabel="Bước 2: Trưởng bộ phận mở lịch & thông báo"
            publishRedirectPath="/enterprise/dept-head/training"
        />
    );
}
