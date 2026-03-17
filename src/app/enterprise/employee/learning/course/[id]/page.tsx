import { notFound, redirect } from 'next/navigation';

import { getServerSession } from '@/lib/server-fetch';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { CourseQuizPage } from '@/features/employee/components/learning/course-quiz-page';

export default async function Page({
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
    const progress = await trainingServerService.getCourseProgress(id).catch(() => null);

    if (!course || !progress) {
        notFound();
    }

    return <CourseQuizPage initialCourse={course} initialProgress={progress} />;
}
