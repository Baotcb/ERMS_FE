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
            <h1 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Chiáº¿n dá»‹ch tuyá»ƒn dá»¥ng</h1>
            <p className="text-muted-foreground">
                Danh sĂ¡ch cĂ¡c chiáº¿n dá»‹ch tuyá»ƒn dá»¥ng Ä‘ang má»Ÿ. Chá»n má»™t chiáº¿n dá»‹ch Ä‘á»ƒ láº­p káº¿ hoáº¡ch.
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
                <AlertTitle>Lá»—i</AlertTitle>
                <AlertDescription>
                    {error}. Vui lĂ²ng kiá»ƒm tra log server Ä‘á»ƒ biáº¿t chi tiáº¿t.
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
        error = e instanceof Error ? e.message : 'CĂ³ lá»—i khi táº£i dá»¯ liá»‡u'
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
