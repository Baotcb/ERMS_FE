import { Metadata } from 'next'
import { CompanyListView } from '@/features/jobs/views/company-list-view'

export const metadata: Metadata = {
    title: 'Danh sách Công ty Mới nhất | ERMS Tuyển dụng',
    description: 'Tra cứu thông tin, môi trường làm việc và danh sách việc làm từ các công ty hàng đầu tại Việt Nam.',
}

export default function CompaniesPage() {
    return <CompanyListView />
}
