import CampaignPlanWrapper from '@/features/dept-head/components/recruitment/campaign-plan-wrapper'

export default async function Page({ params }: { params: Promise<{ campaignId: string }> }) {
    const { campaignId } = await params
    return <CampaignPlanWrapper campaignId={campaignId} />
}
