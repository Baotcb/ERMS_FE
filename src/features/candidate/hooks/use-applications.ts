'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import type { CreateApplicationRequest, ApplicationHistoryParams } from '../types/application-types'
import { createApplication, getMyApplications } from '../api/application-service'

const APPLICATIONS_KEY = '/api/Applications'
const MY_APPLICATIONS_KEY = '/api/applications/my-applications'

export function useCreateApplication() {
    return useSWRMutation(
        APPLICATIONS_KEY,
        (_, { arg }: { arg: CreateApplicationRequest }) => createApplication(arg)
    )
}

export function useMyApplications(params?: ApplicationHistoryParams, enabled = true) {
    const key = !enabled
        ? null
        : params?.stageFilter
            ? `${MY_APPLICATIONS_KEY}?stageFilter=${params.stageFilter}`
            : MY_APPLICATIONS_KEY

    return useSWR(
        key,
        () => getMyApplications(params),
        {
            revalidateOnFocus: false,
            keepPreviousData: true,
        }
    )
}
