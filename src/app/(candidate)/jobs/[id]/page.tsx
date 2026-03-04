import { PublicJobDetail } from '@/features/jobs/components/public-job-detail'

interface JobDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
    const { id } = await params
    return <PublicJobDetail id={id} />
}
