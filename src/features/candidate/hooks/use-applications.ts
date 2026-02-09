import useSWRMutation from 'swr/mutation'
import { CreateApplicationRequest } from '../types/application-types'
import { createApplication } from '../api/application-service'

const APPLICATIONS_KEY = '/api/Applications'

export function useCreateApplication() {
    return useSWRMutation(
        APPLICATIONS_KEY,
        (_, { arg }: { arg: CreateApplicationRequest }) => createApplication(arg)
    )
}
