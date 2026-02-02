import { apiClient } from '@/lib/api-client'

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

// API Functions
export async function getDepartments(params: GetDepartmentsParams, token?: string): Promise<PaginatedResult<Department>> {
    const searchParams = new URLSearchParams({
        page: String(params.page ?? 1),
        pageSize: String(params.pageSize ?? 20),
    })

    if (params.search) searchParams.set('search', params.search)
    if (params.isActive !== undefined) searchParams.set('isActive', String(params.isActive))

    const headers: HeadersInit = {}
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await apiClient.get(`/api/Departments?${searchParams}`, { headers })

    if (!response.ok) {
        const text = await response.text()
        console.error('getDepartments error response:', { status: response.status, text })
        let errorMsg = 'Không thể tải danh sách phòng ban'
        try {
            const json = JSON.parse(text)
            errorMsg = json.message || errorMsg
        } catch {
            // ignore JSON parse error
        }
        throw new Error(errorMsg)
    }

    // Handle empty response
    const text = await response.text()
    if (!text) return { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }

    try {
        return JSON.parse(text)
    } catch (e) {
        console.error('getDepartments JSON parse error:', e, 'Response text:', text)
        throw e
    }
}

export async function getDepartmentById(id: number): Promise<Department> {
    const response = await apiClient.get(`/api/Departments/${id}`)

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
    const response = await apiClient.post(`/api/Departments`, data)

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
    const response = await apiClient.put(`/api/Departments/${id}`, data)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể cập nhật phòng ban')
    }
}

export async function deleteDepartment(id: number): Promise<void> {
    const response = await apiClient.delete(`/api/Departments/${id}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể xóa phòng ban')
    }
}

// Fetch wrapper with error handling (for SSR pages)
// fetchDepartmentList moved to a server utility to avoid next/headers in client bundle
