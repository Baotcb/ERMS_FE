import { config } from '@/config'

const API_BASE = config.apiUrl

// Types
export interface Department {
    id: number
    departmentName: string
    departmentCode: string | null
    description: string | null
    managerId: string | null
    managerName: string | null
    parentDepartmentId: number | null
    parentDepartmentName: string | null
    isActive: boolean
    employeeCount: number
    createdAt: string
}

export interface GetDepartmentsParams {
    page?: number
    pageSize?: number
    search?: string
    isActive?: boolean
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
export async function getDepartments(params: GetDepartmentsParams, token?: string): Promise<PaginatedResult<Department>> {
    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 20),
    })

    if (params.search) searchParams.set('search', params.search)
    if (params.isActive !== undefined) searchParams.set('isActive', String(params.isActive))

    const response = await fetch(`${API_BASE}/api/Departments?${searchParams}`, {
        headers: await getAuthHeaders(token),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể tải danh sách phòng ban')
    }

    return response.json()
}

export async function getDepartmentById(id: number): Promise<Department> {
    const response = await fetch(`${API_BASE}/api/Departments/${id}`, {
        headers: await getAuthHeaders(),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể tải thông tin phòng ban')
    }

    return response.json()
}

export interface CreateDepartmentData {
    departmentName: string
    departmentCode?: string
    description?: string
    managerId?: string
    parentDepartmentId?: number
}

export async function createDepartment(data: CreateDepartmentData): Promise<{ departmentId: number }> {
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
}

export interface UpdateDepartmentData extends CreateDepartmentData {
    id: number
    isActive: boolean
}

export async function updateDepartment(id: number, data: UpdateDepartmentData): Promise<void> {
    const response = await fetch(`${API_BASE}/api/Departments/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể cập nhật phòng ban')
    }
}

export async function deleteDepartment(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/Departments/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể xóa phòng ban')
    }
}

// Fetch wrapper with error handling (for SSR pages)
// fetchDepartmentList moved to a server utility to avoid next/headers in client bundle

