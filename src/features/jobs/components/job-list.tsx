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
import { MOCK_JOBS } from '../../../__tests__/fixtures/job-mock-data'
import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

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
          className="text-[#00b14f] font-bold hover:underline flex items-center gap-1 group"
        >
          Xem tất cả việc làm <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {MOCK_JOBS.map((job) => (
          <motion.div key={job.id} variants={item}>
            <JobCard {...job} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-12 text-center">
        <Button
          variant="outline"
          className="border-[#00b14f] text-[#00b14f] hover:bg-[#00b14f] hover:text-white rounded-full px-8 py-6 h-auto text-base font-bold transition-all shadow-sm hover:shadow-md"
        >
          Xem thêm hàng ngàn việc làm khác
        </Button>
      </div>
    </section>
  )
})
