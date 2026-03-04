/**
 * Job Card Component - TopCV Style
 * Memoized for performance optimization
 */

'use client'

import { memo, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { MapPin, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Job } from '../types'
import { useSavedJobsStore } from '../stores/use-saved-jobs-store'
import { cn } from '@/lib/utils'

interface JobCardProps extends Job {
  compact?: boolean
}

export const JobCard = memo(function JobCard(props: JobCardProps) {
  const {
    jobTitle,
    enterpriseName,
    salaryRangeMin,
    salaryRangeMax,
    showSalary,
    location,
    enterpriseLogoUrl,
    isHot,
    compact = false,
  } = props

  const { saveJob, removeJob, isSaved, fetchSavedJobIds, isLoaded } = useSavedJobsStore()

  useEffect(() => {
    if (!isLoaded) {
      fetchSavedJobIds()
    }
  }, [isLoaded, fetchSavedJobIds])

  const saved = isSaved(props.id)

  const handleSaveJob = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (saved) {
      removeJob(props.id)
    } else {
      saveJob(props.id)
    }
  }

  const displaySalary = useMemo(() => {
    if (!showSalary) return 'Thỏa thuận'
    if (salaryRangeMin && salaryRangeMax) {
      return `${(salaryRangeMin / 1000000).toLocaleString('vi-VN')} - ${(salaryRangeMax / 1000000).toLocaleString('vi-VN')} triệu`
    }
    if (salaryRangeMin) {
      return `Từ ${(salaryRangeMin / 1000000).toLocaleString('vi-VN')} triệu`
    }
    if (salaryRangeMax) {
      return `Đến ${(salaryRangeMax / 1000000).toLocaleString('vi-VN')} triệu`
    }
    return 'Thỏa thuận'
  }, [showSalary, salaryRangeMin, salaryRangeMax])

  const displayLogo = enterpriseLogoUrl || '/placeholder-logo.png'

  return (
    <div className={cn(
      "bg-white rounded-lg border border-[#e8e8e8] hover:border-[#1B5583] hover:shadow-[0_4px_16px_rgba(27,85,131,0.12)] transition-all duration-200 group relative cursor-pointer h-full flex flex-col",
      compact ? "p-3" : "p-4"
    )}>
      {/* Top row: Logo + Title + Save */}
      <div className="flex gap-3 mb-3">
        {/* Company Logo */}
        <div className={cn(
          "rounded-md border border-[#e8e8e8] flex items-center justify-center flex-shrink-0 relative bg-white overflow-hidden",
          compact ? "w-[52px] h-[52px]" : "w-[68px] h-[68px]"
        )}>
          <Image
            src={displayLogo}
            alt={`${enterpriseName} Logo`}
            fill
            sizes={compact ? "52px" : "68px"}
            className="object-contain p-1"
          />
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-semibold text-[#212f3f] line-clamp-2 group-hover:text-[#1B5583] transition-colors leading-snug",
              compact ? "text-[13px]" : "text-sm"
            )}
            title={jobTitle}
          >
            {jobTitle}
          </h3>
          <p className={cn(
            "text-[#6f7882] truncate mt-1",
            compact ? "text-xs" : "text-[13px]"
          )} title={enterpriseName}>
            {enterpriseName}
          </p>
        </div>
      </div>

      {/* Bottom row: Salary + Location + Hot tag */}
      <div className="flex items-center gap-2 mt-auto flex-wrap">
        {/* Salary Badge - TopCV style red/orange */}
        <span className={cn(
          "inline-flex items-center font-medium bg-[#fff5f0] text-[#e74c3c] rounded px-2 py-1 whitespace-nowrap",
          compact ? "text-[11px]" : "text-xs"
        )}>
          {displaySalary}
        </span>

        {/* Location */}
        <span className={cn(
          "inline-flex items-center gap-1 text-[#6f7882] bg-[#f4f5f5] rounded px-2 py-1 whitespace-nowrap",
          compact ? "text-[11px]" : "text-xs"
        )}>
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {location}
        </span>

        {/* Hot Badge */}
        {isHot && (
          <span className="inline-flex items-center text-[10px] font-bold text-white bg-[#e74c3c] rounded px-1.5 py-0.5 uppercase">
            Hot
          </span>
        )}
      </div>

      {/* Save Button - always visible on hover */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-red-50 text-[#ccc] hover:text-[#e74c3c] transition-all opacity-0 group-hover:opacity-100"
        onClick={handleSaveJob}
        aria-label="Save job"
      >
        <Heart className={cn(
          "w-4 h-4 transition-colors",
          saved ? "fill-[#e74c3c] text-[#e74c3c]" : ""
        )} />
      </Button>
    </div>
  )
})
