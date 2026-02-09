import { useData } from '@/lib/swr/hooks'
import useSWRMutation from 'swr/mutation'
import * as service from '../api/job-posting-service'
import type { CreateJobPostingDto, UpdateJobPostingDto } from '../types/job-posting-types'

export function useJobPostings(params?: {
    page?: number
    pageSize?: number
    status?: string
    departmentId?: string
}) {
    const key = ['/api/JobPostings', JSON.stringify(params)]
    return useData(key, {
        fetcher: () => service.getJobPostings(params),
    })
}

export function useJobPosting(id: string) {
    return useData(id ? `/api/JobPostings/${id}` : null, {
        fetcher: () => service.getJobPostingById(id),
    })
}

export function useCreateJobPosting() {
    return useSWRMutation(
        '/api/JobPostings',
        (_, { arg }: { arg: CreateJobPostingDto }) => service.createJobPosting(arg)
    )
}

export function useUpdateJobPosting(id: string) {
    return useSWRMutation(
        `/api/JobPostings/${id}`,
        (_, { arg }: { arg: UpdateJobPostingDto }) => service.updateJobPosting(id, arg)
    )
}

export function usePublishJobPosting() {
    return useSWRMutation(
        '/api/JobPostings/publish',
        (_, { arg: id }: { arg: string }) => service.publishJobPosting(id)
    )
}

export function useCloseJobPosting() {
    return useSWRMutation(
        '/api/JobPostings/close',
        (_, { arg: id }: { arg: string }) => service.closeJobPosting(id)
    )
}

export function useDeleteJobPosting() {
    return useSWRMutation(
        '/api/JobPostings/delete',
        (_, { arg: id }: { arg: string }) => service.deleteJobPosting(id)
    )
}
