/**
 * Job Card Component
 * Memoized for performance optimization
 */

'use client'

import { memo } from 'react'
import Image from 'next/image'
import { MapPin, DollarSign, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Job } from '../constants/job-mock-data'

interface JobCardProps extends Job {}

export const JobCard = memo(function JobCard({
  title,
  company,
  salary,
  location,
  logo,
  isHot,
}: JobCardProps) {
  const handleSaveJob = () => {
    // TODO: Implement save job functionality
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all group relative cursor-pointer">
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          <Image
            src={logo}
            alt={`${company} Logo`}
            fill
            sizes="48px"
            className="object-contain p-1"
          />
        </div>
        <div className="flex-1 min-w-0">
          {isHot && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white rounded mb-1 px-1.5 py-0 text-[10px] uppercase font-bold">
              Hot
            </Badge>
          )}
          <h3
            className="font-bold text-slate-900 truncate group-hover:text-brand-primary transition-colors text-lg mb-1"
            title={title}
          >
            {title}
          </h3>
          <p className="text-sm text-slate-500 truncate" title={company}>
            {company}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-brand-primary font-bold">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">{salary}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="text-xs">{location}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-500 text-slate-300 transition-colors"
          onClick={handleSaveJob}
          aria-label="Save job"
        >
          <Heart className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
})
