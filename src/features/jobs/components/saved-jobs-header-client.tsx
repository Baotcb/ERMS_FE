'use client'

import { useEffect, useState } from 'react'
import { getMySavedPosts } from '../api/saved-job-service'

export function SavedJobsHeaderClient() {
    const [count, setCount] = useState<number | null>(null)

    useEffect(() => {
        getMySavedPosts(1, 1)
            .then((res) => setCount(res.totalCount))
            .catch(() => setCount(0))
    }, [])

    return (
        <h1 className="topcv-page__title">
            Danh sách{' '}
            <span className="topcv-page__title-count">
                {count !== null ? count : '...'}
            </span>{' '}
            việc làm đã lưu
        </h1>
    )
}
