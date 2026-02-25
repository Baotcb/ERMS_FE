'use client'

import { use } from 'react'
import { FinalDecisionPage } from '@/features/dept-head/components/interview/final-decision-page'

interface PageProps {
    params: Promise<{ applicationId: string }>
    searchParams: Promise<{ [key: string]: string | undefined }>
}

export default function DecisionPage({ params, searchParams }: PageProps) {
    const { applicationId } = use(params)
    const query = use(searchParams)
    const interviewId = query.interviewId ?? ''

    // In a real implementation, these would come from API data
    // For now, we pass placeholder data; the component will be enhanced later
    return (
        <FinalDecisionPage
            applicationId={applicationId}
            interviewId={interviewId}
            candidateName={query.candidateName ?? 'Ứng viên'}
            jobTitle={query.jobTitle ?? ''}
            candidateStage={query.stage}
            resumeUrl={query.resumeUrl}
            feedbacks={[]}
        />
    )
}
