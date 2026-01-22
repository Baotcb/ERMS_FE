/**
 * Job Search Hero Component
 * Hero section for job search page
 */

import { memo } from 'react'
import { motion } from 'framer-motion'

export const JobHero = memo(function JobHero() {
  return (
    <div className="bg-gradient-to-r from-[#00b14f] to-[#00b14f] pt-20 pb-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 -skew-x-12 transform translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-6xl mx-auto px-4 lg:px-6 relative z-10 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
          Tìm kiếm việc làm mơ ước tại{' '}
          <span className="text-[#FFD700] drop-shadow-md">ERMS</span>
        </h1>
        <p className="text-white/90 text-lg max-w-2xl mx-auto animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150">
          Tiếp cận <strong>60.000+</strong> tin tuyển dụng việc làm mỗi ngày từ hàng nghìn doanh nghiệp uy tín tại Việt Nam
        </p>
      </div>
    </div>
  )
})
