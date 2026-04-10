import type { Metadata } from 'next'
import { PublicJobDetail } from '@/features/jobs/components/public-job-detail'
import { getPublicJobById } from '@/features/jobs/api/public-job-service'

interface JobDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
    const { id } = await params
    const job = await getPublicJobById(id).catch(() => null)

    if (!job) {
        return { title: 'Việc làm — ERMS' }
    }

    const description = job.description
        ? job.description.replace(/<[^>]*>/g, '').slice(0, 160)
        : `${job.employmentType ?? ''} · ${job.location ?? ''}`

    return {
        title: `${job.jobTitle} — ${job.companyName ?? 'ERMS'}`,
        description,
        openGraph: {
            title: `${job.jobTitle} — ${job.companyName ?? 'ERMS'}`,
            description,
            type: 'website',
            ...(job.companyLogoUrl ? { images: [{ url: job.companyLogoUrl }] } : {}),
        },
    }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
    const { id } = await params
    return <PublicJobDetail id={id} />
}
