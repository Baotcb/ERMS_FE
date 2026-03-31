import { redirect } from 'next/navigation';

import { getServerSession } from '@/lib/server-fetch';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { LearningCoursesPage } from '@/features/employee/components/learning/learning-courses-page';
import { canAccessLearningWorkspace } from '@/features/hr/utils/learning-access';
import type { Course } from '@/features/hr/types/course-types';

interface LearnerCourseItem {
    course: Course;
    progressPercentage: number;
    quizUnlocked: boolean;
}

export default async function Page() {
    const session = await getServerSession();

    if (!session.user || !canAccessLearningWorkspace(session.user, session.role)) {
        redirect('/enterprise/hr/dashboard');
    }

    const coursesResult = await trainingServerService
        .getAllCourses({ status: 'Public', pageSize: 100 })
        .catch(() => ({ items: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 0 }));

    const learnerCoursesResults = await Promise.all(
        coursesResult.items.map(async (course): Promise<LearnerCourseItem | null> => {
            try {
                const progress = await trainingServerService.getCourseProgress(course.id);
                return {
                    course,
                    progressPercentage: progress.progressPercentage,
                    quizUnlocked: progress.quizUnlocked,
                };
            } catch {
                return null;
            }
        })
    );

    const initialCourses = learnerCoursesResults.filter((item): item is LearnerCourseItem => item !== null);

    return <LearningCoursesPage initialCourses={initialCourses} learningBasePath="/enterprise/hr/learning" />;
}
