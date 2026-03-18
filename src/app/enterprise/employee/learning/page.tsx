import { redirect } from 'next/navigation';

import { getServerSession } from '@/lib/server-fetch';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { LearningCoursesPage } from '@/features/employee/components/learning/learning-courses-page';
import type { Course } from '@/features/hr/types/course-types';

interface LearnerCourseItem {
    course: Course;
    progressPercentage: number;
    quizUnlocked: boolean;
}

export default async function Page() {
    const session = await getServerSession();

    if (!session.user) {
        redirect('/login');
    }

    const coursesResult = await trainingServerService
        .getAllCourses({ status: 'Published', pageSize: 100 })
        .catch(() => ({ items: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 0 }));

    // TODO: N+1 query — gọi getCourseProgress() cho từng course. Khi BE có endpoint
    // GET /api/Course/my-enrolled (trả courses + progress 1 lần), thay thế đoạn này.
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
                // Backend currently has no dedicated endpoint for "my assigned courses".
                // Courses that fail progress query are treated as not assigned to current learner.
                return null;
            }
        })
    );

    const initialCourses = learnerCoursesResults.filter((item): item is LearnerCourseItem => item !== null);

    return <LearningCoursesPage initialCourses={initialCourses} />;
}
