import { notFound, redirect } from 'next/navigation';

import { getServerSession } from '@/lib/server-fetch';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { CourseQuizPage } from '@/features/employee/components/learning/course-quiz-page';
import { canAccessLearningWorkspace } from '@/features/hr/utils/learning-access';

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getServerSession();

    if (!session.user || !canAccessLearningWorkspace(session.user, session.role)) {
        redirect('/enterprise/director/dashboard');
    }

    const { id } = await params;
    const course = await trainingServerService.getCourseDetails(id).catch(() => null);
    const progress = await trainingServerService.getCourseProgress(id).catch(() => null);

    if (!course || !progress) {
        notFound();
    }

    return <CourseQuizPage initialCourse={course} initialProgress={progress} />;
}
