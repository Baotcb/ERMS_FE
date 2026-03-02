'use client'

import { memo, useMemo } from 'react'

function formatTimeAgo(publishedAt?: string): string {
    if (!publishedAt) return ''
    const diff = Date.now() - new Date(publishedAt).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `Cập nhật ${mins} phút trước`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Cập nhật ${hours} giờ trước`
    return `Cập nhật ${Math.floor(hours / 24)} ngày trước`
}
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Heart, Flame } from 'lucide-react'

import type { Job } from '../types'
import { useSavedJobsStore } from '../stores/use-saved-jobs-store'
import { cn } from '@/lib/utils'

export const ListingJobCard = memo(function ListingJobCard({ job }: { job: Job }) {
    const { saveJob, removeJob, isSaved } = useSavedJobsStore()
    const saved = isSaved(job.id)

    const displaySalary = useMemo(() => {
        if (!job.showSalary) return 'Thoả thuận'
        if (job.salaryRangeMin && job.salaryRangeMax) {
            return `${(job.salaryRangeMin / 1000000).toLocaleString('vi-VN')} - ${(job.salaryRangeMax / 1000000).toLocaleString('vi-VN')} triệu`
        }
        if (job.salaryRangeMin) return `Từ ${(job.salaryRangeMin / 1000000).toLocaleString('vi-VN')} triệu`
        if (job.salaryRangeMax) return `Đến ${(job.salaryRangeMax / 1000000).toLocaleString('vi-VN')} triệu`
        return 'Thoả thuận'
    }, [job.showSalary, job.salaryRangeMin, job.salaryRangeMax])

    const timeAgo = formatTimeAgo(job.publishedAt)

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (saved) removeJob(job.id)
        else saveJob(job)
    }

    const displayLogo = job.enterpriseLogoUrl || '/placeholder-logo.png'

    return (
        <Link href={`/jobs/${job.id}`} className="listing-job-card">
            {/* Logo */}
            <div className="listing-job-card__logo">
                <Image
                    src={displayLogo}
                    alt={`${job.enterpriseName} Logo`}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                />
            </div>

            {/* Info */}
            <div className="listing-job-card__info">
                <div className="listing-job-card__title-row">
                    {job.isHot && (
                        <span className="listing-job-card__badge listing-job-card__badge--hot">
                            <Flame className="w-3 h-3" />
                            GẤP
                        </span>
                    )}
                    <h3 className="listing-job-card__title">{job.jobTitle}</h3>
                </div>
                <p className="listing-job-card__company">{job.enterpriseName}</p>
                <div className="listing-job-card__meta">
                    {job.location && (
                        <span className="listing-job-card__tag">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                        </span>
                    )}
                    {job.experienceLevel && (
                        <span className="listing-job-card__tag">
                            <Clock className="w-3.5 h-3.5" />
                            {job.experienceLevel}
                        </span>
                    )}
                </div>
                {timeAgo && <p className="listing-job-card__update-time">{timeAgo}</p>}
            </div>

            {/* Right */}
            <div className="listing-job-card__right">
                <span className="listing-job-card__salary">{displaySalary}</span>
                <button
                    className={cn("listing-job-card__heart", saved && "listing-job-card__heart--saved")}
                    onClick={handleSave}
                    aria-label={saved ? 'Bỏ lưu' : 'Lưu công việc'}
                    type="button"
                >
                    <Heart className={cn("w-5 h-5", saved && "fill-current")} />
                </button>
            </div>
        </Link>
    )
})
