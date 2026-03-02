'use client'

import { memo, useMemo } from 'react'
import {
    MapPin, CheckCircle, Eye, Phone, ThumbsUp, ThumbsDown,
    Send, Briefcase, Clock, FileCheck, Award, UserCheck
} from 'lucide-react'
import type { CandidateApplicationDto } from '@/features/candidate/types/application-types'
import { cn } from '@/lib/utils'

interface AppliedJobCardProps {
    application: CandidateApplicationDto
}

const STAGE_CONFIG: Record<string, {
    label: string
    className: string
    icon: React.ElementType
}> = {
    Applied: {
        label: 'Đã nộp',
        className: 'applied-job-card__status--applied',
        icon: Send,
    },
    Reviewing: {
        label: 'Đang xem xét',
        className: 'applied-job-card__status--viewed',
        icon: Eye,
    },
    Shortlisted: {
        label: 'Phù hợp',
        className: 'applied-job-card__status--suitable',
        icon: ThumbsUp,
    },
    InterviewScheduled: {
        label: 'Lịch phỏng vấn',
        className: 'applied-job-card__status--contacted',
        icon: Clock,
    },
    Interviewed: {
        label: 'Đã phỏng vấn',
        className: 'applied-job-card__status--contacted',
        icon: Phone,
    },
    OfferProcessing: {
        label: 'Đang xử lý offer',
        className: 'applied-job-card__status--contacted',
        icon: FileCheck,
    },
    Offered: {
        label: 'Đã nhận offer',
        className: 'applied-job-card__status--suitable',
        icon: Award,
    },
    Hired: {
        label: 'Đã tuyển',
        className: 'applied-job-card__status--suitable',
        icon: UserCheck,
    },
    Rejected: {
        label: 'Không phù hợp',
        className: 'applied-job-card__status--unsuitable',
        icon: ThumbsDown,
    },
    Withdrawn: {
        label: 'Đã rút',
        className: 'applied-job-card__status--unsuitable',
        icon: ThumbsDown,
    },
}

export const AppliedJobCard = memo(function AppliedJobCard({ application }: AppliedJobCardProps) {
    const stageInfo = STAGE_CONFIG[application.stage] || STAGE_CONFIG.Applied

    const appliedDateDisplay = useMemo(() => {
        const date = new Date(application.appliedAt)
        const dd = date.getDate().toString().padStart(2, '0')
        const mm = (date.getMonth() + 1).toString().padStart(2, '0')
        const yyyy = date.getFullYear()
        const hh = date.getHours().toString().padStart(2, '0')
        const min = date.getMinutes().toString().padStart(2, '0')
        return `Đã ứng tuyển: ${dd}/${mm}/${yyyy} - ${hh}:${min}`
    }, [application.appliedAt])

    const StatusIcon = stageInfo.icon

    return (
        <div className="applied-job-card">
            {/* Company Logo placeholder */}
            <div className="applied-job-card__logo">
                <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
            </div>

            {/* Job Info — Middle */}
            <div className="applied-job-card__info">
                {/* Row 1: Title */}
                <div className="applied-job-card__title-row">
                    <h3 className="applied-job-card__title">
                        {application.jobTitle}
                        <CheckCircle className="applied-job-card__verified" />
                    </h3>
                </div>

                {/* Row 2: Company Name */}
                <p className="applied-job-card__company">{application.companyName}</p>

                {/* Row 3: Location & Employment Type */}
                <div className="applied-job-card__meta">
                    {application.location && (
                        <span className="applied-job-card__tag">
                            <MapPin className="w-3.5 h-3.5" />
                            {application.location}
                        </span>
                    )}
                    {application.employmentType && (
                        <span className="applied-job-card__tag">
                            <Briefcase className="w-3.5 h-3.5" />
                            {application.employmentType}
                        </span>
                    )}
                </div>

                {/* Row 4: Applied date */}
                <p className="applied-job-card__applied-date">{appliedDateDisplay}</p>
            </div>

            {/* Right Section — Status */}
            <div className="applied-job-card__right">
                <span className={cn("applied-job-card__status", stageInfo.className)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {stageInfo.label}
                </span>
            </div>
        </div>
    )
})
