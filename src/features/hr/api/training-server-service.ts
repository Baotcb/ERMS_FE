import { serverFetch } from '@/lib/server-fetch';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { pickString, pickNumber, findArrayInPayload } from '@/lib/api-normalizer';
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
    courseCode: string;
    assignedAt: string;
    completedAt: string | null;
    progressPercentage: number;
    totalLessons: number;
    completedLessons: number;
    quizScore: number | null;
    attemptCount: number;
    learningStatus: 'InProgress' | 'Completed' | 'NotStarted';
    evaluationStatus: 'Passed' | 'Failed' | 'Pending';
    note?: string;
}

export interface DepartmentTrainingResultsResponse {
    items: DepartmentTrainingResultRecord[];
    sourceEndpoint: string | null;
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
        courseCode: pickString(record, 'courseCode', 'CourseCode'),
        assignedAt: pickString(record, 'assignedAt', 'AssignedAt', 'enrolledAt', 'EnrolledAt', 'createdAt', 'CreatedAt') || new Date(0).toISOString(),
        completedAt: pickString(record, 'completedAt', 'CompletedAt') || null,
        progressPercentage: Math.max(0, Math.min(100, pickNumber(record, 0, 'progressPercentage', 'ProgressPercentage', 'progress', 'Progress', 'completionRate', 'CompletionRate'))),
        totalLessons: pickNumber(record, 0, 'totalLessons', 'TotalLessons'),
        completedLessons: pickNumber(record, 0, 'completedLessons', 'CompletedLessons'),
        quizScore: pickNumber(record, 0, 'quizScore', 'QuizScore', 'score', 'Score', 'quizResult', 'QuizResult') || null,
        attemptCount: pickNumber(record, 0, 'attemptCount', 'AttemptCount'),
        learningStatus: normalizeLearningStatus(pickString(record, 'learningStatus', 'LearningStatus', 'status', 'Status') || 'NotStarted'),
        evaluationStatus: normalizeEvaluationStatus(pickString(record, 'evaluationStatus', 'EvaluationStatus', 'result', 'Result') || 'Pending'),
        note: pickString(record, 'note', 'Note', 'remarks', 'Remarks', 'comment', 'Comment') || undefined,
    };
}

function extractDepartmentTrainingResults(payload: unknown): DepartmentTrainingResultRecord[] {
    const collection = findArrayInPayload(payload, ['items', 'data', 'results', 'records', 'value', 'payload']);

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
            pageSize: String(params?.pageSize || DEFAULT_PAGE_SIZE),
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
            pageSize: String(params?.pageSize || DEFAULT_PAGE_SIZE),
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
            pageSize: String(params?.pageSize || DEFAULT_PAGE_SIZE),
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

    async getCourseEnrolledEmployees(courseId: string): Promise<string[]> {
        try {
            return await serverFetch<string[]>(`/api/Course/${courseId}/enrolled-employees`, {
                requireAuth: true,
                cache: 'no-store',
            });
        } catch {
            return [];
        }
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
            pageSize: String(params?.pageSize || DEFAULT_PAGE_SIZE),
        });

        if (params?.search) searchParams.set('search', params.search);
        if (params?.departmentId) searchParams.set('departmentId', String(params.departmentId));
        if (params?.status) searchParams.set('status', params.status);

        return serverFetch<PaginatedResult<Employee>>(`/api/Employees?${searchParams.toString()}`, {
            requireAuth: true,
            cache: 'no-store',
        });
    },

    async getQuizResult(courseId: string): Promise<{ score: number; isPassed: boolean; correctAnswers: number; totalQuestions: number; attemptCount: number; maxAttempts: number | null; completedAt: string | null; attemptId?: string } | null> {
        try {
            return await serverFetch<{ score: number; isPassed: boolean; correctAnswers: number; totalQuestions: number; attemptCount: number; maxAttempts: number | null; completedAt: string | null; attemptId?: string }>(`/api/Course/${courseId}/quiz-result`, {
                requireAuth: true,
                cache: 'no-store',
            });
        } catch {
            return null;
        }
    },
};
