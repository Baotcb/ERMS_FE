import { Metadata } from 'next'
import { JobSearchView } from '@/features/jobs'

export const metadata: Metadata = {
    title: 'Tìm việc làm | ERMS',
    description: 'Tìm kiếm và duyệt các công việc phù hợp',
}

export default function JobSearchPage() {
    return <JobSearchView />
}
