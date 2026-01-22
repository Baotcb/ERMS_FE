import { Metadata } from 'next'
import { SavedJobsView } from '@/features/jobs'

export const metadata: Metadata = {
    title: 'Việc làm đã lưu | ERMS',
    description: 'Danh sách các công việc bạn đã lưu',
}

export default function SavedJobsPage() {
    return <SavedJobsView />
}
