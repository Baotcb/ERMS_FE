import { apiClient } from '@/lib/api-client';
import { Course, CourseResult, CreateCourseCommand, UpdateCourseCommand } from '../types/course-types';

export const courseService = {
    async getAllCourses(params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        status?: string;
        trainerId?: string;
    }): Promise<CourseResult> {
        const searchParams = new URLSearchParams({
            page: String(params?.page || 1),
            pageSize: String(params?.pageSize || 20),
        });

        if (params?.search) searchParams.set('search', params.search);
        if (params?.status) searchParams.set('status', params.status);
        if (params?.trainerId) searchParams.set('trainerId', params.trainerId);

        const response = await apiClient.get(`/api/Course?${searchParams}`);
        if (!response.ok) throw new Error('Không thể tải danh sách khóa học');
        return response.json();
    },

    async getCourseDetails(id: string): Promise<Course> {
        const response = await apiClient.get(`/api/Course/${id}`);
        if (!response.ok) throw new Error('Không thể tải chi tiết khóa học');
        return response.json();
    },

    async createCourse(data: CreateCourseCommand): Promise<{ courseId: string }> {
        const response = await apiClient.post('/api/Course', data);
        if (!response.ok) throw new Error('Không thể tạo khóa học');
        return response.json();
    },

    async updateCourse(id: string, data: UpdateCourseCommand): Promise<{ ok: boolean }> {
        const response = await apiClient.put(`/api/Course/${id}`, data);
        if (!response.ok) throw new Error('Không thể cập nhật khóa học');
        return { ok: true };
    },

    async assignEmployees(courseId: string, employeeIds: string[]): Promise<{ totalAssigned: number }> {
        const response = await apiClient.post(`/api/Course/${courseId}/assign-employees`, employeeIds);
        if (!response.ok) throw new Error('Không thể phân công nhân viên');
        return response.json();
    },

    async publishCourse(id: string): Promise<{ ok: boolean }> {
        const response = await apiClient.post(`/api/Course/${id}/publish`, {});
        if (!response.ok) throw new Error('Không thể công khai khóa học');
        return { ok: true };
    }
};
