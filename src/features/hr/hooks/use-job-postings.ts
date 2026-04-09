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
    const key = ['/api/job-postings', JSON.stringify(params)]
    return useData(key, {
        fetcher: () => service.getJobPostings(params),
    })
}

export function useJobPosting(id: string) {
    return useData(id ? `/api/job-postings/${id}` : null, {
        fetcher: () => service.getJobPostingById(id),
    })
}

export function useCreateJobPosting() {
    return useSWRMutation(
        '/api/job-postings',
        (_, { arg }: { arg: CreateJobPostingDto }) => service.createJobPosting(arg)
    )
}

export function useUpdateJobPosting(id: string) {
    return useSWRMutation(
        `/api/job-postings/${id}`,
        (_, { arg }: { arg: UpdateJobPostingDto }) => service.updateJobPosting(id, arg)
    )
}

export function usePublishJobPosting() {
    return useSWRMutation(
        '/api/job-postings/publish',
        (_, { arg: id }: { arg: string }) => service.publishJobPosting(id)
    )
}

export function useCloseJobPosting() {
    return useSWRMutation(
        '/api/job-postings/close',
        (_, { arg: id }: { arg: string }) => service.closeJobPosting(id)
    )
}

export function useDeleteJobPosting() {
    return useSWRMutation(
        '/api/job-postings/delete',
        (_, { arg: id }: { arg: string }) => service.deleteJobPosting(id)
    )
}

export function useGenerateJD() {
    return useSWRMutation(
        'generate-jd',
        (_, { arg: planDetailId }: { arg: string }) => service.generateJD(planDetailId)
    )
}
