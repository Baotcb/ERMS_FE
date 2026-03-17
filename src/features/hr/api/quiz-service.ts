import { apiClient } from '@/lib/api-client';
import type { CreateQuizCommand, CreateQuizQuestionCommand } from '../types/quiz-types';

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

export const quizService = {
    async getCourseQuiz(courseId: string): Promise<{ quizId: string | null; hasFinalQuiz: boolean }> {
        const response = await apiClient.get(`/api/Course/${courseId}`);
        if (!response.ok) {
            throw new Error('Không thể tải trạng thái quiz của khóa học');
        }

        const result = await response.json() as { finalQuizId?: string | null; hasFinalQuiz?: boolean };
        return {
            quizId: result.finalQuizId ?? null,
            hasFinalQuiz: Boolean(result.hasFinalQuiz),
        };
    },

    async createQuiz(courseId: string, data: CreateQuizCommand): Promise<{ quizId: string }> {
        const response = await apiClient.post(`/api/Course/${courseId}/quizzes`, data);
        if (!response.ok) {
            const fallback = `Không thể tạo bài thi cuối khóa (HTTP ${response.status}).`;
            const rawMessage = await readErrorMessage(response, fallback);

            const lowerRawMessage = rawMessage.toLowerCase();
            const looksLikeDuplicateQuizError =
                response.status === 500 && (
                    lowerRawMessage.includes('duplicate') ||
                    lowerRawMessage.includes('unique') ||
                    lowerRawMessage.includes('courseid') ||
                    lowerRawMessage.includes('quizzes')
                );

            if (looksLikeDuplicateQuizError || rawMessage === fallback) {
                throw new Error('Không thể tạo bài thi cuối khóa: khóa học này có thể đã có quiz trên hệ thống (mỗi khóa chỉ có 1 quiz).');
            }

            throw new Error(rawMessage);
        }

        const result = await response.json() as string | { quizId?: string; id?: string };
        if (typeof result === 'string') {
            return { quizId: result };
        }

        const quizId = result.quizId ?? result.id;
        if (!quizId) {
            throw new Error('Tạo bài thi thành công nhưng không nhận được QuizId từ backend.');
        }

        return { quizId };
    },

    async createQuestion(quizId: string, data: CreateQuizQuestionCommand): Promise<{ questionId: string }> {
        const response = await apiClient.post(`/api/quizzes/${quizId}/questions`, data);
        if (!response.ok) {
            throw new Error(await readErrorMessage(response, 'Không thể tạo câu hỏi quiz.'));
        }

        const result = await response.json() as string | { questionId?: string; id?: string };
        if (typeof result === 'string') {
            return { questionId: result };
        }

        return { questionId: result.questionId ?? result.id ?? '' };
    },

    async importQuestions(quizId: string, file: File): Promise<{ importedCount: number }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post(`/api/quizzes/${quizId}/import-excel`, formData);
        if (!response.ok) {
            throw new Error(await readErrorMessage(response, 'Không thể import câu hỏi từ file Excel.'));
        }

        const result = await response.json() as number | { importedCount?: number; count?: number };
        if (typeof result === 'number') {
            return { importedCount: result };
        }

        return { importedCount: result.importedCount ?? result.count ?? 0 };
    },
};