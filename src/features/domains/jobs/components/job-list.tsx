/**
 * Job List Component
 * Displays list of job cards with header
 */

'use client'

import { memo } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { JobCard } from './job-card'
import { MOCK_JOBS } from '../constants/job-mock-data'

export const JobList = memo(function JobList() {
  return (
    <section className="mt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark mb-1">
            Việc làm tốt nhất
          </h2>
          <p className="text-slate-500 text-sm">
            Được đề xuất dựa trên hồ sơ của bạn
          </p>
        </div>
        <Link
          href="/not-found"
          className="text-brand-primary font-bold hover:underline flex items-center gap-1"
        >
          Xem tất cả việc làm <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_JOBS.map((job) => (
          <JobCard key={job.id} {...job} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button
          variant="outline"
          className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-full px-8 py-6 h-auto text-base font-bold transition-all"
        >
          Xem thêm hàng ngàn việc làm khác
        </Button>
      </div>
    </section>
  )
})
