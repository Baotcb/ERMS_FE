'use client'

import { useSavedJobsStore } from '../stores/use-saved-jobs-store'

export function SavedJobsHeaderClient() {
    const count = useSavedJobsStore((state) => state.savedJobs.length)

    return (
        <h1 className="topcv-page__title">
            Danh sách{' '}
            <span className="topcv-page__title-count">{count}</span>{' '}
            việc làm đã lưu
        </h1>
    )
}
