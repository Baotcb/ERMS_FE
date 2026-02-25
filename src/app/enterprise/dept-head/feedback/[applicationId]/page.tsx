'use client'

import { use } from 'react'
import { InterviewFeedbackForm } from '@/features/dept-head/components/interview/interview-feedback-form'
import { useRouter } from 'next/navigation'

interface PageProps {
    params: Promise<{ applicationId: string }>
    searchParams: Promise<{ [key: string]: string | undefined }>
}

export default function FeedbackPage({ params, searchParams }: PageProps) {
    const { applicationId } = use(params)
    const query = use(searchParams)
    const router = useRouter()
    const interviewId = query.interviewId ?? ''

    return (
        <InterviewFeedbackForm
            applicationId={applicationId}
            interviewId={interviewId}
            candidateName={query.candidateName ?? 'Ứng viên'}
            jobTitle={query.jobTitle ?? ''}
            roundLabel={query.roundLabel}
            interviewDate={query.interviewDate}
            interviewFormat={query.interviewFormat}
            onSuccess={() => router.back()}
            onCancel={() => router.back()}
        />
    )
}
