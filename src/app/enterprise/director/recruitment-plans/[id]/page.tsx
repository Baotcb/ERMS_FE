import RecruitmentPlanDetailPage from '@/features/director/components/recruitment-plan-detail-page'
import { resolveRouteId } from '@/utils/route-params'

export default async function Page({
    params,
}: {
    params: { id: string } | Promise<{ id: string }>
}) {
    const planId = await resolveRouteId(params)

    return <RecruitmentPlanDetailPage planId={planId} />
}
