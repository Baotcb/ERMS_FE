/**
 * Job Search Hero Component
 * Hero section for job search page
 */

import { memo } from 'react'

export const JobHero = memo(function JobHero() {
  return (
    <div className="bg-gradient-to-br from-brand-dark to-[#3949AB] pt-20 pb-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12 transform translate-x-1/2" />
      <div className="max-w-6xl mx-auto px-4 lg:px-6 relative z-10 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Tìm kiếm việc làm mơ ước tại{' '}
          <span className="text-brand-coral">ERMS</span>
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">
          Cập nhật hàng ngàn tin tuyển dụng chất lượng cao mỗi ngày. Kết nối nhân
          tài với doanh nghiệp hàng đầu.
        </p>
      </div>
    </div>
  )
})
