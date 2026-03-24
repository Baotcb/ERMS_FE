import { notFound, redirect } from 'next/navigation';

import { getServerSession } from '@/lib/server-fetch';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { CourseQuizSection } from '@/features/employee/components/learning/course-quiz-section';
import { canAccessLearningWorkspace } from '@/features/hr/utils/learning-access';

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session.user || !canAccessLearningWorkspace(session.user, session.role)) redirect('/enterprise/dept-head/dashboard');

    const { id } = await params;
    const [course, progress] = await Promise.all([
        trainingServerService.getCourseDetails(id).catch(() => null),
        trainingServerService.getCourseProgress(id).catch(() => null),
    ]);
    if (!course) notFound();

    return <CourseQuizSection initialCourse={course} initialProgress={progress} />;
}
