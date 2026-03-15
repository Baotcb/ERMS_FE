import { apiClient } from '@/lib/api-client';
import type {
    CourseProgressDto,
    LearnerQuizQuestionDto,
    LearnerQuizResultDto,
    SubmitLearnerAnswerCommand,
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

function mapStartQuizErrorMessage(message: string, status: number): string {
    const normalized = message.toLowerCase();

    if (normalized.includes('chưa đăng ký khóa học')) {
        return 'Bạn chưa được phân công vào khóa học này. Vui lòng liên hệ quản lý để được gán khóa học.';
    }

    if (normalized.includes('không tìm thấy bài kiểm tra')) {
        return 'Quiz ID không tồn tại hoặc quiz đã bị vô hiệu hóa. Vui lòng kiểm tra lại Quiz ID với trainer/HR.';
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

export const learningQuizService = {
    async getCourseProgress(courseId: string): Promise<CourseProgressDto> {
        const response = await apiClient.get(`/api/Course/${courseId}/progress`);
        if (!response.ok) {
            throw new Error(await readErrorMessage(response, 'Không thể tải tiến độ khóa học.'));
        }
        return response.json();
    },

    async startQuiz(quizId: string): Promise<{ attemptId: string }> {
        const response = await apiClient.post(`/api/quizzes/${quizId}/start`, {}, { retries: 0 });
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
};
