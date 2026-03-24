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
            title: 'Nội dung khóa học',
            orderIndex: 1,
            lessons: Array.from({ length: totalLessons }).map((_, index) => ({
                id: `fallback-lesson-${courseId}-${index + 1}`,
                courseId,
                title: `Bài ${index + 1}`,
                description: 'Trainer chưa tạo nội dung cho bài học này trên hệ thống.',
                content: 'Vui lòng học theo tài liệu/video đã được trainer cung cấp. Khi trainer tạo nội dung bài học, hệ thống sẽ hiển thị chi tiết.',
                durationMinutes: 0,
                orderIndex: index + 1,
                materials: [],
            })),
        },
    ];
}

