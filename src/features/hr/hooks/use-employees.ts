import { config } from '@/config'
import { useData, useMutation } from '@/lib/swr/hooks'
import type { Employee, GetEmployeesParams, CreateEmployeeData, UpdateEmployeeData, PaginatedResult, EmployeeImportItem, BulkCreateResult } from '../api/employee-service'
import type { ImportEmployeesResult } from '../types/import-types'

const API_BASE = config.apiUrl

// SWR keys for cache management
export const employeesKeys = {
    all: ['employees'] as const,
    lists: () => [...employeesKeys.all, 'list'] as const,
    list: (params: GetEmployeesParams) => [...employeesKeys.lists(), params] as const,
    details: () => [...employeesKeys.all, 'detail'] as const,
    detail: (id: string) => [...employeesKeys.details(), id] as const,
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

// Helper: Get auth token without Content-Type (for file upload)
async function getAuthHeadersWithoutContentType(): Promise<HeadersInit> {
    let authToken = ''
    if (typeof window !== 'undefined') {
        authToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth_token='))
            ?.split('=')[1] || ''
    }
    return authToken ? { Authorization: `Bearer ${authToken}` } : {}
}

// Fetcher for employees list
async function fetchEmployees(key: string | readonly any[]): Promise<PaginatedResult<Employee>> {
    // Key format: ['employees', 'list', params]
    const params = Array.isArray(key) ? key[2] as GetEmployeesParams : {}

    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 20),
    })

    if (params.search) searchParams.set('search', params.search)
    if (params.departmentId) searchParams.set('departmentId', String(params.departmentId))
    if (params.status) searchParams.set('status', params.status)

    const response = await fetch(`${API_BASE}/api/Employees?${searchParams}`, {
        headers: await getAuthHeaders(),
    })

    if (!response.ok) {
        const errorText = await response.text()
        try {
            const errorJson = JSON.parse(errorText)
            throw new Error(errorJson.message || errorText || 'Không thể tải danh sách nhân viên')
        } catch {
            throw new Error(errorText || 'Không thể tải danh sách nhân viên')
        }
    }

    return response.json()
}

// Hook: Get employees list with pagination and caching
export function useEmployees(params: GetEmployeesParams = {}) {
    const key = params.page !== undefined || params.search !== undefined || params.departmentId !== undefined
        ? employeesKeys.list(params)
        : null

    const swr = useData<PaginatedResult<Employee>>(key, {
        fetcher: fetchEmployees
    })

    return {
        ...swr,
        employees: swr.data?.items ?? [],
        totalCount: swr.data?.totalCount ?? 0,
        currentPage: swr.data?.page ?? 1,
        totalPages: swr.data?.totalPages ?? 1,
        isLoading: !swr.error && !swr.data && key !== null,
    }
}

// Hook: Get employee by ID
export function useEmployee(id: string | null) {
    const key = id ? employeesKeys.detail(id) : null

    const swr = useData<Employee>(key)

    return {
        ...swr,
        employee: swr.data,
        isLoading: !swr.error && !swr.data && key !== null,
    }
}

// Mutation: Create employee
export function useCreateEmployee() {
    return useMutation<{ employeeId: string }, CreateEmployeeData>(
        employeesKeys.lists(),
        async (data) => {
            const response = await fetch(`${API_BASE}/api/Employees`, {
                method: 'POST',
                headers: await getAuthHeaders(),
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể tạo nhân viên')
            }

            return response.json()
        },
        {
            onSuccess: () => {
                // Revalidate employees list
                const { mutate } = require('@/lib/swr/hooks')
                mutate(employeesKeys.lists())
            }
        }
    )
}

// Mutation: Update employee
export function useUpdateEmployee() {
    return useMutation<void, { id: string; data: UpdateEmployeeData }>(
        employeesKeys.lists(),
        async ({ id, data }) => {
            const response = await fetch(`${API_BASE}/api/Employees/${id}`, {
                method: 'PUT',
                headers: await getAuthHeaders(),
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể cập nhật nhân viên')
            }

            return void 0
        },
        {
            onSuccess: (_, { id }) => {
                // Revalidate employees list and employee detail
                const { mutate } = require('@/lib/swr/hooks')
                mutate(employeesKeys.lists())
                mutate(employeesKeys.detail(id))
            }
        }
    )
}

// Mutation: Delete employee
export function useDeleteEmployee() {
    return useMutation<void, string>(
        employeesKeys.lists(),
        async (id) => {
            const response = await fetch(`${API_BASE}/api/Employees/${id}`, {
                method: 'DELETE',
                headers: await getAuthHeaders(),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể xóa nhân viên')
            }

            return void 0
        },
        {
            onSuccess: () => {
                const { mutate } = require('@/lib/swr/hooks')
                mutate(employeesKeys.lists())
            }
        }
    )
}

// Mutation: Bulk create employees
export function useBulkCreateEmployees() {
    return useMutation<BulkCreateResult, EmployeeImportItem[]>(
        employeesKeys.lists(),
        async (items) => {
            const response = await fetch(`${API_BASE}/api/Employees/bulk`, {
                method: 'POST',
                headers: await getAuthHeaders(),
                body: JSON.stringify({ items }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Không thể import nhân viên')
            }

            return response.json()
        },
        {
            onSuccess: () => {
                const { mutate } = require('@/lib/swr/hooks')
                mutate(employeesKeys.lists())
            }
        }
    )
}

// Mutation: Import employees from file
export function useImportEmployeesFromFile() {
    return useMutation<ImportEmployeesResult, { file: File; commit?: boolean }>(
        employeesKeys.lists(),
        async ({ file, commit = false }) => {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('commit', commit.toString())

            const response = await fetch(`${API_BASE}/api/Employees/import`, {
                method: 'POST',
                headers: await getAuthHeadersWithoutContentType(),
                body: formData,
            })

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
                const { mutate } = require('@/lib/swr/hooks')
                mutate(employeesKeys.lists())
            }
        }
    )
}
