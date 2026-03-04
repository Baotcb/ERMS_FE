import { Metadata } from 'next'
import { CompanyDetailView } from '@/features/jobs/views/company-detail-view'

export const metadata: Metadata = {
    title: 'Chi tiết Công ty | ERMS Tuyển dụng',
    description: 'Thông tin chi tiết và danh sách việc làm tại công ty.',
}

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <CompanyDetailView id={id} />
}
