'use client'

import { use } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useInterviewFeedbackDetail } from '@/features/dept-head/hooks/use-interview'
import { FinalDecisionPage } from './final-decision-page'

interface PageProps {
    params: Promise<{ applicationId: string }>
    searchParams: Promise<{ [key: string]: string | undefined }>
}

function DecisionLoadingState() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#0F4C75] animate-spin mx-auto" />
                <p className="text-sm text-slate-500">Äang táº£i dá»¯ liá»‡u Ä‘Ă¡nh giĂ¡...</p>
            </div>
        </div>
    )
}

function DecisionErrorState({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-sm text-red-600 font-medium">KhĂ´ng thá»ƒ táº£i Ä‘Ă¡nh giĂ¡</p>
                <p className="text-xs text-red-400 mt-1">{message}</p>
            </div>
        </div>
    )
}

export function DecisionPage({ params, searchParams }: PageProps) {
    const { applicationId } = use(params)
    const query = use(searchParams)
    const interviewId = query.interviewId ?? ''

    const { data, isLoading, error } = useInterviewFeedbackDetail(interviewId || null)

    if (isLoading) {
        return <DecisionLoadingState />
    }

    if (error) {
        return <DecisionErrorState message={error.message} />
    }

    const feedbacks = (data?.participantsFeedback ?? []).map((pf) => ({
        participantName: pf.employeeName,
        position: pf.role,
        rating: pf.rating ?? 0,
        feedback: pf.feedback ?? 'KhĂ´ng cĂ³ nháº­n xĂ©t',
        recommendation: (pf.recommendation ?? 'Consider') as 'Hire' | 'Consider' | 'Reject',
    }))

    return (
        <FinalDecisionPage
            applicationId={applicationId}
            interviewId={interviewId}
            candidateName={data?.candidateName ?? query.candidateName ?? 'á»¨ng viĂªn'}
            jobTitle={data?.jobTitle ?? query.jobTitle ?? ''}
            candidateStage={query.stage}
            roundLabel={
                data
                    ? `VĂ²ng ${data.roundNumber} â€” ${data.interviewType}`
                    : query.roundLabel
            }
            interviewDate={
                data?.completedAt
                    ? new Date(data.completedAt).toLocaleDateString('vi-VN')
                    : query.interviewDate
            }
            interviewFormat={query.interviewFormat}
            resumeUrl={query.resumeUrl}
            feedbacks={feedbacks}
        />
    )
}
