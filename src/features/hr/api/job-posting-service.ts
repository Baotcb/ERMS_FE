import { apiClient } from '@/lib/api-client'
import type {
    JobPostingDetailDto,
    CreateJobPostingDto,
    UpdateJobPostingDto,
} from '../types/job-posting-types'

// GET /api/job-postings - Get all job postings (HR/Director)
export async function getJobPostings(params?: {
    page?: number
    pageSize?: number
    status?: string
    departmentId?: string
}) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('pageNumber', String(params.page))
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize))
    if (params?.status) searchParams.set('status', params.status)
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId)

    const response = await apiClient.get(`/api/job-postings?${searchParams}`)
    if (!response.ok) throw new Error('Không thể tải danh sách bài đăng tuyển dụng')
    const result = await response.json()
    // Map backend response { items, totalCount, totalPages } → FE format { data, totalCount, pageCount }
    return {
        data: result.items || [],
        totalCount: result.totalCount || 0,
        pageCount: result.totalPages || 1,
    }
}

// GET /api/job-postings/{id} - Get job posting details
export async function getJobPostingById(id: string): Promise<JobPostingDetailDto> {
    const response = await apiClient.get(`/api/job-postings/${id}`)
    if (!response.ok) throw new Error('Không thể tải thông tin bài đăng')
    return response.json() as Promise<JobPostingDetailDto>
}

// POST /api/job-postings - Create from approved PlanDetail
export async function createJobPosting(data: CreateJobPostingDto) {
    const response = await apiClient.post('/api/job-postings', data)
    if (!response.ok) {
        const errorText = await response.text()
        try {
            const err = JSON.parse(errorText)
            throw new Error(err.message || 'Không thể tạo bài đăng tuyển dụng')
        } catch (e: unknown) {
            const error = e as Error;
            // If we already created an Error with a message from JSON, throw it
            if (error.message !== 'Unexpected end of JSON input' && !error.message.includes('JSON')) {
                throw error;
            }
            console.error('Non-JSON error response:', errorText)
            throw new Error(`Lỗi server (${response.status}): ${errorText.substring(0, 100)}`)
        }
    }
    return response.json() as Promise<{ id: string }>
}

// PUT /api/job-postings/{id} - Update job posting
// Note: Backend might use PUT or PATCH for update
export async function updateJobPosting(id: string, data: UpdateJobPostingDto) {
    const response = await apiClient.put(`/api/job-postings/${id}`, data)
    if (!response.ok) throw new Error('Không thể cập nhật bài đăng')
    return response.json()
}

// PATCH /api/job-postings/{id}/publish - Publish job
export async function publishJobPosting(id: string) {
    const response = await apiClient.patch(`/api/job-postings/${id}/publish`, {})
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể đăng bài viết');
    }
    return response.json().catch(() => ({ success: true }))
}

// PATCH /api/job-postings/{id}/close - Close job
export async function closeJobPosting(id: string) {
    const response = await apiClient.patch(`/api/job-postings/${id}/close`, {})
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể đóng bài đăng');
    }
    return response.json().catch(() => ({ success: true }))
}

// DELETE /api/job-postings/{id} - Delete job posting
export async function deleteJobPosting(id: string) {
    const response = await apiClient.delete(`/api/job-postings/${id}`)
    if (!response.ok) throw new Error('Không thể xóa bài đăng')
}
