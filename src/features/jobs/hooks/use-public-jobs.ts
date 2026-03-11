import { useData } from '@/lib/swr/hooks'
import * as service from '../api/public-job-service'
import type { PublicJobsResponse, PublicJobPostingDto } from '../types'

export function usePublicJobs(params?: {
    page?: number
    pageSize?: number
    search?: string
    departmentId?: string
    location?: string
    employmentType?: string
    experienceBucket?: string
    minSalary?: number
    maxSalary?: number
    sortBy?: string
}, fallbackData?: PublicJobsResponse) {
    const key = params
        ? ['/api/public/jobs', params.page, params.pageSize, params.search, params.departmentId, params.location, params.employmentType, params.experienceBucket, params.minSalary, params.maxSalary, params.sortBy]
        : '/api/public/jobs'
    return useData(key, {
        fetcher: () => service.getPublicJobs({
            pageNumber: params?.page,
            pageSize: params?.pageSize,
            searchTerm: params?.search,
            departmentId: params?.departmentId,
            location: params?.location,
            employmentType: params?.employmentType,
            experienceBucket: params?.experienceBucket,
            minSalary: params?.minSalary,
            maxSalary: params?.maxSalary,
            sortBy: params?.sortBy,
        }),
        fallbackData,
    })
}

export function usePublicJob(id: string, fallbackData?: PublicJobPostingDto) {
    return useData(id ? `/api/public/jobs/${id}` : null, {
        fetcher: () => service.getPublicJobById(id),
        fallbackData,
    })
}

export function usePublicJobFilterOptions() {
    return useData('/api/public/jobs/filter-options', {
        fetcher: () => service.getPublicJobFilterOptions(),
    })
}
