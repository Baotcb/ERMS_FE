'use strict';


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
