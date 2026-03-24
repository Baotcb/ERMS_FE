'use strict';

import type { CourseSection } from '@/features/hr/types/course-content-types';

// ─── Constants ───
export const ANSWER_LABELS = ['A', 'B', 'C', 'D'] as const;

const GUID_REGEX = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/;

// ─── Types ───
export interface MaterialMirrorItem {
    lessonId: string;
    orderIndex: number;
    lessonTitle: string;
    materials: Array<{
        id: string;
        lessonId: string;
        title: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }>;
}

// ─── Helpers ───

/** Check if a lesson ID came from the server (GUID) vs a local/fallback ID. */
export function isServerLessonId(lessonId: string): boolean {
    if (!lessonId) return false;
    if (lessonId.startsWith('fallback-') || lessonId.startsWith('local-')) return false;
    return GUID_REGEX.test(lessonId);
}

/** Parse quiz question options from backend raw string (JSON array, JSON object, or pipe-delimited). */
export function parseOptions(raw: string): string[] {
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item));
        }
        if (parsed && typeof parsed === 'object') {
            return Object.values(parsed as Record<string, unknown>).map((item) => String(item));
        }
    } catch {
        // Fallback for legacy/plain-text formats.
    }

    return raw.split('|').map((item) => item.trim()).filter(Boolean);
}

/** Get localStorage key scoped to user+course for lesson completion tracking. */
export function getLessonCompletionKey(courseId: string, userId?: string): string {
    return `learner-lesson-completion:${userId || 'anon'}:${courseId}`;
}

/** Build fallback sections when backend curriculum is unavailable. */
export function buildFallbackSections(courseId: string, totalLessons: number): CourseSection[] {
    if (totalLessons <= 0) return [];

    return [
        {
            id: `fallback-section-${courseId}`,
            courseId,
            title: 'Learning Path (Fallback)',
            orderIndex: 1,
            lessons: Array.from({ length: totalLessons }).map((_, index) => ({
                id: `fallback-lesson-${courseId}-${index + 1}`,
                courseId,
                title: `Lesson ${index + 1}`,
                description: 'Backend chưa trả curriculum chi tiết. Đây là lesson placeholder theo tổng số lesson từ tiến độ backend.',
                content: 'Vui lòng học theo tài liệu/video đã được trainer cung cấp. Khi backend mở curriculum endpoint, hệ thống sẽ hiển thị lesson chi tiết.',
                durationMinutes: 0,
                orderIndex: index + 1,
                materials: [],
            })),
        },
    ];
}

/** Load curriculum draft from localStorage (user-scoped). */
export function loadLocalDraftCurriculum(courseId: string, userId?: string): CourseSection[] {
    if (typeof window === 'undefined') return [];

    try {
        const raw = window.localStorage.getItem(`teaching-curriculum-draft:${userId || 'anon'}:${courseId}`);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as CourseSection[];
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((section) => Array.isArray(section.lessons) && section.lessons.length > 0);
    } catch {
        return [];
    }
}

/** Load material mirror from localStorage (user-scoped). */
export function loadLocalMaterialMirror(courseId: string, userId?: string): MaterialMirrorItem[] {
    if (typeof window === 'undefined') return [];

    try {
        const raw = window.localStorage.getItem(`teaching-materials-draft:${userId || 'anon'}:${courseId}`);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as MaterialMirrorItem[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/** Merge material mirror data into sections (matches by lessonId or orderIndex). */
export function mergeMaterialMirror(sections: CourseSection[], materialMirror: MaterialMirrorItem[]): CourseSection[] {
    if (materialMirror.length === 0 || sections.length === 0) return sections;

    const byLessonId = new Map(materialMirror.map((item) => [item.lessonId, item]));
    const byOrderIndex = new Map(materialMirror.map((item) => [item.orderIndex, item]));

    return sections.map((section) => ({
        ...section,
        lessons: (section.lessons || []).map((lesson) => {
            const source = byLessonId.get(lesson.id) || byOrderIndex.get(lesson.orderIndex);
            if (!source || source.materials.length === 0) return lesson;
            return {
                ...lesson,
                materials: source.materials.map((material) => ({
                    ...material,
                    lessonId: lesson.id,
                })),
            };
        }),
    }));
}
