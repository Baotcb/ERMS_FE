import { apiClient } from '@/lib/api-client';
import { CourseSection, Lesson, CreateLessonCommand, Material } from '../types/course-content-types';

const CURRICULUM_UNAVAILABLE_KEY_PREFIX = 'course-curriculum-endpoint-unavailable';

function cacheCurriculumUnavailable(courseId: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.setItem(
        `${CURRICULUM_UNAVAILABLE_KEY_PREFIX}:${courseId}`,
        String(Date.now())
    );
}

function asRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object') {
        return value as Record<string, unknown>;
    }

    return {};
}

function readString(record: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'string' && value.trim()) {
            return value;
        }
    }

    return '';
}

function readNumber(record: Record<string, unknown>, fallback: number, ...keys: string[]): number {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
    }

    return fallback;
}

function normalizeMaterial(raw: unknown): Material {
    const record = asRecord(raw);

    return {
        id: readString(record, 'id', 'Id'),
        lessonId: readString(record, 'lessonId', 'LessonId'),
        title: readString(record, 'title', 'Title', 'fileName', 'FileName'),
        fileUrl: readString(record, 'fileUrl', 'FileUrl', 'url', 'Url'),
        fileType: readString(record, 'fileType', 'FileType'),
        fileSize: readNumber(record, 0, 'fileSize', 'FileSize'),
    };
}

function normalizeLesson(raw: unknown): Lesson {
    if (typeof raw === 'string' && raw.trim()) {
        return {
            id: raw.trim(),
            courseId: '',
            title: '',
            durationMinutes: 0,
            orderIndex: 0,
            materials: [],
        };
    }

    const record = asRecord(raw);

    return {
        id: readString(record, 'id', 'Id', 'lessonId', 'LessonId', 'lessonID', 'LessonID'),
        courseId: readString(record, 'courseId', 'CourseId'),
        sectionId: readString(record, 'sectionId', 'SectionId') || undefined,
        title: readString(record, 'title', 'Title', 'lessonTitle', 'LessonTitle'),
        description: readString(record, 'description', 'Description') || undefined,
        content: readString(record, 'content', 'Content') || undefined,
        videoUrl: readString(record, 'videoUrl', 'VideoUrl') || undefined,
        durationMinutes: readNumber(
            record,
            0,
            'durationMinutes',
            'DurationMinutes',
            'estimatedMinutes',
            'EstimatedMinutes',
            'videoDurationMinutes',
            'VideoDurationMinutes'
        ),
        orderIndex: readNumber(record, 0, 'orderIndex', 'OrderIndex'),
        materials: Array.isArray(record.materials)
            ? record.materials.map((item) => normalizeMaterial(item))
            : Array.isArray(record.Materials)
                ? (record.Materials as unknown[]).map((item) => normalizeMaterial(item))
                : [],
    };
}

function normalizeSection(raw: unknown): CourseSection {
    const record = asRecord(raw);
    const lessons = Array.isArray(record.lessons)
        ? (record.lessons as unknown[]).map((item) => normalizeLesson(item))
        : Array.isArray(record.Lessons)
            ? (record.Lessons as unknown[]).map((item) => normalizeLesson(item))
            : [];

    return {
        id: readString(record, 'id', 'Id'),
        courseId: readString(record, 'courseId', 'CourseId'),
        title: readString(record, 'title', 'Title', 'sectionTitle', 'SectionTitle'),
        orderIndex: readNumber(record, 0, 'orderIndex', 'OrderIndex'),
        lessons,
    };
}

function findCollectionByKeys(payload: unknown, keys: string[]): unknown[] {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (!payload || typeof payload !== 'object') {
        return [];
    }

    const record = payload as Record<string, unknown>;

    for (const key of keys) {
        const value = record[key];
        if (Array.isArray(value)) {
            return value;
        }
    }

    for (const key of keys) {
        const value = record[key];
        const nested = findCollectionByKeys(value, keys);
        if (nested.length > 0) {
            return nested;
        }
    }

    return [];
}

function extractLessonsPayload(payload: unknown): unknown[] {
    return findCollectionByKeys(payload, [
        'lessons',
        'Lessons',
        'data',
        'Data',
        'results',
        'Results',
        'records',
        'Records',
        'value',
        'Value',
        'payload',
        'Payload',
    ]);
}

function mapFlatLessonsToSingleSection(courseId: string, lessonsPayload: unknown[]): CourseSection[] {
    const lessons = lessonsPayload
        .map((item) => normalizeLesson(item))
        .filter((lesson) => lesson.id);

    if (lessons.length === 0) {
        return [];
    }

    const normalizedLessons = lessons
        .map((lesson, index) => ({
            ...lesson,
            courseId: lesson.courseId || courseId,
            orderIndex: lesson.orderIndex || index + 1,
            title: lesson.title || `Lesson ${index + 1}`,
            durationMinutes: lesson.durationMinutes || 0,
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex);

    return [
        {
            id: `course-${courseId}-default-section`,
            courseId,
            title: 'Course Lessons',
            orderIndex: 1,
            lessons: normalizedLessons,
        },
    ];
}

async function readApiErrorMessage(response: Response, fallback: string): Promise<string> {
    try {
        const body = await response.text();
        if (!body) {
            return fallback;
        }

        try {
            const json = JSON.parse(body) as {
                message?: string;
                Message?: string;
                title?: string;
                detail?: string;
                errors?: Record<string, string[] | string>;
            };

            const primary = json.message ?? json.Message ?? json.title ?? json.detail;
            if (json.errors && typeof json.errors === 'object') {
                const entries = Object.entries(json.errors)
                    .map(([field, value]) => {
                        if (Array.isArray(value)) {
                            return `${field}: ${value.join(', ')}`;
                        }

                        return `${field}: ${String(value)}`;
                    })
                    .filter(Boolean);

                if (entries.length > 0) {
                    return primary ? `${primary} | ${entries.join(' | ')}` : entries.join(' | ');
                }
            }

            if (primary) {
                return primary;
            }

            return body;
        } catch {
            return body;
        }
    } catch {
        return fallback;
    }
}

async function postWithFallback(urls: string[], body: unknown): Promise<Response> {
    let lastResponse: Response | null = null;

    for (const url of urls) {
        const response = await apiClient.post(url, body);
        if (response.status !== 404) {
            return response;
        }

        lastResponse = response;
    }

    return lastResponse ?? new Response(null, { status: 404 });
}

async function putWithFallback(urls: string[], body: unknown): Promise<Response> {
    let lastResponse: Response | null = null;

    for (const url of urls) {
        const response = await apiClient.put(url, body);
        if (response.status !== 404) {
            return response;
        }

        lastResponse = response;
    }

    return lastResponse ?? new Response(null, { status: 404 });
}

async function deleteWithFallback(urls: string[]): Promise<Response> {
    let lastResponse: Response | null = null;

    for (const url of urls) {
        const response = await apiClient.delete(url);
        if (response.status !== 404) {
            return response;
        }

        lastResponse = response;
    }

    return lastResponse ?? new Response(null, { status: 404 });
}

export const courseContentService = {
    async getCourseCurriculum(courseId: string): Promise<CourseSection[]> {
        const lessonsResponse = await apiClient.get(`/api/Lessons/course/${courseId}`, { retries: 0 });
        if (lessonsResponse.ok) {
            const raw = (await lessonsResponse.json()) as unknown;
            const lessonItems = extractLessonsPayload(raw);
            if (Array.isArray(lessonItems) && lessonItems.length > 0) {
                return mapFlatLessonsToSingleSection(courseId, lessonItems);
            }

            return [];
        }

        if (lessonsResponse.status !== 404) {
            const error = new Error(`Không thể tải chương trình học (HTTP ${lessonsResponse.status})`) as Error & { status?: number };
            error.status = lessonsResponse.status;
            throw error;
        }

        // Backend currently does not expose curriculum endpoint in this flow.
        // Keep graceful empty response so learner UI can still render state.
        cacheCurriculumUnavailable(courseId);
        return [];
    },

    async createLesson(data: CreateLessonCommand): Promise<Lesson> {
        const trimmedTitle = data.title?.trim();
        const payload = {
            ...data,
            title: trimmedTitle,
            lessonTitle: trimmedTitle,
            Title: trimmedTitle,
            LessonTitle: trimmedTitle,
            courseId: data.courseId,
            CourseId: data.courseId,
            sectionId: data.sectionId,
            SectionId: data.sectionId,
            orderIndex: data.orderIndex,
            OrderIndex: data.orderIndex,
            durationMinutes: data.durationMinutes,
            DurationMinutes: data.durationMinutes,
            description: data.description,
            Description: data.description,
            content: data.content,
            Content: data.content,
            videoUrl: data.videoUrl,
            VideoUrl: data.videoUrl,
        };

        const response = await postWithFallback(['/api/Lessons', '/api/Lesson'], payload);
        if (!response.ok) {
            const message = await readApiErrorMessage(response, `Không thể tạo bài học (HTTP ${response.status})`);

            const error = new Error(message) as Error & { status?: number };
            error.status = response.status;
            throw error;
        }
        const raw = (await response.json()) as unknown;
        const normalized = normalizeLesson(raw);

        // Some backends return only lesson ID string or object without full fields.
        return {
            ...normalized,
            id: normalized.id || (typeof raw === 'string' ? raw : ''),
            courseId: normalized.courseId || data.courseId,
            sectionId: normalized.sectionId ?? data.sectionId,
            title: normalized.title || (trimmedTitle || ''),
            description: normalized.description ?? data.description,
            content: normalized.content ?? data.content,
            videoUrl: normalized.videoUrl ?? data.videoUrl,
            durationMinutes: normalized.durationMinutes || data.durationMinutes || 0,
            orderIndex: normalized.orderIndex || data.orderIndex,
            materials: normalized.materials || [],
        };
    },

    async updateLesson(id: string, data: Partial<Lesson>): Promise<void> {
        const response = await putWithFallback([
            `/api/Lessons/${id}`,
            `/api/Lesson/${id}`,
        ], data);
        if (!response.ok) throw new Error('Không thể cập nhật bài học');
    },

    async deleteLesson(id: string): Promise<void> {
        const response = await deleteWithFallback([
            `/api/Lessons/${id}`,
            `/api/Lesson/${id}`,
        ]);
        if (!response.ok) throw new Error('Không thể xóa bài học');
    },

    async uploadMaterial(lessonId: string, file: File): Promise<Material> {
        const normalizedLessonId = lessonId.trim();
        if (!normalizedLessonId) {
            throw new Error('Lesson chưa có ID backend hợp lệ. Vui lòng đồng bộ lesson trước khi upload tài liệu.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('File', file);
        formData.append('formFile', file);
        formData.append('materialFile', file);
        formData.append('lessonId', normalizedLessonId);
        formData.append('LessonId', normalizedLessonId);

        const response = await postWithFallback([
            `/api/Lessons/${normalizedLessonId}/material`,
            `/api/Lessons/${normalizedLessonId}/materials`,
            `/api/Lesson/${normalizedLessonId}/material`,
            `/api/Lesson/${normalizedLessonId}/materials`,
            `/api/Materials`,
            `/api/Material`,
        ], formData);

        if (response.status === 404) {
            throw new Error('Backend chưa hỗ trợ endpoint upload tài liệu cho lesson.');
        }

        if (!response.ok) {
            throw new Error(await readApiErrorMessage(response, 'Không thể tải lên tài liệu'));
        }
        try {
            const raw = (await response.json()) as unknown;
            return normalizeMaterial(raw);
        } catch {
            // Some backends return 200/204 without JSON body for upload actions.
            return {
                id: `material-${Date.now()}`,
                lessonId: normalizedLessonId,
                title: file.name,
                fileUrl: '',
                fileType: file.type || 'FILE',
                fileSize: file.size,
            };
        }
    }
};
