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
    const key = ['/api/Public/Jobs', JSON.stringify(params)]
    return useData(key, {
        fetcher: () => service.getPublicJobs(params),
    })
}

export function usePublicJob(id: string) {
    return useData(id ? `/api/Public/Jobs/${id}` : null, {
        fetcher: () => service.getPublicJobById(id),
    })
}
