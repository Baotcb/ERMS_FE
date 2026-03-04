import { useData } from '@/lib/swr/hooks'
import useSWRMutation from 'swr/mutation'
import * as service from '../api/application-service'
import { ForwardApplicationRequest } from '../types/application-types'

export function useApplications(jobPostingId: string, params?: {
    pageNumber?: number
    pageSize?: number
    stageFilter?: string
}) {
    const key = jobPostingId ? [`/api/applications/job/${jobPostingId}`, JSON.stringify(params)] : null
    return useData(key, {
        fetcher: () => service.getApplicationsByJob(jobPostingId, params),
    })
}

export function useApplication(id: string) {
    return useData(id ? `/api/applications/${id}` : null, {
        fetcher: () => service.getApplicationById(id),
    })
}

export function useForwardApplication() {
    return useSWRMutation(
        '/api/applications/forward',
        (_, { arg }: { arg: { id: string; data: ForwardApplicationRequest } }) =>
            service.forwardApplication(arg.id, arg.data)
    )
}
