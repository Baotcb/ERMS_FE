import { apiClient } from '@/lib/api-client';

export interface CourseFeedbackDto {
    id: string;
    courseName: string;
    courseCode: string;
    trainerEmail: string;
    employeeName: string;
    employeeEmail: string;
    departmentName: string;
    courseRating: number;
    trainerRating: number;
    comment: string | null;
    isAnonymous: boolean;
    createdAt: string;
}

export interface TrainerFeedbackDto {
    id: string;
    courseName: string;
    courseCode: string;
    employeeName: string;
    courseRating: number;
    trainerRating: number;
    comment: string | null;
    createdAt: string;
}

export interface SubmitFeedbackPayload {
    courseId: string;
    courseRating: number;
    trainerRating: number;
    comment?: string;
    isAnonymous: boolean;
}

export interface FeedbackReplyDto {
    id: number;
    parentReplyId: number | null;
    replyContent: string;
    replyBy: string;
    replyByName: string | null;
    replyByAvatarUrl: string | null;
    isAnonymous: boolean;
    createdAt: string;
    children: FeedbackReplyDto[];
}

export interface ReplyFeedbackPayload {
    replyContent: string;
    parentReplyId?: number | null;
    isAnonymous: boolean;
}

export interface UpdateReplyPayload {
    replyContent: string;
}

export const feedbackService = {
    async submitFeedback(payload: SubmitFeedbackPayload) {
        const res = await apiClient.post('/api/Feedback', payload);
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || 'Không thể gửi đánh giá.');
        }
        return res.json();
    },

    async getAllFeedbacks(): Promise<CourseFeedbackDto[]> {
        const res = await apiClient.get('/api/Feedback');
        if (!res.ok) throw new Error('Không thể tải danh sách đánh giá.');
        return res.json();
    },

    async getTrainerFeedbacks(): Promise<TrainerFeedbackDto[]> {
        const res = await apiClient.get('/api/Feedback/trainer');
        if (!res.ok) throw new Error('Không thể tải đánh giá của bạn.');
        return res.json();
    },

    async checkFeedback(courseId: string): Promise<boolean> {
        try {
            const res = await apiClient.get(`/api/Feedback/check/${courseId}`);
            if (!res.ok) return false;
            const data = await res.json() as { hasSubmitted?: boolean };
            return data.hasSubmitted === true;
        } catch {
            return false;
        }
    },

    async replyFeedback(feedbackId: string, payload: ReplyFeedbackPayload) {
        const res = await apiClient.post(`/api/Feedback/${feedbackId}/replies`, payload);
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || 'Không thể gửi phản hồi.');
        }
        return res.json();
    },

    async getFeedbackReplies(feedbackId: string | number): Promise<FeedbackReplyDto[]> {
        const res = await apiClient.get(`/api/Feedback/${feedbackId}/replies`);
        if (!res.ok) throw new Error('Không thể tải danh sách phản hồi.');
        return res.json();
    },

    async updateReply(replyId: number, payload: UpdateReplyPayload) {
        const res = await apiClient.put(`/api/Feedback/replies/${replyId}`, payload);
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || 'Không thể cập nhật phản hồi.');
        }
        return res.json();
    },

    async deleteReply(replyId: number) {
        const res = await apiClient.delete(`/api/Feedback/replies/${replyId}`);
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message || 'Không thể xóa phản hồi.');
        }
        return res.json();
    },
};
