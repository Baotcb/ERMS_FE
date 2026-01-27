import { config } from '@/config'

const API_BASE = config.apiUrl

// Types
export interface Employee {
    id: string
    employeeCode: string
    fullName: string
    email: string
    phone: string | null
    departmentId: number
    departmentName: string
    position: string | null
    employmentType: string
    hireDate: string | null
    status: string
    createdAt: string
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

// Helper
async function getAuthHeaders(token?: string): Promise<HeadersInit> {
    let authToken = token || ''

    if (!authToken && typeof window !== 'undefined') {
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

// API Functions
export async function getEmployees(params: GetEmployeesParams, token?: string): Promise<PaginatedResult<Employee>> {
    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 20),
    })

    if (params.search) searchParams.set('search', params.search)
    if (params.departmentId) searchParams.set('departmentId', String(params.departmentId))
    if (params.status) searchParams.set('status', params.status)

    const response = await fetch(`${API_BASE}/api/Employees?${searchParams}`, {
        headers: await getAuthHeaders(token),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể tải danh sách nhân viên')
    }

    return response.json()
}

export async function getEmployeeById(id: string): Promise<Employee> {
    const response = await fetch(`${API_BASE}/api/Employees/${id}`, {
        headers: await getAuthHeaders(),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể tải thông tin nhân viên')
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
}

export interface UpdateEmployeeData {
    id: string
    departmentId: number
    position?: string
    employmentType?: string
    managerId?: string
    status?: string
}

export async function updateEmployee(id: string, data: UpdateEmployeeData): Promise<void> {
    const response = await fetch(`${API_BASE}/api/Employees/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể cập nhật nhân viên')
    }
}

export async function deleteEmployee(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/Employees/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
    })

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
    departmentCode: string
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
}

// Fetch wrapper with error handling (for SSR pages)
// fetchEmployeeList moved to a server utility to avoid next/headers in client bundle

