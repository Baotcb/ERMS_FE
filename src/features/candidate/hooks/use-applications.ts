import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { CreateApplicationRequest, ApplicationHistoryParams } from '../types/application-types'
import { createApplication, getApplications, getApplicationById } from '../api/application-service'

const APPLICATIONS_KEY = '/api/Applications'

export function useApplications(params?: ApplicationHistoryParams) {
    const key = [APPLICATIONS_KEY, JSON.stringify(params)]
    return useSWR(key, () => getApplications(params))
}

export function useApplication(id: string) {
    return useSWR(id ? `${APPLICATIONS_KEY}/${id}` : null, () => getApplicationById(id))
}

export function useCreateApplication() {
    return useSWRMutation(
        APPLICATIONS_KEY,
        (_, { arg }: { arg: CreateApplicationRequest }) => createApplication(arg)
    )
}
