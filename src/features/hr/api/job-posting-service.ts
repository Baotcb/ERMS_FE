import { apiClient } from '@/lib/api-client'
import type {
    JobPostingDetailDto,
    CreateJobPostingDto,
    UpdateJobPostingDto,
    GenerateJDResult,
} from '../types/job-posting-types'

// GET /api/job-postings - Lấy danh sách bài đăng tuyển dụng (HR/Director)
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

// GET /api/job-postings/{id} - Lấy chi tiết bài đăng
export async function getJobPostingById(id: string): Promise<JobPostingDetailDto> {
    const response = await apiClient.get(`/api/job-postings/${id}`)
    if (!response.ok) throw new Error('Không thể tải thông tin bài đăng tuyển dụng')
    return response.json() as Promise<JobPostingDetailDto>
}

// POST /api/job-postings - Tạo bài đăng từ PlanDetail đã duyệt
export async function createJobPosting(data: CreateJobPostingDto) {
    const response = await apiClient.post('/api/job-postings', data)
    if (!response.ok) {
        const errorText = await response.text()
        try {
            const err = JSON.parse(errorText)
            throw new Error(err.message || 'Không thể tạo bài đăng tuyển dụng')
        } catch (e: unknown) {
            const error = e as Error
            if (error.message !== 'Unexpected end of JSON input' && !error.message.includes('JSON')) {
                throw error
            }
            console.error('Phản hồi lỗi không phải JSON:', errorText)
            throw new Error(`Lỗi server (${response.status}): ${errorText.substring(0, 100)}`)
        }
    }
    return response.json() as Promise<{ id: string }>
}

// PUT /api/job-postings - Cập nhật bài đăng
// Backend: Id phải nằm trong request body, không phải URL path
// id được truyền vào đây để đảm bảo payload luôn có đúng id
export async function updateJobPosting(id: string, data: UpdateJobPostingDto) {
    const response = await apiClient.put('/api/job-postings', { ...data, id })
    if (!response.ok) {
        const errorText = await response.text()
        try {
            const err = JSON.parse(errorText)
            throw new Error(err.message || 'Không thể cập nhật bài đăng tuyển dụng')
        } catch (e: unknown) {
            const error = e as Error
            if (error.message !== 'Unexpected end of JSON input' && !error.message.includes('JSON')) {
                throw error
            }
            console.error('Phản hồi lỗi không phải JSON:', errorText)
            throw new Error(`Lỗi server (${response.status}): ${errorText.substring(0, 100)}`)
        }
    }
    // Backend trả về Unit (204/rỗng) — không cần parse JSON
    if (response.status === 204 || response.headers.get('content-length') === '0') return
    return response.json().catch(() => undefined)
}

// PATCH /api/job-postings/publish - Đăng bài
// Backend: Id trong request body, không phải URL path
export async function publishJobPosting(id: string) {
    const response = await apiClient.patch('/api/job-postings/publish', { id })
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Không thể đăng bài tuyển dụng')
    }
    return response.json().catch(() => ({ success: true }))
}

// PATCH /api/job-postings/close - Đóng tuyển dụng
// Backend: Id trong request body, không phải URL path
export async function closeJobPosting(id: string) {
    const response = await apiClient.patch('/api/job-postings/close', { id })
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Không thể đóng bài đăng tuyển dụng')
    }
    return response.json().catch(() => ({ success: true }))
}

// DELETE /api/job-postings - Xóa bài đăng
// Backend: Id trong request body, không phải URL path
export async function deleteJobPosting(id: string) {
    const response = await apiClient.delete('/api/job-postings', { id })
    if (!response.ok) throw new Error('Không thể xóa bài đăng tuyển dụng')
}

// POST /api/job-postings/generate-jd - Generate JD bằng AI
export async function generateJD(planDetailId: string, userPrompt?: string): Promise<GenerateJDResult> {
    const response = await apiClient.post('/api/job-postings/generate-jd', { planDetailId, userPrompt })
    if (!response.ok) {
        const errorText = await response.text()
        try {
            const err = JSON.parse(errorText)
            throw new Error(err.message || 'Không thể tạo Job Description bằng AI')
        } catch (e: unknown) {
            const error = e as Error
            if (error.message !== 'Unexpected end of JSON input' && !error.message.includes('JSON')) {
                throw error
            }
            console.error('Phản hồi lỗi không phải JSON:', errorText)
            throw new Error(`Lỗi server (${response.status}): ${errorText.substring(0, 100)}`)
        }
    }
    const result = await response.json()
    // handle backend api format returning { data: GenerateJDResult } or directly GenerateJDResult
    return result.data ?? result
}
