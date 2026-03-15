import { apiClient } from '@/lib/api-client';
import { CourseSection, Lesson, CreateLessonCommand, Material } from '../types/course-content-types';

export const courseContentService = {
    async getCourseCurriculum(courseId: string): Promise<CourseSection[]> {
        const response = await apiClient.get(`/api/Course/${courseId}/curriculum`, { retries: 0 });
        if (response.status === 404) {
            // Some environments do not expose curriculum endpoint yet.
            // Treat as empty curriculum so trainer can still continue the flow.
            return [];
        }
        if (!response.ok) {
            const error = new Error(`Không thể tải chương trình học (HTTP ${response.status})`) as Error & { status?: number };
            error.status = response.status;
            throw error;
        }
        return response.json();
    },

    async createLesson(data: CreateLessonCommand): Promise<Lesson> {
        const response = await apiClient.post('/api/Lesson', data);
        if (!response.ok) {
            let message = `Không thể tạo bài học (HTTP ${response.status})`;
            try {
                const body = await response.text();
                if (body) {
                    const json = JSON.parse(body);
                    message = json.message ?? json.title ?? json.detail ?? body ?? message;
                }
            } catch {
                // keep default message
            }

            const error = new Error(message) as Error & { status?: number };
            error.status = response.status;
            throw error;
        }
        return response.json();
    },

    async updateLesson(id: string, data: Partial<Lesson>): Promise<void> {
        const response = await apiClient.put(`/api/Lesson/${id}`, data);
        if (!response.ok) throw new Error('Không thể cập nhật bài học');
    },

    async deleteLesson(id: string): Promise<void> {
        const response = await apiClient.delete(`/api/Lesson/${id}`);
        if (!response.ok) throw new Error('Không thể xóa bài học');
    },

    async uploadMaterial(lessonId: string, file: File): Promise<Material> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post(`/api/Lesson/${lessonId}/material`, formData, {
            // Note: apiClient might need to NOT set Content-Type to application/json for FormData
            // If it does, we need a custom fetch here.
        });

        if (!response.ok) throw new Error('Không thể tải lên tài liệu');
        return response.json();
    }
};
