'use client'

import { use } from 'react'
import { EmployeeFeedbackForm } from '@/features/employee/components/interview'

interface PageProps {
    params: Promise<{ applicationId: string }>
    searchParams: Promise<{ [key: string]: string | undefined }>
}

export default function EmployeeFeedbackPage({ params, searchParams }: PageProps) {
    const { applicationId } = use(params)
    const query = use(searchParams)
    const interviewId = query.interviewId ?? ''

    return (
        <EmployeeFeedbackForm
            applicationId={applicationId}
            interviewId={interviewId}
            candidateName={query.candidateName ?? 'Ứng viên'}
            jobTitle={query.jobTitle ?? ''}
            roundLabel={query.roundLabel}
            interviewDate={query.interviewDate}
            interviewFormat={query.interviewFormat}
        />
    )
}
