import { notFound, redirect } from 'next/navigation';

import { getServerSession } from '@/lib/server-fetch';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { CourseQuizPage } from '@/features/employee/components/learning/course-quiz-page';

export default async function Page({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await getServerSession();

    if (!session.user) {
        redirect('/login');
    }

    const { id } = await params;
    const resolvedSearchParams = await searchParams;
    const initialQuizId = typeof resolvedSearchParams.quizId === 'string' ? resolvedSearchParams.quizId : '';
    const course = await trainingServerService.getCourseDetails(id).catch(() => null);

    if (!course) {
        notFound();
    }

    return <CourseQuizPage initialCourse={course} initialQuizId={initialQuizId} />;
}
