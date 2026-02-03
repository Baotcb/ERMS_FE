import { config } from '@/config'
import { useData, useMutation } from '@/lib/swr/hooks'
import type { Department, GetDepartmentsParams, CreateDepartmentData, UpdateDepartmentData, PaginatedResult } from '../api/department-service'

const API_BASE = config.apiUrl

// Helper to serialize params to a string for SWR key
function serializeParams(params: any): string {
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

// Helper: Get auth token
async function getAuthHeaders(): Promise<HeadersInit> {
    let authToken = ''
    if (typeof window !== 'undefined') {
        authToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth_token='))
            ?.split('=')[1] || ''
    }

    return {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
    }
}

// Fetcher for departments list
async function fetchDepartments(key: string): Promise<PaginatedResult<Department>> {
    // Key format: ['departments', 'list', 'params_json_string']
    const parts = key.split('["departments","list",')
    const paramsString = parts[1]?.replace(/"$/, '') || '{}'
    const params = JSON.parse(paramsString) as GetDepartmentsParams

    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 20),
    })

    if (params.search) searchParams.set('search', params.search)
    if (params.isActive !== undefined) searchParams.set('isActive', String(params.isActive))

    const response = await fetch(`${API_BASE}/api/Departments?${searchParams}`, {
        headers: await getAuthHeaders(),
    })

    if (!response.ok) {
        const text = await response.text()
        let errorMsg = 'Không thể tải danh sách phòng ban'
        try {
            const json = JSON.parse(text)
            errorMsg = json.message || errorMsg
        } catch {
            // ignore JSON parse error
        }
        throw new Error(errorMsg)
    }

    const text = await response.text()
    if (!text) return { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }

    try {
        return JSON.parse(text)
    } catch (e) {
        console.error('fetchDepartments JSON parse error:', e)
        throw e
    }
}

// Hook: Get departments list with pagination and caching
export function useDepartments(params: GetDepartmentsParams = {}) {
    const key = params.page !== undefined || params.search !== undefined
        ? departmentsKeys.list(params).join('/')
        : null

    const swr = useData<PaginatedResult<Department>>(key)

    return {
        ...swr,
        departments: swr.data?.items ?? [],
        totalCount: swr.data?.totalCount ?? 0,
        currentPage: swr.data?.page ?? 1,
        totalPages: swr.data?.totalPages ?? 1,
        isLoading: !swr.error && !swr.data && key !== null,
    }
}

// Hook: Get departments for dropdown (with cache)
export function useDepartmentOptions() {
    const key = departmentsKeys.list({ page: 1, pageSize: 100, isActive: true }).join('/')
    const swr = useData<PaginatedResult<Department>>(key)

    return {
        ...swr,
        options: swr.data?.items ?? [],
        isLoading: !swr.error && !swr.data,
    }
}

// Hook: Get department by ID
export function useDepartment(id: number | null) {
    const key = id ? departmentsKeys.detail(id).join('/') : null

    const swr = useData<Department>(key)

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
        async (data) => {
            const response = await fetch(`${API_BASE}/api/Departments`, {
                method: 'POST',
                headers: await getAuthHeaders(),
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể tạo phòng ban')
            }

            return response.json()
        },
        {
            onSuccess: () => {
                // Revalidate departments list
                const { mutate } = require('@/lib/swr/hooks')
                mutate(() => true, undefined, { revalidate: true })
            }
        }
    )
}

// Mutation: Update department
export function useUpdateDepartment() {
    return useMutation<void, { id: number; data: UpdateDepartmentData }>(
        departmentsKeys.lists().join('/'),
        async ({ id, data }) => {
            const response = await fetch(`${API_BASE}/api/Departments/${id}`, {
                method: 'PUT',
                headers: await getAuthHeaders(),
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể cập nhật phòng ban')
            }

            return void 0
        },
        {
            onSuccess: () => {
                // Revalidate departments list
                const { mutate } = require('@/lib/swr/hooks')
                mutate(() => true, undefined, { revalidate: true })
            }
        }
    )
}

// Mutation: Delete department
export function useDeleteDepartment() {
    return useMutation<void, number>(
        departmentsKeys.lists().join('/'),
        async (id) => {
            const response = await fetch(`${API_BASE}/api/Departments/${id}`, {
                method: 'DELETE',
                headers: await getAuthHeaders(),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể xóa phòng ban')
            }

            return void 0
        },
        {
            onSuccess: () => {
                const { mutate } = require('@/lib/swr/hooks')
                mutate(() => true, undefined, { revalidate: true })
            }
        }
    )
}
