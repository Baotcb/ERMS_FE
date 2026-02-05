import { PlanDetail } from '@/features/dept-head/components/recruitment/plan-detail'

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <PlanDetail planId={id} />
}
