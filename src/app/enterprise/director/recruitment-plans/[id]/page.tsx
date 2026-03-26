import RecruitmentPlanDetailPage from '@/features/director/components/recruitment-plan-detail-page'

export default function Page({ params }: { params: { id: string } }) {
    return <RecruitmentPlanDetailPage planId={params.id} />
}
