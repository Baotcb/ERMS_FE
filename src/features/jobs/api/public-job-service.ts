import { apiClient } from '@/lib/api-client'
import type { PublicJobPostingDto } from '../types'

export async function getPublicJobs(params?: {
    page?: number
    pageSize?: number
    search?: string
    departmentId?: string
    location?: string
}) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize))
    if (params?.search) searchParams.set('search', params.search)
    if (params?.departmentId) searchParams.set('departmentId', params.departmentId)
    if (params?.location) searchParams.set('location', params.location)

    const response = await apiClient.get(`/api/Public/Jobs?${searchParams}`)
    if (!response.ok) throw new Error('Không thể tải danh sách việc làm')
    // Assume API returns object with data array or just array? 
    // Standard is PaginatedResult
    return response.json() as Promise<{
        items: PublicJobPostingDto[]
        totalCount: number
        page: number
        pageSize: number
        totalPages: number
    }>
}

export async function getPublicJobById(id: string) {
    const response = await apiClient.get(`/api/Public/Jobs/${id}`)
    if (!response.ok) throw new Error('Không thể tải thông tin việc làm')
    return response.json() as Promise<PublicJobPostingDto>
}
