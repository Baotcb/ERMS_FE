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
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize))
    if (params?.status) searchParams.set('status', params.status)
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId)

    const response = await apiClient.get(`/api/JobPostings?${searchParams}`)
    if (!response.ok) throw new Error('Không thể tải danh sách bài đăng tuyển dụng')
    return response.json() as Promise<{
        data: JobPostingDetailDto[]
        totalCount: number
        pageCount: number
    }>
}

// GET /api/job-postings/{id} - Get job posting details
export async function getJobPostingById(id: string): Promise<JobPostingDetailDto> {
    const response = await apiClient.get(`/api/JobPostings/${id}`)
    if (!response.ok) throw new Error('Không thể tải thông tin bài đăng')
    return response.json() as Promise<JobPostingDetailDto>
}

// POST /api/job-postings - Create from approved PlanDetail
export async function createJobPosting(data: CreateJobPostingDto) {
    const response = await apiClient.post('/api/JobPostings', data)
    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Không thể tạo bài đăng tuyển dụng')
    }
    return response.json() as Promise<{ id: string }>
}

// PUT /api/job-postings/{id} - Update job posting
// Note: Backend might use PUT or PATCH for update
export async function updateJobPosting(id: string, data: UpdateJobPostingDto) {
    const response = await apiClient.put(`/api/JobPostings/${id}`, data)
    if (!response.ok) throw new Error('Không thể cập nhật bài đăng')
    return response.json()
}

// PATCH /api/job-postings/{id}/publish - Publish job
// Backend spec says PATCH /api/job-postings/{id}/publish
export async function publishJobPosting(id: string) {
    const response = await apiClient.patch(`/api/JobPostings/${id}/publish`, {})
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể đăng bài viết');
    }
    return response.json()
}

// PATCH /api/job-postings/{id}/close - Close job
export async function closeJobPosting(id: string) {
    const response = await apiClient.patch(`/api/JobPostings/${id}/close`, {})
    if (!response.ok) throw new Error('Không thể đóng bài đăng')
    return response.json()
}

// DELETE /api/job-postings/{id} - Delete job posting
export async function deleteJobPosting(id: string) {
    const response = await apiClient.delete(`/api/JobPostings/${id}`)
    if (!response.ok) throw new Error('Không thể xóa bài đăng')
}
