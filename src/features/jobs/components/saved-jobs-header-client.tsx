'use client'

import { useEffect, useState } from 'react'
import { getMySavedPosts } from '../api/saved-job-service'
import { useCandidateAccess } from '@/features/core/auth/hooks'

export function SavedJobsHeaderClient() {
    const [count, setCount] = useState<number | null>(null)
    const { isCandidate } = useCandidateAccess()

    useEffect(() => {
        if (!isCandidate) {
            return
        }

        getMySavedPosts(1, 1)
            .then((res) => setCount(res.totalCount))
            .catch(() => setCount(0))
    }, [isCandidate])

    const displayCount = isCandidate ? count : 0

    return (
        <h1 className="topcv-page__title">
            Danh sách{' '}
            <span className="topcv-page__title-count">
                {displayCount !== null ? displayCount : '...'}
            </span>{' '}
            Việc làm đã lưu
        </h1>
    )
}
