import { useData, useMutation, mutate, type Fetcher } from '@/lib/swr/hooks'
import { apiClient } from '@/lib/api-client'
import type {
    Employee,
    GetEmployeesParams,
    CreateEmployeeData,
    UpdateEmployeeData,
    PaginatedResult,
} from '../api/employee-service'
import type { ImportEmployeesResult } from '../types/import-types'

// SWR keys for cache management
export const employeesKeys = {
    all: ['employees'] as const,
    lists: () => [...employeesKeys.all, 'list'] as const,
    list: (params: GetEmployeesParams) => [...employeesKeys.lists(), JSON.stringify(params)] as const,
    details: () => [...employeesKeys.all, 'detail'] as const,
    detail: (id: string) => [...employeesKeys.details(), id] as const,
}

async function fetchEmployees([, , paramsString]: readonly [string, string, string]): Promise<PaginatedResult<Employee>> {
    const params = JSON.parse(paramsString) as GetEmployeesParams

    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 20),
    })

    if (params.search) searchParams.set('search', params.search)
    if (params.departmentId) searchParams.set('departmentId', String(params.departmentId))
    if (params.status) searchParams.set('status', params.status)

    const response = await apiClient.get(`/api/Employees?${searchParams}`)

    if (!response.ok) {
        throw new Error('Không thể tải danh sách nhân viên')
    }

    return response.json()
}

export function useEmployees(params: GetEmployeesParams = {}) {
    const key = employeesKeys.list(params)

    const swr = useData<PaginatedResult<Employee>>(key, {
        fetcher: fetchEmployees as unknown as Fetcher<PaginatedResult<Employee>>,
    })

    return {
        ...swr,
        employees: swr.data?.items ?? [],
        totalCount: swr.data?.totalCount ?? 0,
        currentPage: swr.data?.page ?? 1,
        totalPages: swr.data?.totalPages ?? 1,
        isLoading: !swr.error && !swr.data,
    }
}

export function useEmployee(id: string | null) {
    const key = id ? employeesKeys.detail(id) : null

    const swr = useData<Employee>(key, {
        fetcher: async ([, , employeeId]) => {
            if (typeof employeeId !== 'string') {
                throw new Error('Employee ID is invalid')
            }

            const response = await apiClient.get(`/api/Employees/detail?id=${employeeId}`)
            if (!response.ok) throw new Error('Không thể tải thông tin nhân viên')
            return response.json()
        },
    })

    return {
        ...swr,
        employee: swr.data,
        isLoading: !swr.error && !swr.data && key !== null,
    }
}

export function useCreateEmployee() {
    return useMutation<{ employeeId: string }, CreateEmployeeData>(
        employeesKeys.lists().join('/'),
        async (data) => {
            const response = await apiClient.post('/api/Employees', data)

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể tạo nhân viên')
            }

            return response.json()
        },
        {
            onSuccess: () => {
                mutate(
                    (key) => Array.isArray(key) && key[0] === 'employees' && key[1] === 'list',
                    undefined,
                    { revalidate: true }
                )
            },
        }
    )
}

export function useUpdateEmployee() {
    return useMutation<void, { id: string; data: UpdateEmployeeData }>(
        employeesKeys.lists().join('/'),
        async ({ id, data }) => {
            const response = await apiClient.put('/api/Employees', { ...data, id })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể cập nhật nhân viên')
            }

            return void 0
        },
        {
            onSuccess: () => {
                mutate(
                    (key) => Array.isArray(key) && key[0] === 'employees' && key[1] === 'list',
                    undefined,
                    { revalidate: true }
                )
                mutate(
                    (key) => Array.isArray(key) && key[0] === 'employees' && key[1] === 'detail',
                    undefined,
                    { revalidate: true }
                )
            },
        }
    )
}

export function useDeleteEmployee() {
    return useMutation<void, string>(
        employeesKeys.lists().join('/'),
        async (id) => {
            const response = await apiClient.delete('/api/Employees', { id })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể xóa nhân viên')
            }

            return void 0
        },
        {
            onSuccess: () => {
                mutate(
                    (key) => Array.isArray(key) && key[0] === 'employees' && key[1] === 'list',
                    undefined,
                    { revalidate: true }
                )
            },
        }
    )
}

export function useImportEmployeesFromFile() {
    return useMutation<ImportEmployeesResult, { file: File; commit?: boolean }>(
        employeesKeys.lists().join('/'),
        async ({ file, commit = false }) => {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('commit', commit.toString())

            const response = await apiClient.post('/api/Employees/import', formData)

            if (!response.ok) {
                try {
                    const errorResult = await response.json()
                    if (errorResult.errors || errorResult.failedCount) {
                        return errorResult
                    }
                    throw new Error(errorResult.message || 'Không thể import nhân viên')
                } catch {
                    throw new Error('Lỗi server không xác định')
                }
            }

            return response.json()
        },
        {
            onSuccess: () => {
                mutate(
                    (key) => Array.isArray(key) && key[0] === 'employees' && key[1] === 'list',
                    undefined,
                    { revalidate: true }
                )
            },
        }
    )
}
