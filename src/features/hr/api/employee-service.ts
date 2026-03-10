import { apiClient } from '@/lib/api-client'
import type { ImportEmployeesResult } from '../types/import-types'

// Types
export interface Employee {
    id: string
    employeeCode: string
    fullName: string
    email: string
    phone: string | null
    departmentId: number | null
    departmentName: string | null
    position: string | null
    employmentType: string
    hireDate: string | null
    status: string
    createdAt: string
    managerId?: string | null
    roles?: string[]
}

export interface GetEmployeesParams {
    page?: number
    pageSize?: number
    search?: string
    departmentId?: number
    status?: string
}

export interface PaginatedResult<T> {
    items: T[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

// API Functions
export async function getEmployees(params: GetEmployeesParams, token?: string): Promise<PaginatedResult<Employee>> {
    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 20),
    })

    if (params.search) searchParams.set('search', params.search)
    if (params.departmentId) searchParams.set('departmentId', String(params.departmentId))
    if (params.status) searchParams.set('status', params.status)

    const headers: HeadersInit = {}
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await apiClient.get(`/api/Employees?${searchParams}`, { headers })

    if (!response.ok) {
        let errorMessage = 'Không thể tải danh sách nhân viên'
        try {
            const errorText = await response.text()
            try {
                const errorJson = JSON.parse(errorText)
                errorMessage = errorJson.message || errorMessage
            } catch {
                errorMessage = errorText || errorMessage
            }
        } catch {
            // Ignore parsing errors
        }
        throw new Error(errorMessage)
    }

    return response.json()
}

export async function getEmployeeById(id: string): Promise<Employee> {
    const response = await apiClient.get(`/api/Employees/${id}`)

    if (!response.ok) {
        let errorMessage = 'Không thể tải thông tin nhân viên'
        try {
            const errorText = await response.text()
            try {
                const errorJson = JSON.parse(errorText)
                errorMessage = errorJson.message || errorMessage
            } catch {
                errorMessage = errorText || errorMessage
            }
        } catch {
            // Ignore parsing errors
        }
        throw new Error(errorMessage)
    }

    return response.json()
}

export interface CreateEmployeeData {
    email: string
    fullName: string
    phone?: string
    password: string
    departmentId: number
    position?: string
    employmentType?: string
    hireDate?: string
    managerId?: string
}

export async function createEmployee(data: CreateEmployeeData): Promise<{ employeeId: string }> {
    const response = await apiClient.post(`/api/Employees`, data)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể tạo nhân viên')
    }

    return response.json()
}

export interface UpdateEmployeeData {
    departmentId: number
    position?: string
    employmentType?: string
    managerId?: string
    status?: string
    role?: string
}

export async function updateEmployee(id: string, data: UpdateEmployeeData): Promise<void> {
    const response = await apiClient.put('/api/Employees', { ...data, id })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể cập nhật nhân viên')
    }
}

export async function deleteEmployee(id: string): Promise<void> {
    const response = await apiClient.delete('/api/Employees', { id })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể xóa nhân viên')
    }
}

// Bulk import
export interface EmployeeImportItem {
    fullName: string
    email: string
    phone?: string
    departmentCode?: string
    position?: string
    password?: string
    role?: string // Optional: Employee, Trainer, Director, DepartmentHead
}

export interface BulkCreateResult {
    totalCount: number
    successCount: number
    failedCount: number
    errors: { rowIndex: number; email: string; errorMessage: string }[]
}

export async function bulkCreateEmployees(items: EmployeeImportItem[]): Promise<BulkCreateResult> {
    const response = await apiClient.post(`/api/Employees/bulk`, { items })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể import nhân viên')
    }

    return response.json()
}

// Fetch wrapper with error handling (for SSR pages)
// fetchEmployeeList moved to a server utility to avoid next/headers in client bundle

// Function mới cho file upload
export async function importEmployeesFromFile(file: File, commit: boolean = false): Promise<ImportEmployeesResult> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('commit', commit.toString())

    const response = await apiClient.post(`/api/Employees/import`, formData)

    // Nếu Backend trả về lỗi 400 cùng với cấu trúc ImportEmployeesResult (ví dụ lỗi validate)
    if (!response.ok) {
        let errorResult
        try {
            errorResult = await response.json()
        } catch {
            throw new Error('Lỗi server không xác định')
        }
        // Nếu response có cấu trúc lỗi chuẩn của import, trả về để hiển thị
        if (errorResult.errors || errorResult.failedCount) {
            return errorResult;
        }
        throw new Error(errorResult.message || 'Không thể import nhân viên')
    }

    return response.json()
}
