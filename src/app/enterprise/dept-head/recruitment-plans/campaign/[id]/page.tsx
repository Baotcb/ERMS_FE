import CampaignPlanWrapper from '@/features/dept-head/components/recruitment/campaign-plan-wrapper'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <CampaignPlanWrapper campaignId={id} />
}
