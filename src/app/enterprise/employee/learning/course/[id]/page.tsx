import { notFound, redirect } from 'next/navigation';

import { getServerSession } from '@/lib/server-fetch';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { CourseLessonsPage } from '@/features/employee/components/learning/course-lessons-page';

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
    const [course, progress] = await Promise.all([
        trainingServerService.getCourseDetails(id).catch(() => null),
        trainingServerService.getCourseProgress(id).catch(() => null),
    ]);

    if (!course || !progress) {
        notFound();
    }

    return <CourseLessonsPage initialCourse={course} initialProgress={progress} />;
}
