/**
 * Job Card Component
 * Memoized for performance optimization
 */

'use client'

import { memo, useMemo } from 'react'
import Image from 'next/image'
import { MapPin, DollarSign, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Job } from '../types'
import { useSavedJobsStore } from '../stores/use-saved-jobs-store'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

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
  const { toast } = useToast()
  const { saveJob, removeJob, savedJobs } = useSavedJobsStore()

  const isSaved = savedJobs.some((job) => job.id === props.id)

  const handleSaveJob = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isSaved) {
      removeJob(props.id)
      toast({
        title: "Đã bỏ lưu công việc",
        description: props.jobTitle,
      })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { compact, ...jobData } = props
      saveJob(jobData)
      toast({
        title: "Đã lưu công việc",
        description: "Bạn có thể xem lại trong mục Việc làm đã lưu",
      })
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
  const displayLogo = enterpriseLogoUrl || '/placeholder-logo.png' // Fallback needed

  return (
    <div className={cn(
      "bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-primary/30 hover:-translate-y-1 transition-all duration-300 group relative cursor-pointer h-full flex flex-col",
      compact ? "p-3" : "p-4"
    )}>
      <div className="flex gap-3 mb-2">
        <div className={cn(
          "rounded-lg border border-slate-100 p-1 flex items-center justify-center flex-shrink-0 relative bg-white overflow-hidden group-hover:border-brand-primary/20 transition-colors",
          compact ? "w-14 h-14" : "w-20 h-20"
        )}>
          {/* Handle Image src carefully */}
          <Image
            src={displayLogo}
            alt={`${enterpriseName} Logo`}
            fill
            sizes={compact ? "60px" : "80px"}
            className="object-contain p-1"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-bold text-slate-900 line-clamp-2 group-hover:text-[#00b14f] transition-colors mb-1",
              compact ? "text-sm min-h-[2.5rem]" : "text-base min-h-[3rem]"
            )}
            title={jobTitle}
          >
            {jobTitle}
          </h3>
          <p className={cn("text-slate-500 truncate", compact ? "text-xs" : "text-sm")} title={enterpriseName}>
            {enterpriseName}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <div className={cn(
          "flex items-center gap-1.5 text-[#00b14f] font-semibold bg-[#FAFAFA] rounded w-fit",
          compact ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm bg-[#00b14f]/5"
        )}>
          <DollarSign className={compact ? "w-3 h-3" : "w-4 h-4"} />
          <span>{displaySalary}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-400">
            <MapPin className={compact ? "w-3 h-3" : "w-4 h-4"} />
            <span className={compact ? "text-[10px]" : "text-xs"}>{location}</span>
          </div>
          {isHot && (
            <Badge className="bg-red-50 text-red-600 hover:bg-red-100 border-0 rounded px-1.5 py-0 text-[10px] uppercase font-bold">
              Hot
            </Badge>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 rounded-full hover:bg-red-50 hover:text-red-500 text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
        onClick={handleSaveJob}
        aria-label="Save job"
      >
        <Heart className={cn("w-4 h-4 transition-colors", isSaved ? "fill-red-500 text-red-500" : "text-slate-300 group-hover:text-red-500")} />
      </Button>
    </div>
  )
})
