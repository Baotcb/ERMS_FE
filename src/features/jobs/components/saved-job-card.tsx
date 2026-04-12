'use client'

import { memo, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { MapPin, Heart, Briefcase, Clock } from 'lucide-react'
import type { EnrichedSavedPost } from './saved-job-list'
import { useSavedJobsStore } from '../stores/use-saved-jobs-store'
import { cn } from '@/lib/utils'

interface SavedJobCardProps {
    job: EnrichedSavedPost
    onUnsaved?: (jobPostingId: string) => void
}

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
    FullTime: 'Toàn thời gian',
    PartTime: 'Bán thời gian',
    Contract: 'Hợp đồng',
    Internship: 'Thực tập',
}

export const SavedJobCard = memo(function SavedJobCard({ job, onUnsaved }: SavedJobCardProps) {
    const removeJob = useSavedJobsStore((s) => s.removeJob)

    const savedDateDisplay = useMemo(() => {
        if (!job.savedAt) return ''
        const date = new Date(job.savedAt)
        const dd = date.getDate().toString().padStart(2, '0')
        const mm = (date.getMonth() + 1).toString().padStart(2, '0')
        const yyyy = date.getFullYear()
        const hh = date.getHours().toString().padStart(2, '0')
        const min = date.getMinutes().toString().padStart(2, '0')
        return `Đã lưu: ${dd}/${mm}/${yyyy} - ${hh}:${min}`
    }, [job.savedAt])

    const displaySalary = useMemo(() => {
        if (!job.showSalary) return 'Thoả thuận'
        const min = job.salaryRangeMin ? Math.round(job.salaryRangeMin / 1000000) : 0
        const max = job.salaryRangeMax ? Math.round(job.salaryRangeMax / 1000000) : 0
        if (min > 0 && max > 0) {
            return `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')} triệu`
        }
        if (min > 0) return `Từ ${min.toLocaleString('vi-VN')} triệu`
        if (max > 0) return `Đến ${max.toLocaleString('vi-VN')} triệu`
        return 'Thoả thuận'
    }, [job.showSalary, job.salaryRangeMin, job.salaryRangeMax])

    const employmentLabel = EMPLOYMENT_TYPE_MAP[job.employmentType] ?? job.employmentType
    const displayLogo = job.enterpriseLogoUrl || ''

    const handleRemoveSaved = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        removeJob(job.jobPostingId)
        onUnsaved?.(job.jobPostingId)
    }, [job.jobPostingId, removeJob, onUnsaved])

    return (
        <div className="saved-job-card">
            {/* Company Logo */}
            <div className="saved-job-card__logo">
                {displayLogo ? (
                    <Image
                        src={displayLogo}
                        alt={`${job.companyName} Logo`}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                    />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f2f4f5',
                            borderRadius: 6,
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#00b14f',
                        }}
                    >
                        {(job.companyName ?? 'C').charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            {/* Job Info — Middle */}
            <div className="saved-job-card__info">
                {/* Row 1: Title */}
                <div className="saved-job-card__title-row">
                    <h3 className="saved-job-card__title">
                        {job.jobTitle}
                    </h3>
                </div>

                {/* Row 2: Company Name */}
                <p className="saved-job-card__company">{job.companyName ?? 'Chưa cập nhật'}</p>

                {/* Row 3: Location + Employment Type + Experience */}
                <div className="saved-job-card__meta">
                    {job.location && (
                        <span className="saved-job-card__tag">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                        </span>
                    )}
                    <span className="saved-job-card__tag">
                        <Briefcase className="w-3.5 h-3.5" />
                        {employmentLabel}
                    </span>
                    {job.experienceLevel && (
                        <span className="saved-job-card__tag">
                            <Clock className="w-3.5 h-3.5" />
                            {job.experienceLevel}
                        </span>
                    )}
                </div>

                {/* Row 4: Saved date */}
                {savedDateDisplay && (
                    <p className="saved-job-card__saved-date">{savedDateDisplay}</p>
                )}
            </div>

            {/* Right Section — Salary + Heart */}
            <div className="saved-job-card__right">
                <span className={cn(
                    "saved-job-card__salary",
                    displaySalary === 'Thoả thuận' && "saved-job-card__salary--negotiate"
                )}>
                    {displaySalary}
                </span>

                {job.jobCode && (
                    <span className="saved-job-card__update-time">#{job.jobCode}</span>
                )}

                <button
                    className="saved-job-card__heart"
                    onClick={handleRemoveSaved}
                    aria-label="Bỏ lưu công việc"
                    title="Bỏ lưu"
                >
                    <Heart className="w-5 h-5 fill-current" />
                </button>
            </div>
        </div>
    )
})
