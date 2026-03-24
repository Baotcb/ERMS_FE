'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/core/auth/hooks';
import type { Course } from '@/features/hr/types/course-types';
import type { CourseProgressDto } from '@/features/employee/types/learning-quiz-types';
import type { CourseSection, Lesson } from '@/features/hr/types/course-content-types';
import { learningQuizService } from '@/features/employee/api/learning-quiz-service';
import { courseContentService } from '@/features/hr/api/course-content-service';
import { isServerLessonId, getLessonCompletionKey, buildFallbackSections } from '../components/learning/quiz/quiz-helpers';

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

    // Completion
    completedLessonIds: string[];
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
    markLessonComplete: (lessonId: string) => void;
    handleCompleteActiveLesson: () => Promise<void>;
    handleNavigateLesson: (dir: 'prev' | 'next') => void;
}

// ─── Hook ───

export function useCourseLearning(
    initialCourse: Course,
    initialProgress: CourseProgressDto | null = null,
): CourseLearningContext {
    const { toast } = useToast();
    const { user } = useAuth();

    // ─── State ───
    const [progress, setProgress] = useState<CourseProgressDto | null>(initialProgress);
    const [sections, setSections] = useState<CourseSection[]>([]);
    const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
    const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
    const [activeLessonId, setActiveLessonId] = useState<string>('');
    const [isUpdatingLesson, setIsUpdatingLesson] = useState(false);

    // ─── Derived ───
    const allLessons = useMemo(() => sections.flatMap((s) => s.lessons || []), [sections]);
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

    // ─── Load saved lesson completion from localStorage ───
    useEffect(() => {
        try {
            const raw = localStorage.getItem(getLessonCompletionKey(initialCourse.id, user?.id));
            if (!raw) return;
            const parsed = JSON.parse(raw) as unknown;
            setCompletedLessonIds(Array.isArray(parsed) ? parsed.map((id) => String(id)) : []);
        } catch {
            setCompletedLessonIds([]);
        }
    }, [initialCourse.id, user?.id]);

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
                } else if ((initialProgress?.totalLessons ?? 0) > 0) {
                    setSections(buildFallbackSections(initialCourse.id, initialProgress?.totalLessons ?? 0));
                    setActiveLessonId(`fallback-lesson-${initialCourse.id}-1`);
                } else {
                    setSections([]);
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Không thể tải nội dung khóa học.';
                toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
                if ((initialProgress?.totalLessons ?? 0) > 0) {
                    setSections(buildFallbackSections(initialCourse.id, initialProgress?.totalLessons ?? 0));
                    setActiveLessonId(`fallback-lesson-${initialCourse.id}-1`);
                }
            } finally {
                setIsLoadingCurriculum(false);
            }
        };
        void loadCurriculum();
    }, [initialCourse.id, initialProgress?.totalLessons, toast]);

    // ─── Load progress from backend ───
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const data = await learningQuizService.getCourseProgress(initialCourse.id);
                setProgress(data);
                if (sections.length === 0 && data.totalLessons > 0) {
                    setSections(buildFallbackSections(initialCourse.id, data.totalLessons));
                    setActiveLessonId(`fallback-lesson-${initialCourse.id}-1`);
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Không thể tải tiến độ khóa học.';
                toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
            }
        };
        void loadProgress();
    }, [initialCourse.id, sections.length, toast]);

    // ─── Actions ───
    const markLessonComplete = useCallback((lessonId: string) => {
        setCompletedLessonIds((prev) => {
            if (prev.includes(lessonId)) return prev;
            const next = [...prev, lessonId];
            localStorage.setItem(getLessonCompletionKey(initialCourse.id, user?.id), JSON.stringify(next));
            return next;
        });
    }, [initialCourse.id, user?.id]);

    const handleCompleteActiveLesson = useCallback(async () => {
        if (!activeLesson || completedLessonSet.has(activeLesson.id)) return;

        if (!isServerLessonId(activeLesson.id)) {
            markLessonComplete(activeLesson.id);
            toast({ title: 'Đã hoàn thành bài học', description: 'Tiến độ được ghi nhận trên thiết bị này.' });
            if (activeLessonIndex >= 0 && activeLessonIndex < allLessons.length - 1) {
                setActiveLessonId(allLessons[activeLessonIndex + 1].id);
            }
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
            markLessonComplete(activeLesson.id);
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
    }, [activeLesson, activeLessonIndex, allLessons, completedLessonSet, initialCourse.id, markLessonComplete, toast]);

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
        completedLessonIds,
        completedLessonSet,
        completedLessonsCount,
        knownTotalLessons,
        totalDurationMinutes,
        completionPercent,
        isAllLessonsComplete,
        isLoadingCurriculum,
        isUpdatingLesson,
        setActiveLessonId,
        markLessonComplete,
        handleCompleteActiveLesson,
        handleNavigateLesson,
    };
}
