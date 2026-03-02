'use client'

import { memo, useMemo } from 'react'
import Image from 'next/image'
import { MapPin, Clock, Heart, CheckCircle, Sparkles } from 'lucide-react'
import type { SavedJob } from '../stores/use-saved-jobs-store'
import { useSavedJobsStore } from '../stores/use-saved-jobs-store'
import { cn } from '@/lib/utils'

interface SavedJobCardProps {
    job: SavedJob
}

export const SavedJobCard = memo(function SavedJobCard({ job }: SavedJobCardProps) {
    const { removeJob } = useSavedJobsStore()

    const displaySalary = useMemo(() => {
        if (!job.showSalary) return 'Thoả thuận'
        if (job.salaryRangeMin && job.salaryRangeMax) {
            return `${(job.salaryRangeMin / 1000000).toLocaleString('vi-VN')} - ${(job.salaryRangeMax / 1000000).toLocaleString('vi-VN')} triệu`
        }
        if (job.salaryRangeMin) {
            return `Từ ${(job.salaryRangeMin / 1000000).toLocaleString('vi-VN')} triệu`
        }
        if (job.salaryRangeMax) {
            return `Đến ${(job.salaryRangeMax / 1000000).toLocaleString('vi-VN')} triệu`
        }
        return 'Thoả thuận'
    }, [job.showSalary, job.salaryRangeMin, job.salaryRangeMax])

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

    const timeAgoDisplay = useMemo(() => {
        if (!job.publishedAt) return ''
        const now = new Date()
        const published = new Date(job.publishedAt)
        const diffMs = now.getTime() - published.getTime()
        const diffMin = Math.floor(diffMs / 60000)
        if (diffMin < 60) return `Cập nhật ${diffMin} phút trước`
        const diffHours = Math.floor(diffMin / 60)
        if (diffHours < 24) return `Cập nhật ${diffHours} giờ trước`
        const diffDays = Math.floor(diffHours / 24)
        return `Cập nhật ${diffDays} ngày trước`
    }, [job.publishedAt])

    const displayLogo = job.enterpriseLogoUrl || '/placeholder-logo.png'

    const handleRemoveSaved = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        removeJob(job.id)
    }

    return (
        <div className="saved-job-card">
            {/* Company Logo */}
            <div className="saved-job-card__logo">
                <Image
                    src={displayLogo}
                    alt={`${job.enterpriseName} Logo`}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                />
            </div>

            {/* Job Info — Middle */}
            <div className="saved-job-card__info">
                {/* Row 1: Title + Badges */}
                <div className="saved-job-card__title-row">
                    {job.isHot && (
                        <span className="saved-job-card__badge saved-job-card__badge--new">
                            <Sparkles className="w-3 h-3" />
                            Tin mới
                        </span>
                    )}
                    <h3 className="saved-job-card__title">
                        {job.jobTitle}
                        <CheckCircle className="saved-job-card__verified" />
                    </h3>
                </div>

                {/* Row 2: Company Name */}
                <p className="saved-job-card__company">{job.enterpriseName}</p>

                {/* Row 3: Location + Experience */}
                <div className="saved-job-card__meta">
                    <span className="saved-job-card__tag">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location || 'Chưa xác định'}
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

                {timeAgoDisplay && (
                    <span className="saved-job-card__update-time">{timeAgoDisplay}</span>
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
