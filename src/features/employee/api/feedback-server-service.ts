import { serverFetch } from '@/lib/server-fetch';
import type { CourseFeedbackDto, TrainerFeedbackDto } from './feedback-service';

export const feedbackServerService = {
    async getAllFeedbacks(): Promise<CourseFeedbackDto[]> {
        return serverFetch<CourseFeedbackDto[]>('/api/Feedback', {
            requireAuth: true,
            cache: 'no-store',
        });
    },

    async getTrainerFeedbacks(): Promise<TrainerFeedbackDto[]> {
        return serverFetch<TrainerFeedbackDto[]>('/api/Feedback/trainer', {
            requireAuth: true,
            cache: 'no-store',
        });
    },

    async checkFeedback(courseId: string): Promise<boolean> {
        try {
            const data = await serverFetch<{ hasSubmitted?: boolean }>(`/api/Feedback/check/${courseId}`, {
                requireAuth: true,
                cache: 'no-store',
            });
            return data.hasSubmitted === true;
        } catch {
            return false;
        }
    },
};
