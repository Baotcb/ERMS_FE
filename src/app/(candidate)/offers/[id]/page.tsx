import { Metadata } from 'next'
import { CandidateOfferDetail } from '@/features/candidate/components/candidate-offer-detail'

export const metadata: Metadata = {
    title: 'Chi tiết đề nghị công việc | ERMS',
    description: 'Xem chi tiết đề nghị công việc và phản hồi.',
}

interface OfferDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function OfferDetailPage({ params }: OfferDetailPageProps) {
    const { id } = await params
    return (
        <div className="min-h-screen py-8 px-4">
            <CandidateOfferDetail offerId={id} />
        </div>
    )
}
