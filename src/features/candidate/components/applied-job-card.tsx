'use client'

import { memo, useMemo } from 'react'
import Image from 'next/image'
import { MapPin, CheckCircle, Eye, Phone, ThumbsUp, ThumbsDown, Send } from 'lucide-react'
import type { Application } from '@/features/candidate/types/application-types'
import { cn } from '@/lib/utils'

interface AppliedJobCardProps {
    application: Application
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
    Screening: {
        label: 'NTD đã xem',
        className: 'applied-job-card__status--viewed',
        icon: Eye,
    },
    Shortlisted: {
        label: 'Phù hợp',
        className: 'applied-job-card__status--suitable',
        icon: ThumbsUp,
    },
    Interview: {
        label: 'Đã liên hệ',
        className: 'applied-job-card__status--contacted',
        icon: Phone,
    },
    Offer: {
        label: 'Đã liên hệ',
        className: 'applied-job-card__status--contacted',
        icon: Phone,
    },
    Rejected: {
        label: 'Không phù hợp',
        className: 'applied-job-card__status--unsuitable',
        icon: ThumbsDown,
    },
    Hired: {
        label: 'Phù hợp',
        className: 'applied-job-card__status--suitable',
        icon: ThumbsUp,
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

    const displayLogo = application.enterpriseLogoUrl || '/placeholder-logo.png'
    const StatusIcon = stageInfo.icon

    return (
        <div className="applied-job-card">
            {/* Company Logo */}
            <div className="applied-job-card__logo">
                <Image
                    src={displayLogo}
                    alt={`${application.enterpriseName} Logo`}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                />
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
                <p className="applied-job-card__company">{application.enterpriseName}</p>

                {/* Row 3: Department */}
                {application.departmentName && (
                    <div className="applied-job-card__meta">
                        <span className="applied-job-card__tag">
                            <MapPin className="w-3.5 h-3.5" />
                            {application.departmentName}
                        </span>
                    </div>
                )}

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
