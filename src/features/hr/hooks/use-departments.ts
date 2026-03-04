import { useData, useMutation, mutate, type Fetcher } from '@/lib/swr/hooks'
import { apiClient } from '@/lib/api-client'
import type { Department, GetDepartmentsParams, CreateDepartmentData, UpdateDepartmentData, PaginatedResult } from '../api/department-service'

// Helper to serialize params to a string for SWR key
function serializeParams(params: GetDepartmentsParams): string {
    return JSON.stringify(params)
}

// SWR keys for cache management
export const departmentsKeys = {
    all: ['departments'] as const,
    lists: () => [...departmentsKeys.all, 'list'] as const,
    list: (params: GetDepartmentsParams) => [...departmentsKeys.lists(), serializeParams(params)] as const,
    details: () => [...departmentsKeys.all, 'detail'] as const,
    detail: (id: number) => [...departmentsKeys.details(), id] as const,
}

// Fetcher for departments list
async function fetchDepartments([, , paramsString]: readonly [string, string, string]): Promise<PaginatedResult<Department>> {
    const params = JSON.parse(paramsString) as GetDepartmentsParams

    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 20),
    })

    if (params.search) searchParams.set('search', params.search)
    if (params.isActive !== undefined) searchParams.set('isActive', String(params.isActive))

    const response = await apiClient.get(`/api/Departments?${searchParams}`)

    if (!response.ok) {
        throw new Error('Không thể tải danh sách phòng ban')
    }

    return response.json()
}

// Hook: Get departments list with pagination and caching
export function useDepartments(params: GetDepartmentsParams = {}) {
    // Use array key for SWR to support arguments in fetcher
    const key = departmentsKeys.list(params)

    const swr = useData<PaginatedResult<Department>>(key, {
        fetcher: fetchDepartments as unknown as Fetcher<PaginatedResult<Department>>
    })

    return {
        ...swr,
        departments: swr.data?.items ?? [],
        totalCount: swr.data?.totalCount ?? 0,
        currentPage: swr.data?.page ?? 1,
        totalPages: swr.data?.totalPages ?? 1,
        isLoading: !swr.error && !swr.data,
    }
}

// Hook: Get departments for dropdown (with cache)
export function useDepartmentOptions() {
    const key = departmentsKeys.list({ page: 1, pageSize: 100, isActive: true })
    const swr = useData<PaginatedResult<Department>>(key, {
        fetcher: fetchDepartments as unknown as Fetcher<PaginatedResult<Department>>
    })

    return {
        ...swr,
        options: swr.data?.items ?? [],
        isLoading: !swr.error && !swr.data,
    }
}

// Hook: Get department by ID
export function useDepartment(id: number | null) {
    const key = id ? departmentsKeys.detail(id).join('/') : null

    const swr = useData<Department>(key, {
        fetcher: async () => {
            const response = await apiClient.get(`/api/Departments/${id}`)
            if (!response.ok) throw new Error('Không thể tải thông tin phòng ban')
            return response.json()
        }
    })

    return {
        ...swr,
        department: swr.data,
        isLoading: !swr.error && !swr.data && key !== null,
    }
}

// Mutation: Create department
export function useCreateDepartment() {
    return useMutation<{ departmentId: number }, CreateDepartmentData>(
        departmentsKeys.lists().join('/'),
        async (data: CreateDepartmentData) => {
            const response = await apiClient.post(`/api/Departments`, data)

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể tạo phòng ban')
            }

            return response.json()
        },
        {
            onSuccess: () => {
                // Revalidate departments list
                // Using match mutator to invalidate all lists
                mutate(
                    (key: unknown) => Array.isArray(key) && key[0] === 'departments' && key[1] === 'list',
                    undefined,
                    { revalidate: true }
                )
            }
        }
    )
}

// Mutation: Update department
export function useUpdateDepartment() {
    return useMutation<void, { id: number; data: UpdateDepartmentData }>(
        departmentsKeys.lists().join('/'),
        async ({ id, data }) => {
            const response = await apiClient.put('/api/Departments', { ...data, id })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể cập nhật phòng ban')
            }

            return void 0
        },
        {
            onSuccess: () => {
                mutate(
                    (key: unknown) => Array.isArray(key) && key[0] === 'departments' && key[1] === 'list',
                    undefined,
                    { revalidate: true }
                )
            }
        }
    )
}

// Mutation: Delete department
export function useDeleteDepartment() {
    return useMutation<void, number>(
        departmentsKeys.lists().join('/'),
        async (id: number) => {
            const response = await apiClient.delete('/api/Departments', { id })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể xóa phòng ban')
            }

            return void 0
        },
        {
            onSuccess: () => {
                mutate(
                    (key: unknown) => Array.isArray(key) && key[0] === 'departments' && key[1] === 'list',
                    undefined,
                    { revalidate: true }
                )
            }
        }
    )
}
