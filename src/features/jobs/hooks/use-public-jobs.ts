import { useData } from '@/lib/swr/hooks'
import * as service from '../api/public-job-service'

export function usePublicJobs(params?: {
    page?: number
    pageSize?: number
    search?: string
    departmentId?: string
    location?: string
}) {
    // SWR key must be unique for each param set
    const key = ['/api/public/jobs', JSON.stringify(params)]
    return useData(key, {
        fetcher: () => service.getPublicJobs({
            pageNumber: params?.page,
            pageSize: params?.pageSize,
            searchTerm: params?.search,
            departmentId: params?.departmentId,
            location: params?.location
        }),
    })
}

export function usePublicJob(id: string) {
    return useData(id ? `/api/public/jobs/${id}` : null, {
        fetcher: () => service.getPublicJobById(id),
    })
}
