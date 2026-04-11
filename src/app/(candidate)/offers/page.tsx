import { Metadata } from 'next'
import { CandidateOffersPage } from '@/features/candidate/components/candidate-offers-page'

export const metadata: Metadata = {
    title: 'Đề nghị công việc | ERMS',
    description: 'Danh sách các đề nghị công việc bạn đã nhận và trạng thái hiện tại.',
}

export default function OffersPage() {
    return <CandidateOffersPage />
}
