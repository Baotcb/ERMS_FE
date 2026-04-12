import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { getPublicJobById } from '@/features/jobs/api/public-job-service'
import { PublicJobDetail } from '@/features/jobs/components/public-job-detail'

interface JobDetailPageProps {
    params: Promise<{
        id: string
    }>
}

// Default OG image for job postings (recommended: 1200x630px PNG)
// You can replace this with a custom designed image
const DEFAULT_JOB_OG_IMAGE = '/og-job-default.svg'

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
    const { id } = await params
    const [job, headersList] = await Promise.all([
        getPublicJobById(id).catch(() => null),
        headers(),
    ])
    const host = headersList.get('host') || 'localhost:3000'
    const proto = headersList.get('x-forwarded-proto') || 'http'
    const baseUrl = `${proto}://${host}`

    if (!job) {
        return { title: 'Việc làm - ERMS' }
    }

    const title = `${job.jobTitle} - ${job.enterpriseName ?? 'ERMS'}`
    const description = job.description
        ? job.description.replace(/<[^>]*>/g, '').slice(0, 160)
        : `${job.employmentType ?? 'Tuyển dụng'} - ${job.location ?? 'Việt Nam'}`
    
    const jobUrl = `${baseUrl}/jobs/${id}`
    
    // Use enterprise logo or default OG image
    const ogImage = job.enterpriseLogoUrl || `${baseUrl}${DEFAULT_JOB_OG_IMAGE}`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: jobUrl,
            type: 'article',
            siteName: 'ERMS - Tuyển dụng & Quản lý Nhân sự',
            locale: 'vi_VN',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
    }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
    const { id } = await params
    return <PublicJobDetail id={id} />
}
