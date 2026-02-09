import { Metadata } from 'next'
import { ApplicationsView } from '@/features/hr/components/application/applications-view'

export const metadata: Metadata = {
    title: 'Quản lý ứng tuyển | ERMS',
    description: 'Danh sách hồ sơ ứng tuyển theo công việc',
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ApplicationsPage({ params }: PageProps) {
    const { id } = await params
    return (
        <div className="container mx-auto py-6">
            <ApplicationsView jobPostingId={id} />
        </div>
    )
}
