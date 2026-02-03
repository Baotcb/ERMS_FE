import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getRecruitmentCampaigns } from '@/features/hr/api/recruitment-campaign-service'
import { RecruitmentCampaignList } from '@/features/hr/components/recruitment-campaign/recruitment-campaign-list'

export const metadata: Metadata = {
    title: 'Chiến dịch tuyển dụng | ERMS',
    description: 'Quản lý chiến dịch tuyển dụng nhân sự',
}

interface PageProps {
    searchParams?: Promise<{
        page?: string
        search?: string
        status?: string
    }>
}

export default async function RecruitmentCampaignsPage(props: PageProps) {
    const searchParams = await props.searchParams
    const page = Number(searchParams?.page) || 1
    const search = searchParams?.search || ''
    const status = searchParams?.status || ''

    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    const result = await getRecruitmentCampaigns({
        page,
        pageSize: 7,
        search,
        status
    }, token)

    return (
        <div className="container mx-auto py-6">
            <RecruitmentCampaignList
                data={result.items}
                totalCount={result.totalCount}
                page={result.page}
                pageSize={result.pageSize}
                totalPages={result.totalPages}
            />
        </div>
    )
}
