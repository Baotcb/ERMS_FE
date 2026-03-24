import { notFound, redirect } from 'next/navigation';

import { getServerSession } from '@/lib/server-fetch';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { CourseReviewPage } from '@/features/employee/components/learning/course-review-page';

export default async function ReviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getServerSession();

    if (!session.user) {
        redirect('/login');
    }

    const { id } = await params;
    const course = await trainingServerService.getCourseDetails(id).catch(() => null);

    if (!course) {
        notFound();
    }

    return <CourseReviewPage initialCourse={course} />;
}
