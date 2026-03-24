'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Course } from '@/features/hr/types/course-types';
import type { CourseProgressDto } from '@/features/employee/types/learning-quiz-types';
import { useCourseLearning } from '@/features/employee/hooks/use-course-learning';
import { CourseHeroHeader } from './quiz/course-hero-header';
import { LessonSidebar } from './quiz/lesson-sidebar';
import { LessonContent } from './quiz/lesson-content';
import { CourseNavBar } from './course-nav-bar';

export function CourseLessonsPage({
    initialCourse,
    initialProgress = null,
}: {
    initialCourse: Course;
    initialProgress?: CourseProgressDto | null;
}) {
    const ctx = useCourseLearning(initialCourse, initialProgress);
    const router = useRouter();

    // Redirect to quiz if course has no lessons
    useEffect(() => {
        if (!ctx.isLoadingCurriculum && ctx.knownTotalLessons === 0) {
            router.replace(`/enterprise/employee/learning/course/${initialCourse.id}/quiz`);
        }
    }, [ctx.isLoadingCurriculum, ctx.knownTotalLessons, initialCourse.id, router]);

    // Don't render lessons UI if no lessons
    if (!ctx.isLoadingCurriculum && ctx.knownTotalLessons === 0) {
        return null;
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-1">
            <CourseHeroHeader
                courseName={initialCourse.courseName}
                courseCode={initialCourse.courseCode}
                totalLessons={ctx.knownTotalLessons}
                totalDurationMinutes={ctx.totalDurationMinutes}
                completedCount={ctx.completedLessonsCount}
                completionPercent={ctx.completionPercent}
                isAllComplete={ctx.isAllLessonsComplete}
            />

            <CourseNavBar
                courseId={initialCourse.id}
                completedLessons={ctx.completedLessonsCount}
                totalLessons={ctx.knownTotalLessons}
                isAllLessonsComplete={ctx.isAllLessonsComplete}
                hasLessons={ctx.knownTotalLessons > 0}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
                <LessonSidebar
                    sections={ctx.sections}
                    allLessons={ctx.allLessons}
                    completedLessonSet={ctx.completedLessonSet}
                    lessonIndexMap={new Map(ctx.allLessons.map((l, i) => [l.id, i]))}
                    activeLessonId={ctx.activeLessonId}
                    isLoading={ctx.isLoadingCurriculum}
                    progress={ctx.progress}
                    completedCount={ctx.completedLessonsCount}
                    totalLessons={ctx.knownTotalLessons}
                    onSelectLesson={ctx.setActiveLessonId}
                />
                <LessonContent
                    activeLesson={ctx.activeLesson}
                    activeLessonIndex={ctx.activeLessonIndex}
                    totalLessons={ctx.allLessons.length}
                    isCompleted={ctx.activeLesson ? ctx.completedLessonSet.has(ctx.activeLesson.id) : false}
                    isUpdating={ctx.isUpdatingLesson}
                    onComplete={ctx.handleCompleteActiveLesson}
                    onNavigate={ctx.handleNavigateLesson}
                />
            </div>
        </div>
    );
}

