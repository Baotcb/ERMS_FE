import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { RecruitmentCampaign } from '@/features/hr/types/recruitment-campaign-types'
import { getRecruitmentCampaigns } from '@/features/hr/api/recruitment-campaign-service'
import { DeptHeadCampaignList } from './campaign-list'

function RecruitmentPageHeader() {
    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Chiến dịch tuyển dụng</h1>
            <p className="text-muted-foreground">
                Danh sách các chiến dịch tuyển dụng đang mở. Chọn một chiến dịch để lập kế hoạch.
            </p>
        </div>
    )
}

function RecruitmentErrorState({ error }: { error: string }) {
    return (
        <div className="space-y-6">
            <RecruitmentPageHeader />
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>
                    {error}. Vui lòng kiểm tra log server để biết chi tiết.
                </AlertDescription>
            </Alert>
        </div>
    )
}

export async function RecruitmentPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    let campaigns: RecruitmentCampaign[] = []
    let error: string | null = null

    try {
        const result = await getRecruitmentCampaigns(
            {
                page: 1,
                pageSize: 100,
                status: 'Open',
            },
            token
        )
        campaigns = result.items
    } catch (e) {
        error = e instanceof Error ? e.message : 'Có lỗi khi tải dữ liệu'
    }

    if (error) {
        return <RecruitmentErrorState error={error} />
    }

    return (
        <div className="space-y-6">
            <RecruitmentPageHeader />

            <Suspense fallback={<div>Loading...</div>}>
                <DeptHeadCampaignList campaigns={campaigns} />
            </Suspense>
        </div>
    )
}
