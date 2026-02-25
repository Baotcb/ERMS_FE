import { apiClient } from '@/lib/api-client'
import type { PublicJobPostingDto, PublicJobsResponse } from '../types'

interface GetPublicJobsParams {
    pageNumber?: number
    pageSize?: number
    searchTerm?: string
    location?: string
    employmentType?: string
    experienceLevel?: string
    minSalary?: number
    maxSalary?: number
    departmentId?: string
    enterpriseId?: string
}

export async function getPublicJobs(params?: GetPublicJobsParams): Promise<PublicJobsResponse> {
    const searchParams = new URLSearchParams({
        PageNumber: String(params?.pageNumber ?? 1),
        PageSize: String(params?.pageSize ?? 10),
    })

    if (params?.searchTerm) searchParams.append('SearchTerm', params.searchTerm)
    if (params?.location) searchParams.append('Location', params.location)
    if (params?.employmentType) searchParams.append('EmploymentType', params.employmentType)
    if (params?.experienceLevel) searchParams.append('ExperienceLevel', params.experienceLevel)
    if (params?.minSalary) searchParams.append('MinSalary', String(params.minSalary))
    if (params?.maxSalary) searchParams.append('MaxSalary', String(params.maxSalary))
    if (params?.departmentId) searchParams.append('DepartmentId', params.departmentId)
    if (params?.enterpriseId) searchParams.append('EnterpriseId', params.enterpriseId)

    const response = await apiClient.get(`/api/public/jobs?${searchParams}`, {
        cache: 'force-cache', // Cache public job listings
    })

    if (!response.ok) {
        // Fallback or detailed error
        throw new Error('Không thể tải danh sách công việc')
    }

    return response.json()
}

export async function getPublicJobById(id: string): Promise<PublicJobPostingDto> {
    const response = await apiClient.get(`/api/public/jobs/${id}`, {
        cache: 'force-cache', // Cache individual job details
    })

    if (!response.ok) {
        throw new Error('Không thể tải thông tin công việc')
    }

    return response.json()
}

