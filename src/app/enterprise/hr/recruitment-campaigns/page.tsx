import { Suspense } from 'react'
import { Metadata } from 'next'
import { RecruitmentCampaignList } from '@/features/hr/components/recruitment-campaign/recruitment-campaign-list'
import { ListSkeleton } from '@/components/common/skeletons/list-skeleton'

export const metadata: Metadata = {
    title: 'Chiến dịch tuyển dụng | ERMS',
    description: 'Quản lý chiến dịch tuyển dụng nhân sự',
}

export default function RecruitmentCampaignsPage() {
    return (
        <Suspense fallback={<ListSkeleton />}>
            <RecruitmentCampaignList />
        </Suspense>
    )
}
