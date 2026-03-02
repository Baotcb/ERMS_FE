import { Suspense } from 'react'
import { Metadata } from 'next'
import { PublicJobList } from '@/features/jobs/components/public-job-list'

export const metadata: Metadata = {
    title: 'Tìm việc làm nhanh, việc làm mới nhất | ERMS',
    description: 'Tìm kiếm hàng nghìn cơ hội việc làm hấp dẫn tại các công ty hàng đầu',
}

export default function JobSearchPage() {
    return (
        <div className="job-listing-page">
            <Suspense>
                <PublicJobList />
            </Suspense>
        </div>
    )
}
