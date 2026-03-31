'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Course } from '@/features/hr/types/course-types';
import type { CourseProgressDto } from '@/features/employee/types/learning-quiz-types';
import type { CourseSection, Lesson } from '@/features/hr/types/course-content-types';
import { learningQuizService } from '@/features/employee/api/learning-quiz-service';
import { courseContentService } from '@/features/hr/api/course-content-service';
import { isServerLessonId } from '../components/learning/quiz/quiz-helpers';

// ─── Return type ───

export interface CourseLearningContext {
    // Data
    course: Course;
    progress: CourseProgressDto | null;
    sections: CourseSection[];
    allLessons: Lesson[];
    activeLesson: Lesson | null;
    activeLessonId: string;
    activeLessonIndex: number;

    // Completion (backend-driven)
    completedLessonSet: Set<string>;
    completedLessonsCount: number;
    knownTotalLessons: number;
    totalDurationMinutes: number;
    completionPercent: number;
    isAllLessonsComplete: boolean;

    // Loading
    isLoadingCurriculum: boolean;
    isUpdatingLesson: boolean;

    // Actions
    setActiveLessonId: (id: string) => void;
    handleCompleteActiveLesson: () => Promise<void>;
    handleNavigateLesson: (dir: 'prev' | 'next') => void;
}

// ─── Hook ───

export function useCourseLearning(
    initialCourse: Course,
    initialProgress: CourseProgressDto | null = null,
): CourseLearningContext {
    const { toast } = useToast();

    // ─── State ───
    const [progress, setProgress] = useState<CourseProgressDto | null>(initialProgress);
    const [sections, setSections] = useState<CourseSection[]>([]);
    const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
    const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
    const [activeLessonId, setActiveLessonId] = useState<string>('');
    const [isUpdatingLesson, setIsUpdatingLesson] = useState(false);

    // ─── Derived ───
    const allLessons = useMemo(() => {
        return sections.flatMap((s) => s.lessons || []);
    }, [sections]);
    const completedLessonSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);
    const lessonIndexMap = useMemo(() => {
        const m = new Map<string, number>();
        allLessons.forEach((l, i) => m.set(l.id, i));
        return m;
    }, [allLessons]);
    const completedLessonsCount = useMemo(
        () => allLessons.filter((l) => completedLessonSet.has(l.id)).length,
        [allLessons, completedLessonSet],
    );
    const knownTotalLessons = allLessons.length > 0
        ? allLessons.length
        : (progress?.totalLessons ?? initialProgress?.totalLessons ?? 0);
    const totalDurationMinutes = useMemo(
        () => allLessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0),
        [allLessons],
    );
    const completionPercent = knownTotalLessons > 0
        ? Math.round((completedLessonsCount / knownTotalLessons) * 100)
        : 0;
    const isAllLessonsComplete = knownTotalLessons > 0 && completedLessonsCount >= knownTotalLessons;
    const activeLesson = useMemo(
        () => allLessons.find((l) => l.id === activeLessonId) || null,
        [allLessons, activeLessonId],
    );
    const activeLessonIndex = activeLesson ? (lessonIndexMap.get(activeLesson.id) ?? -1) : -1;

    // ─── Load curriculum from backend ───
    useEffect(() => {
        const loadCurriculum = async () => {
            setIsLoadingCurriculum(true);
            try {
                const data = await courseContentService.getCourseCurriculum(initialCourse.id);
                if ((data || []).length > 0) {
                    setSections(data);
                    const firstLesson = data.flatMap((s) => s.lessons || [])[0];
                    if (firstLesson) setActiveLessonId(firstLesson.id);
                } else {
                    setSections([]);
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Không thể tải nội dung khóa học.';
                toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
            } finally {
                setIsLoadingCurriculum(false);
            }
        };
        void loadCurriculum();
    }, [initialCourse.id, toast]);

    // ─── Load progress from backend (source of truth for completion) ───
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const data = await learningQuizService.getCourseProgress(initialCourse.id);
                setProgress(data);
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Không thể tải tiến độ khóa học.';
                toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
            }
        };
        void loadProgress();
    }, [initialCourse.id, toast]);

    // ─── Load per-lesson completion from backend ───
    useEffect(() => {
        if (allLessons.length === 0) return;

        const loadLessonProgress = async () => {
            try {
                const progressData = await learningQuizService.getCourseProgress(initialCourse.id);
                // Use the completedLessons count from backend to verify
                // Also try to load per-lesson progress if enrollment exists
                if (progressData && progressData.completedLessons > 0) {
                    // Fetch per-lesson progress via the lesson-progress endpoint
                    try {
                        const lessonProgressList = await learningQuizService.getLessonProgressByCourse(initialCourse.id);
                        if (lessonProgressList && lessonProgressList.length > 0) {
                            const completed = lessonProgressList
                                .filter((lp: { status: string }) => lp.status === 'Completed')
                                .map((lp: { lessonId: string }) => lp.lessonId);
                            setCompletedLessonIds(completed);
                        }
                    } catch {
                        // Fallback: no per-lesson data available yet
                    }
                }
            } catch {
                // ignore — progress already loaded above
            }
        };
        void loadLessonProgress();
    }, [initialCourse.id, allLessons.length]);

    // ─── Actions ───
    const handleCompleteActiveLesson = useCallback(async () => {
        if (!activeLesson || completedLessonSet.has(activeLesson.id)) return;

        if (!isServerLessonId(activeLesson.id)) {
            toast({
                title: '⚠️ Không thể ghi nhận',
                description: 'Bài học chưa được tạo trên hệ thống backend. Tiến độ sẽ không được lưu. Vui lòng liên hệ trainer.',
                variant: 'destructive',
            });
            return;
        }

        setIsUpdatingLesson(true);
        try {
            await learningQuizService.updateLessonProgress({
                lessonId: activeLesson.id,
                watchPercentage: 100,
                lastPosition: undefined,
                timeSpentMinutes: activeLesson.durationMinutes || 1,
            });

            // Add to local completed set immediately for UI responsiveness
            setCompletedLessonIds((prev) => {
                if (prev.includes(activeLesson.id)) return prev;
                return [...prev, activeLesson.id];
            });

            // Refresh progress from backend
            try {
                const p = await learningQuizService.getCourseProgress(initialCourse.id);
                setProgress(p);
            } catch { /* keep local */ }

            toast({ title: 'Đã cập nhật tiến độ', description: 'Bài học đã được ghi nhận hoàn thành.' });
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Không thể cập nhật tiến độ.',
                variant: 'destructive',
            });
            return;
        } finally {
            setIsUpdatingLesson(false);
        }

        if (activeLessonIndex >= 0 && activeLessonIndex < allLessons.length - 1) {
            setActiveLessonId(allLessons[activeLessonIndex + 1].id);
        }
    }, [activeLesson, activeLessonIndex, allLessons, completedLessonSet, initialCourse.id, toast]);

    const handleNavigateLesson = useCallback((dir: 'prev' | 'next') => {
        const newIdx = dir === 'prev' ? activeLessonIndex - 1 : activeLessonIndex + 1;
        if (newIdx >= 0 && newIdx < allLessons.length) setActiveLessonId(allLessons[newIdx].id);
    }, [activeLessonIndex, allLessons]);

    return {
        course: initialCourse,
        progress,
        sections,
        allLessons,
        activeLesson,
        activeLessonId,
        activeLessonIndex,
        completedLessonSet,
        completedLessonsCount,
        knownTotalLessons,
        totalDurationMinutes,
        completionPercent,
        isAllLessonsComplete,
        isLoadingCurriculum,
        isUpdatingLesson,
        setActiveLessonId,
        handleCompleteActiveLesson,
        handleNavigateLesson,
    };
}
