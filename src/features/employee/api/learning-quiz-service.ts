import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import type {
    CourseProgressDto,
    LearnerQuizQuestionDto,
    LearnerQuizResultDto,
    SubmitLearnerAnswerCommand,
    UpdateLessonProgressCommand,
} from '@/features/employee/types/learning-quiz-types';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
    try {
        const body = await response.text();
        if (!body) {
            return fallback;
        }

        try {
            const json = JSON.parse(body);
            return json.message ?? json.Message ?? json.title ?? json.detail ?? fallback;
        } catch {
            return body;
        }
    } catch {
        return fallback;
    }
}

interface ParsedErrorDetail {
    message: string;
    traceId?: string;
    requestId?: string;
    path?: string;
    code?: string;
    validationErrors?: string[];
    rawBody?: string;
}

function normalizeValidationErrors(errors: unknown): string[] {
    if (!errors) {
        return [];
    }

    if (Array.isArray(errors)) {
        return errors.map((item) => String(item)).filter(Boolean);
    }

    if (typeof errors === 'object') {
        return Object.entries(errors as Record<string, unknown>).flatMap(([field, value]) => {
            if (Array.isArray(value)) {
                return value.map((item) => `${field}: ${String(item)}`);
            }

            if (value != null) {
                return [`${field}: ${String(value)}`];
            }

            return [];
        });
    }

    return [String(errors)];
}

async function readErrorDetail(response: Response, fallback: string): Promise<ParsedErrorDetail> {
    try {
        const body = await response.text();
        if (!body) {
            const headerTraceId = response.headers.get('x-trace-id') ?? response.headers.get('trace-id') ?? undefined;
            const headerRequestId = response.headers.get('x-request-id') ?? response.headers.get('request-id') ?? undefined;
            return { message: fallback, traceId: headerTraceId, requestId: headerRequestId };
        }

        try {
            const json = JSON.parse(body) as {
                message?: string;
                Message?: string;
                title?: string;
                detail?: string;
                traceId?: string;
                traceID?: string;
                requestId?: string;
                requestID?: string;
                path?: string;
                instance?: string;
                code?: string;
                errorCode?: string;
                errors?: unknown;
            };

            const message = json.message ?? json.Message ?? json.title ?? json.detail ?? fallback;
            const traceId = json.traceId ?? json.traceID ?? response.headers.get('x-trace-id') ?? response.headers.get('trace-id') ?? undefined;
            const requestId = json.requestId ?? json.requestID ?? response.headers.get('x-request-id') ?? response.headers.get('request-id') ?? undefined;
            const path = json.path ?? json.instance;
            const code = json.code ?? json.errorCode;
            const validationErrors = normalizeValidationErrors(json.errors);

            return { message, traceId, requestId, path, code, validationErrors, rawBody: body };
        } catch {
            return {
                message: body,
                traceId: response.headers.get('x-trace-id') ?? response.headers.get('trace-id') ?? undefined,
                requestId: response.headers.get('x-request-id') ?? response.headers.get('request-id') ?? undefined,
                rawBody: body,
            };
        }
    } catch {
        return { message: fallback };
    }
}

function mapStartQuizErrorMessage(message: string, status: number): string {
    const normalized = message.toLowerCase();

    if (normalized.includes('chưa đăng ký khóa học')) {
        return 'Bạn chưa được phân công vào khóa học này. Vui lòng liên hệ quản lý để được gán khóa học.';
    }

    if (normalized.includes('không tìm thấy bài kiểm tra')) {
        return 'Khóa học này chưa có bài thi cuối khóa hoặc quiz đã bị vô hiệu hóa. Vui lòng liên hệ trainer/HR.';
    }

    if (normalized.includes('you must complete all lessons before starting the quiz')) {
        return 'Bạn cần hoàn thành toàn bộ bài học trước khi bắt đầu quiz.';
    }

    if (normalized.includes('đã đạt tối đa số lần làm bài')) {
        return 'Bạn đã dùng hết số lượt làm bài cho quiz này.';
    }

    if (normalized.includes('unauthorized') || normalized.includes('chưa được xác thực')) {
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }

    // Backend currently can throw null-reference in StartQuiz when user account is not mapped to Employee.
    if (status >= 500) {
        return 'Không thể bắt đầu bài thi do lỗi hệ thống hoặc tài khoản chưa được map nhân viên. Vui lòng liên hệ HR/Admin kiểm tra tài khoản Employee và phân công khóa học.';
    }

    return message;
}

function mapUpdateLessonProgressErrorMessage(message: string, status: number): string {
    const normalized = message.toLowerCase();

    if (normalized.includes('không tìm thấy bài học')) {
        return 'Không tìm thấy lesson trên hệ thống backend. Có thể bạn đang học bằng dữ liệu fallback/local, vui lòng liên hệ trainer để đồng bộ curriculum.';
    }

    if (normalized.includes('không tìm thấy đăng ký khóa học') || normalized.includes('chưa đăng ký khóa học')) {
        return 'Bạn chưa được phân công vào khóa học này trên hệ thống backend. Vui lòng liên hệ HR/Trainer.';
    }

    if (normalized.includes('tài khoản chưa được liên kết với hồ sơ nhân viên')) {
        return 'Tài khoản chưa được liên kết với hồ sơ nhân viên. Vui lòng liên hệ HR/Admin.';
    }

    if (normalized.includes('unauthorized') || normalized.includes('chưa được xác thực')) {
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }

    if (status >= 500) {
        return 'Không thể cập nhật tiến độ bài học do lỗi hệ thống backend. Vui lòng thử lại hoặc liên hệ HR/Admin.';
    }

    return message;
}

export const learningQuizService = {
    async getCourseProgress(courseId: string): Promise<CourseProgressDto> {
        const response = await apiClient.get(`/api/Course/${courseId}/progress`);
        if (!response.ok) {
            throw new Error(await readErrorMessage(response, 'Không thể tải tiến độ khóa học.'));
        }
        return response.json();
    },

    async updateLessonProgress(data: UpdateLessonProgressCommand): Promise<void> {
        const response = await apiClient.post('/api/Lessons/lesson-progress', data, { retries: 0 });
        if (!response.ok) {
            const detail = await readErrorDetail(response, 'Không thể cập nhật tiến độ bài học.');
            const mapped = mapUpdateLessonProgressErrorMessage(detail.message, response.status);
            const debugInfo: string[] = [`status=${response.status}`];

            if (detail.traceId) {
                debugInfo.push(`traceId=${detail.traceId}`);
            }
            if (detail.requestId && detail.requestId !== detail.traceId) {
                debugInfo.push(`requestId=${detail.requestId}`);
            }
            if (detail.path) {
                debugInfo.push(`path=${detail.path}`);
            }
            if (detail.code) {
                debugInfo.push(`code=${detail.code}`);
            }

            const validationSuffix = detail.validationErrors && detail.validationErrors.length > 0
                ? ` Chi tiết: ${detail.validationErrors.slice(0, 3).join(' | ')}`
                : '';

            logger.error('Update lesson progress failed', undefined, {
                endpoint: '/api/Lessons/lesson-progress',
                payload: data,
                status: response.status,
                message: detail.message,
                traceId: detail.traceId,
                requestId: detail.requestId,
                path: detail.path,
                code: detail.code,
                validationErrors: detail.validationErrors,
                rawBody: detail.rawBody,
            });

            throw new Error(`${mapped}${validationSuffix} [${debugInfo.join(', ')}]`);
        }
    },

    async startQuiz(courseId: string): Promise<{ attemptId: string }> {
        const response = await apiClient.post(`/api/Course/${courseId}/quizzes/start`, {}, { retries: 0 });
        if (!response.ok) {
            const rawMessage = await readErrorMessage(response, 'Không thể bắt đầu bài thi.');
            throw new Error(mapStartQuizErrorMessage(rawMessage, response.status));
        }

        const result = await response.json() as string | { attemptId?: string; id?: string };
        if (typeof result === 'string') {
            return { attemptId: result };
        }

        return { attemptId: result.attemptId ?? result.id ?? '' };
    },

    async getQuizQuestions(attemptId: string): Promise<LearnerQuizQuestionDto[]> {
        const response = await apiClient.get(`/api/quizzes/${attemptId}/questions`);
        if (!response.ok) {
            throw new Error(await readErrorMessage(response, 'Không thể tải câu hỏi bài thi.'));
        }
        return response.json();
    },

    async submitAnswer(attemptId: string, data: SubmitLearnerAnswerCommand): Promise<void> {
        const response = await apiClient.post(`/api/quizzes/${attemptId}/answers`, data);
        if (!response.ok) {
            throw new Error(await readErrorMessage(response, 'Không thể lưu câu trả lời.'));
        }
    },

    async submitQuiz(attemptId: string): Promise<LearnerQuizResultDto> {
        const response = await apiClient.post(`/api/quizzes/attempts/${attemptId}/submit`, {});
        if (!response.ok) {
            throw new Error(await readErrorMessage(response, 'Không thể nộp bài thi.'));
        }
        return response.json();
    },

    async getQuizResult(courseId: string): Promise<{ score: number; isPassed: boolean; correctAnswers: number; totalQuestions: number; attemptCount: number; maxAttempts: number | null } | null> {
        try {
            const response = await apiClient.get(`/api/Course/${courseId}/quiz-result`);
            if (response.status === 204 || !response.ok) return null;
            return response.json();
        } catch {
            return null;
        }
    },
};
