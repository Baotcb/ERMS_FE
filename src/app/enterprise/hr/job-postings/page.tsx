import { Suspense } from 'react'
import { JobPostingList } from '@/features/hr/components/job-posting/job-posting-list'
import { ListSkeleton } from '@/components/common/skeletons/list-skeleton'

export default function JobPostingsPage() {
    return (
        <Suspense fallback={<ListSkeleton />}>
            <JobPostingList />
        </Suspense>
    )
}
