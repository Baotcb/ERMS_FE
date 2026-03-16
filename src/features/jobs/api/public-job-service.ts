import { apiClient } from '@/lib/api-client'
import type { PublicJobFilterOptionsResponse, PublicJobPostingDto, PublicJobsResponse } from '../types'

interface GetPublicJobsParams {
    pageNumber?: number
    pageSize?: number
    searchTerm?: string
    location?: string
    employmentType?: string
    experienceBucket?: string
    minSalary?: number
    maxSalary?: number
    departmentId?: string
    enterpriseId?: string
    sortBy?: string
}

export async function getPublicJobs(params?: GetPublicJobsParams): Promise<PublicJobsResponse> {
    const searchParams = new URLSearchParams({
        PageNumber: String(params?.pageNumber ?? 1),
        PageSize: String(params?.pageSize ?? 10),
    })

    if (params?.searchTerm) searchParams.append('SearchTerm', params.searchTerm)
    if (params?.location) searchParams.append('Location', params.location)
    if (params?.employmentType) searchParams.append('EmploymentType', params.employmentType)
    if (params?.experienceBucket) searchParams.append('ExperienceBucket', params.experienceBucket)
    if (params?.minSalary != null) searchParams.append('MinSalary', String(params.minSalary))
    if (params?.maxSalary != null) searchParams.append('MaxSalary', String(params.maxSalary))
    if (params?.departmentId) searchParams.append('DepartmentId', params.departmentId)
    if (params?.enterpriseId) searchParams.append('EnterpriseId', params.enterpriseId)
    if (params?.sortBy) searchParams.append('SortBy', params.sortBy)

    const response = await apiClient.get(`/api/public/jobs?${searchParams}`, {
        cache: 'no-store',
    })

    if (!response.ok) {
        throw new Error('Không thể tải danh sách công việc')
    }

    return response.json()
}

export async function getPublicJobById(id: string): Promise<PublicJobPostingDto | null> {
    const response = await apiClient.get(`/api/public/jobs/${id}`, {
        cache: 'no-store',
    })

    if (response.status === 404) {
        return null
    }

    if (!response.ok) {
        throw new Error('Không thể tải thông tin công việc')
    }

    return response.json()
}

export async function getPublicJobFilterOptions(): Promise<PublicJobFilterOptionsResponse> {
    const response = await apiClient.get('/api/public/jobs/filter-options', {
        cache: 'no-store',
    })

    if (!response.ok) {
        throw new Error('Không thể tải bộ lọc việc làm')
    }

    return response.json()
}

