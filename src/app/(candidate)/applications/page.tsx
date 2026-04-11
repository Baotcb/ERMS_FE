import { Metadata } from 'next'
import { CandidateApplicationsPage } from '@/features/candidate/components/candidate-applications-page'

export const metadata: Metadata = {
    title: 'Việc làm đã ứng tuyển | ERMS',
    description: 'Quản lý danh sách các công việc đã ứng tuyển',
}

export default function ApplicationsPage() {
    return <CandidateApplicationsPage />
}
