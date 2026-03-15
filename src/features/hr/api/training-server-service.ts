import { serverFetch } from '@/lib/server-fetch';
import { TrainingRequestsResult } from '../../dept-head/types/training-types';
import { TrainingPlansResult } from '../types/training-plan-types';
import { Course, CourseResult } from '../types/course-types';
import { Employee, PaginatedResult } from './employee-service';

export interface CourseProgressResult {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    quizUnlocked: boolean;
}

interface DepartmentTrainingResultRecord {
    id: string;
    employeeName: string;
    employeeEmail: string;
    departmentName: string;
    courseName: string;
    assignedAt: string;
    progressPercentage: number;
    quizScore: number | null;
    learningStatus: 'InProgress' | 'Completed' | 'NotStarted';
    evaluationStatus: 'Passed' | 'Failed' | 'Pending';
    note?: string;
}

export interface DepartmentTrainingResultsResponse {
    items: DepartmentTrainingResultRecord[];
    sourceEndpoint: string | null;
}

function pickString(source: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }

    return '';
}

function pickNumber(source: Record<string, unknown>, ...keys: string[]): number | null {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === 'string' && value.trim()) {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }

    return null;
}

function normalizeLearningStatus(value: string): DepartmentTrainingResultRecord['learningStatus'] {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'completed') {
        return 'Completed';
    }

    if (normalized === 'inprogress' || normalized === 'in_progress' || normalized === 'in progress') {
        return 'InProgress';
    }

    return 'NotStarted';
}

function normalizeEvaluationStatus(value: string): DepartmentTrainingResultRecord['evaluationStatus'] {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'passed') {
        return 'Passed';
    }

    if (normalized === 'failed') {
        return 'Failed';
    }

    return 'Pending';
}

function normalizeDepartmentTrainingResult(item: unknown, index: number): DepartmentTrainingResultRecord | null {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const record = item as Record<string, unknown>;
    const employeeName = pickString(record, 'employeeName', 'EmployeeName', 'fullName', 'FullName', 'employeeFullName', 'EmployeeFullName', 'name', 'Name');
    const courseName = pickString(record, 'courseName', 'CourseName', 'title', 'Title');

    if (!employeeName && !courseName) {
        return null;
    }

    return {
        id: pickString(record, 'id', 'Id') || `department-training-result-${index}`,
        employeeName,
        employeeEmail: pickString(record, 'employeeEmail', 'EmployeeEmail', 'email', 'Email', 'employeeUsername', 'EmployeeUsername'),
        departmentName: pickString(record, 'departmentName', 'DepartmentName', 'department', 'Department'),
        courseName,
        assignedAt: pickString(record, 'assignedAt', 'AssignedAt', 'enrolledAt', 'EnrolledAt', 'createdAt', 'CreatedAt') || new Date(0).toISOString(),
        progressPercentage: Math.max(0, Math.min(100, pickNumber(record, 'progressPercentage', 'ProgressPercentage', 'progress', 'Progress', 'completionRate', 'CompletionRate') ?? 0)),
        quizScore: pickNumber(record, 'quizScore', 'QuizScore', 'score', 'Score', 'quizResult', 'QuizResult'),
        learningStatus: normalizeLearningStatus(pickString(record, 'learningStatus', 'LearningStatus', 'status', 'Status') || 'NotStarted'),
        evaluationStatus: normalizeEvaluationStatus(pickString(record, 'evaluationStatus', 'EvaluationStatus', 'result', 'Result') || 'Pending'),
        note: pickString(record, 'note', 'Note', 'remarks', 'Remarks', 'comment', 'Comment') || undefined,
    };
}

function findArrayPayload(payload: unknown): unknown[] {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (!payload || typeof payload !== 'object') {
        return [];
    }

    const record = payload as Record<string, unknown>;
    const candidateKeys = ['items', 'data', 'results', 'records', 'value', 'payload'];

    for (const key of candidateKeys) {
        const value = record[key];
        if (Array.isArray(value)) {
            return value;
        }
    }

    for (const key of candidateKeys) {
        const value = record[key];
        const nested = findArrayPayload(value);
        if (nested.length > 0) {
            return nested;
        }
    }

    return [];
}

function extractDepartmentTrainingResults(payload: unknown): DepartmentTrainingResultRecord[] {
    const collection = findArrayPayload(payload);

    return collection
        .map((item, index) => normalizeDepartmentTrainingResult(item, index))
        .filter((item): item is DepartmentTrainingResultRecord => item !== null);
}

function normalizeDepartmentTrainingResultsError(error: unknown): Error {
    const fallback = 'Không thể tải kết quả đào tạo theo phòng ban.';

    if (!(error instanceof Error)) {
        return new Error(fallback);
    }

    const message = error.message || fallback;

    if (
        message.includes("department-training-report")
        || message.includes("department-training-results")
        || message.includes('The value')
    ) {
        return new Error('Backend chưa hỗ trợ endpoint kết quả đào tạo theo phòng ban hoặc route đang bị map sai.');
    }

    return new Error(message);
}

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

    async getCourseProgress(courseId: string): Promise<CourseProgressResult> {
        return serverFetch<CourseProgressResult>(`/api/Course/${courseId}/progress`, {
            requireAuth: true,
            cache: 'no-store',
        });
    },

    async getDepartmentTrainingResults(): Promise<DepartmentTrainingResultsResponse> {
        const endpoints = ['/api/Course/department-training-results'];

        let lastError: Error | null = null;
        let emptyEndpoint: string | null = null;

        for (const endpoint of endpoints) {
            try {
                const payload = await serverFetch<unknown>(endpoint, {
                    requireAuth: true,
                    cache: 'no-store',
                });

                const items = extractDepartmentTrainingResults(payload);
                if (items.length > 0) {
                    return { items, sourceEndpoint: endpoint };
                }

                emptyEndpoint = endpoint;
            } catch (error) {
                lastError = normalizeDepartmentTrainingResultsError(error);
            }
        }

        if (emptyEndpoint) {
            return { items: [], sourceEndpoint: emptyEndpoint };
        }

        throw lastError ?? new Error('Không thể tải kết quả đào tạo theo phòng ban.');
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
