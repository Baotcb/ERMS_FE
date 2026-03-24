/**
 * Job Preview Popup – hiển thị thông tin sơ bộ khi hover job card
 * Tham khảo TopCV: popup bên cạnh danh sách, show mô tả + yêu cầu
 */

'use client'

import { memo, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Briefcase, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

import type { PublicJobPostingDto } from '../types'
import './job-preview-popup.css'

interface JobPreviewPopupProps {
    job: PublicJobPostingDto | null
    isLoading: boolean
    anchorRect: DOMRect | null
}

export const JobPreviewPopup = memo(function JobPreviewPopup({
    job,
    isLoading,
    anchorRect,
}: JobPreviewPopupProps) {
    const position = usePopupPosition(anchorRect)

    if (!position) return null

    return (
        <div
            className="job-preview-popup"
            style={{ top: position.top, left: position.left }}
            onMouseEnter={(e) => e.stopPropagation()}
        >
            {isLoading ? (
                <LoadingState />
            ) : job ? (
                <PopupContent job={job} />
            ) : null}
        </div>
    )
})

/* =========================================
   Sub-components
   ========================================= */

function LoadingState() {
    return (
        <div className="job-preview-popup__loading">
            <div className="job-preview-popup__loading-spinner" />
            <span className="job-preview-popup__loading-text">
                Đang tải thông tin...
            </span>
        </div>
    )
}

const PopupContent = memo(function PopupContent({
    job,
}: {
    job: PublicJobPostingDto
}) {
    const displaySalary = useSalaryDisplay(job)
    const deadlineText = useDeadlineText(job.applicationDeadline)
    const displayLogo = job.enterpriseLogoUrl || '/placeholder-logo.png'

    return (
        <>
            <PopupHeader
                job={job}
                displayLogo={displayLogo}
                displaySalary={displaySalary}
            />
            <PopupTags job={job} deadlineText={deadlineText} />
            <PopupBody job={job} />
            <PopupFooter jobId={job.id} />
        </>
    )
})

function PopupHeader({
    job,
    displayLogo,
    displaySalary,
}: {
    job: PublicJobPostingDto
    displayLogo: string
    displaySalary: string
}) {
    return (
        <div className="job-preview-popup__header">
            <div className="job-preview-popup__logo">
                <Image
                    src={displayLogo}
                    alt={`${job.enterpriseName} Logo`}
                    fill
                    sizes="52px"
                    className="object-contain p-1"
                />
            </div>
            <div className="job-preview-popup__header-info">
                <h4 className="job-preview-popup__title">{job.jobTitle}</h4>
                <p className="job-preview-popup__company">
                    {job.enterpriseName}
                </p>
                <span className="job-preview-popup__salary">
                    {displaySalary}
                </span>
            </div>
        </div>
    )
}

function PopupTags({
    job,
    deadlineText,
}: {
    job: PublicJobPostingDto
    deadlineText: string
}) {
    return (
        <div className="job-preview-popup__tags">
            {job.location && (
                <span className="job-preview-popup__tag">
                    <MapPin />
                    {job.location}
                </span>
            )}
            {job.experienceLevel && (
                <span className="job-preview-popup__tag">
                    <Briefcase />
                    {job.experienceLevel}
                </span>
            )}
            <span className="job-preview-popup__tag">
                <Clock />
                {deadlineText}
            </span>
        </div>
    )
}

function PopupBody({ job }: { job: PublicJobPostingDto }) {
    return (
        <div className="job-preview-popup__body">
            {job.description && (
                <div className="job-preview-popup__section">
                    <h5 className="job-preview-popup__section-title">
                        Mô tả công việc
                    </h5>
                    <div className="job-preview-popup__section-content">
                        {job.description}
                    </div>
                </div>
            )}
            {job.requirements && (
                <div className="job-preview-popup__section">
                    <h5 className="job-preview-popup__section-title">
                        Yêu cầu ứng viên
                    </h5>
                    <div className="job-preview-popup__section-content">
                        {job.requirements}
                    </div>
                </div>
            )}
            {job.benefits && (
                <div className="job-preview-popup__section">
                    <h5 className="job-preview-popup__section-title">
                        Quyền lợi
                    </h5>
                    <div className="job-preview-popup__section-content">
                        {job.benefits}
                    </div>
                </div>
            )}
        </div>
    )
}

function PopupFooter({ jobId }: { jobId: string }) {
    return (
        <div className="job-preview-popup__footer">
            <Link
                href={`/jobs/${jobId}`}
                className="job-preview-popup__btn job-preview-popup__btn--primary"
            >
                <ExternalLink className="w-4 h-4" />
                Xem chi tiết
            </Link>
        </div>
    )
}

/* =========================================
   Hooks
   ========================================= */

function usePopupPosition(anchorRect: DOMRect | null) {
    return useMemo(() => {
        if (!anchorRect) return null

        const popupWidth = 420
        const popupHeight = 520
        const gap = 12
        const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
        const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800

        // Prefer right side, fall back to left
        let left = anchorRect.right + gap
        if (left + popupWidth > windowWidth - 16) {
            left = anchorRect.left - popupWidth - gap
        }

        // Vertical: align to top of anchor, clamp to viewport
        let top = anchorRect.top
        if (top + popupHeight > windowHeight - 16) {
            top = windowHeight - popupHeight - 16
        }
        if (top < 16) {
            top = 16
        }

        return { top, left }
    }, [anchorRect])
}

function useSalaryDisplay(job: PublicJobPostingDto) {
    return useMemo(() => {
        if (!job.showSalary) return 'Thỏa thuận'
        if (job.salaryRangeMin && job.salaryRangeMax) {
            return `${(job.salaryRangeMin / 1000000).toLocaleString('vi-VN')} - ${(job.salaryRangeMax / 1000000).toLocaleString('vi-VN')} triệu`
        }
        if (job.salaryRangeMin) {
            return `Từ ${(job.salaryRangeMin / 1000000).toLocaleString('vi-VN')} triệu`
        }
        if (job.salaryRangeMax) {
            return `Đến ${(job.salaryRangeMax / 1000000).toLocaleString('vi-VN')} triệu`
        }
        return 'Thỏa thuận'
    }, [job.showSalary, job.salaryRangeMin, job.salaryRangeMax])
}

function useDeadlineText(deadline?: string) {
    return useMemo(() => {
        if (!deadline) return 'Đang cập nhật'
        try {
            return format(new Date(deadline), 'dd/MM/yyyy')
        } catch {
            return 'Đang cập nhật'
        }
    }, [deadline])
}
