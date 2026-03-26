'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Course } from '@/features/hr/types/course-types';
import type { CourseProgressDto } from '@/features/employee/types/learning-quiz-types';
import { useCourseLearning } from '@/features/employee/hooks/use-course-learning';
import { CourseCompactHeader } from './course-compact-header';
import { CourseNavBar } from './course-nav-bar';
import { LessonSidebar } from './quiz/lesson-sidebar';
import { LessonContent } from './quiz/lesson-content';
import { CourseRightPanel } from './course-right-panel';

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

    // Find active module name for breadcrumb
    const activeModuleName = useMemo(() => {
        if (!ctx.activeLesson) return undefined;
        const section = ctx.sections.find(s =>
            s.lessons?.some(l => l.id === ctx.activeLesson?.id)
        );
        return section?.title;
    }, [ctx.activeLesson, ctx.sections]);

    // Don't render lessons UI if no lessons
    if (!ctx.isLoadingCurriculum && ctx.knownTotalLessons === 0) {
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-56px)] bg-white">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pt-5 pb-10">
                {/* ── Compact Header ── */}
                <CourseCompactHeader
                    courseName={initialCourse.courseName}
                    activeModuleName={activeModuleName}
                />

                {/* ── Nav Bar ── */}
                <div className="mb-5">
                    <CourseNavBar
                        courseId={initialCourse.id}
                        completedLessons={ctx.completedLessonsCount}
                        totalLessons={ctx.knownTotalLessons}
                        isAllLessonsComplete={ctx.isAllLessonsComplete}
                    />
                </div>

                {/* ── 3-Column Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_280px] gap-5 items-start">
                    {/* Left: Module Sidebar */}
                    <LessonSidebar
                        courseName={initialCourse.courseName}
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

                    {/* Center: Main Content */}
                    <LessonContent
                        activeLesson={ctx.activeLesson}
                        activeLessonIndex={ctx.activeLessonIndex}
                        totalLessons={ctx.allLessons.length}
                        isCompleted={ctx.activeLesson ? ctx.completedLessonSet.has(ctx.activeLesson.id) : false}
                        isUpdating={ctx.isUpdatingLesson}
                        onComplete={ctx.handleCompleteActiveLesson}
                        onNavigate={ctx.handleNavigateLesson}
                        prevLesson={ctx.allLessons[ctx.activeLessonIndex - 1]}
                        nextLesson={ctx.allLessons[ctx.activeLessonIndex + 1]}
                    />

                    {/* Right: Quiz Panel */}
                    <CourseRightPanel
                        courseId={initialCourse.id}
                        isAllLessonsComplete={ctx.isAllLessonsComplete}
                        completionPercent={ctx.completionPercent}
                    />
                </div>
            </div>
        </div>
    );
}
