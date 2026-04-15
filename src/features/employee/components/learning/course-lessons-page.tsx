"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Course } from "@/features/hr/types/course-types";
import type { CourseProgressDto } from "@/features/employee/types/learning-quiz-types";
import { useCourseLearning } from "@/features/employee/hooks/use-course-learning";
import { CourseCompactHeader } from "./course-compact-header";
import { CourseNavBar } from "./course-nav-bar";
import { LessonSidebar } from "./quiz/lesson-sidebar";
import { LessonContent } from "./quiz/lesson-content";
import { CourseRightPanel } from "./course-right-panel";
import { learningQuizService } from "@/features/employee/api/learning-quiz-service";

export function CourseLessonsPage({
  initialCourse,
  initialProgress = null,
  basePath,
  isClosed = false,
}: {
  initialCourse: Course;
  initialProgress?: CourseProgressDto | null;
  basePath?: string;
  isClosed?: boolean;
}) {
  const ctx = useCourseLearning(initialCourse, initialProgress);
  const router = useRouter();
  const currentBasePath = basePath || "/enterprise/employee/learning/course";

  // Check if user has quiz result to unlock Result/Review tabs
  const [hasQuizResult, setHasQuizResult] = useState(false);
  useEffect(() => {
    if (!initialCourse.hasFinalQuiz) return;
    learningQuizService
      .getQuizResult(initialCourse.id)
      .then((r) => {
        if (r?.isPassed !== undefined) setHasQuizResult(true);
      })
      .catch(() => {});
  }, [initialCourse.id, initialCourse.hasFinalQuiz]);

  // Redirect to quiz if course has no lessons
  useEffect(() => {
    if (!ctx.isLoadingCurriculum && ctx.knownTotalLessons === 0) {
      router.replace(
        initialCourse.hasFinalQuiz
          ? `${currentBasePath}/${initialCourse.id}/quiz`
          : `${currentBasePath}/${initialCourse.id}/review`,
      );
    }
  }, [
    ctx.isLoadingCurriculum,
    ctx.knownTotalLessons,
    initialCourse.id,
    initialCourse.hasFinalQuiz,
    currentBasePath,
    router,
  ]);

  // Find active module name for breadcrumb
  const activeModuleName = useMemo(() => {
    if (!ctx.activeLesson) return undefined;
    const section = ctx.sections.find((s) =>
      s.lessons?.some((l) => l.id === ctx.activeLesson?.id),
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
        {isClosed && (
          <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <svg
                className="w-5 h-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Khóa học đã kết thúc
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Kế hoạch đào tạo đã được đóng. Dữ liệu chỉ ở chế độ xem.
              </p>
            </div>
          </div>
        )}
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
            hasQuizResult={hasQuizResult}
            basePath={currentBasePath}
            hasFinalQuiz={initialCourse.hasFinalQuiz}
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
            isCompleted={
              ctx.activeLesson
                ? ctx.completedLessonSet.has(ctx.activeLesson.id)
                : false
            }
            isUpdating={ctx.isUpdatingLesson}
            onComplete={isClosed ? () => {} : ctx.handleCompleteActiveLesson}
            onNavigate={ctx.handleNavigateLesson}
            prevLesson={ctx.allLessons[ctx.activeLessonIndex - 1]}
            nextLesson={ctx.allLessons[ctx.activeLessonIndex + 1]}
          />

          {/* Right: Quiz Panel */}
          <CourseRightPanel
            courseId={initialCourse.id}
            isAllLessonsComplete={ctx.isAllLessonsComplete}
            completionPercent={ctx.completionPercent}
            basePath={currentBasePath}
            hasFinalQuiz={initialCourse.hasFinalQuiz}
          />
        </div>
      </div>
    </div>
  );
}
