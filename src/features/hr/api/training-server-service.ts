import { serverFetch } from '@/lib/server-fetch';
import { TrainingRequestsResult } from '../../dept-head/types/training-types';
import { TrainingPlansResult } from '../types/training-plan-types';
import { Course, CourseResult } from '../types/course-types';
import { Employee, PaginatedResult } from './employee-service';

export const trainingServerService = {
    async getRequests(params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        departmentId?: number;
        status?: string;
    }): Promise<TrainingRequestsResult> {
        const searchParams = new URLSearchParams({
            page: String(params?.page || 1),
            pageSize: String(params?.pageSize || 20),
            status: params?.status || 'Pending',
        });

        if (params?.search) searchParams.set('search', params.search);
        if (params?.departmentId) searchParams.set('departmentId', String(params.departmentId));

        return serverFetch<TrainingRequestsResult>(`/api/TrainingRequest?${searchParams.toString()}`, {
            requireAuth: true,
            cache: 'no-store',
        });
    },

    async getPlans(params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        status?: string;
    }): Promise<TrainingPlansResult> {
        const searchParams = new URLSearchParams({
            page: String(params?.page || 1),
            pageSize: String(params?.pageSize || 20),
        });

        if (params?.search) searchParams.set('search', params.search);
        if (params?.status) searchParams.set('status', params.status);

        return serverFetch<TrainingPlansResult>(`/api/TrainingPlan?${searchParams.toString()}`, {
            requireAuth: true,
            cache: 'no-store',
        });
    },

    async getAllCourses(params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        status?: string;
    }): Promise<CourseResult> {
        const searchParams = new URLSearchParams({
            page: String(params?.page || 1),
            pageSize: String(params?.pageSize || 20),
        });

        if (params?.search) searchParams.set('search', params.search);
        if (params?.status) searchParams.set('status', params.status);

        return serverFetch<CourseResult>(`/api/Course?${searchParams.toString()}`, {
            requireAuth: true,
            cache: 'no-store',
        });
    },

    async getCourseDetails(id: string): Promise<Course> {
        return serverFetch<Course>(`/api/Course/${id}`, {
            requireAuth: true,
            cache: 'no-store',
        });
    },

    async getEmployees(params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        departmentId?: number;
        status?: string;
    }): Promise<PaginatedResult<Employee>> {
        const searchParams = new URLSearchParams({
            page: String(params?.page || 1),
            pageSize: String(params?.pageSize || 20),
        });

        if (params?.search) searchParams.set('search', params.search);
        if (params?.departmentId) searchParams.set('departmentId', String(params.departmentId));
        if (params?.status) searchParams.set('status', params.status);

        return serverFetch<PaginatedResult<Employee>>(`/api/Employees?${searchParams.toString()}`, {
            requireAuth: true,
            cache: 'no-store',
        });
    }
};
