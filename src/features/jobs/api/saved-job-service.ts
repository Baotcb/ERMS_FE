import { apiClient } from '@/lib/api-client'

// ── Types ────────────────────────────────────────────────────────────────────
export interface SavedPostDto {
    savedJobId: string
    jobPostingId: string
    jobTitle: string
    jobCode?: string
    companyName?: string
    location?: string
    employmentType: string
    status: string
    savedAt: string
}

export interface SavedPostsResponse {
    items: SavedPostDto[]
    totalCount: number
    pageNumber: number
    pageSize: number
}

// ── API calls ────────────────────────────────────────────────────────────────

/**
 * GET /api/job-postings/my-saved-posts
 * Lấy danh sách saved jobs của candidate đang đăng nhập
 */
export async function getMySavedPosts(
    pageNumber = 1,
    pageSize = 50
): Promise<SavedPostsResponse> {
    const response = await apiClient.get(
        `/api/job-postings/my-saved-posts?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )

    if (!response.ok) {
        throw new Error('Không thể tải danh sách việc làm đã lưu')
    }

    return response.json()
}

/**
 * POST /api/job-postings/savejob
 * Lưu một job posting
 */
export async function saveJobPosting(
    jobPostingId: string
): Promise<{ message: string; savedJobId: string }> {
    const response = await apiClient.post('/api/job-postings/savejob', {
        jobPostingId,
    })

    if (!response.ok) {
        throw new Error('Không thể lưu công việc')
    }

    return response.json()
}

/**
 * DELETE /api/job-postings/unsave
 * Bỏ lưu một job posting
 */
export async function unsaveJobPosting(
    jobPostingId: string
): Promise<{ message: string }> {
    const response = await apiClient.delete('/api/job-postings/unsave', {
        jobPostingId,
    })

    if (!response.ok) {
        throw new Error('Không thể bỏ lưu công việc')
    }

    return response.json()
}
