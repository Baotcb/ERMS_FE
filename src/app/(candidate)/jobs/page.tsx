import { Suspense } from 'react'
import { Metadata } from 'next'
import { PublicJobList } from '@/features/jobs/components/public-job-list'

export const metadata: Metadata = {
    title: 'Tìm việc làm nhanh, việc làm mới nhất | ERMS',
    description: 'Tìm kiếm hàng nghìn cơ hội việc làm hấp dẫn tại các công ty hàng đầu',
}

export default function JobSearchPage() {
    return (
        <div className="min-h-screen bg-[#f4f5f5]">
            {/* Search Header Bar */}
            <div className="bg-gradient-to-r from-[#00b14f] to-[#009643] py-6">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-xl font-bold text-white mb-1">
                        Tìm kiếm việc làm
                    </h1>
                    <p className="text-white/80 text-sm">
                        Khám phá cơ hội nghề nghiệp phù hợp với bạn
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-6xl py-6">
                <Suspense fallback={
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="h-[140px] rounded-lg bg-white border border-[#e8e8e8] animate-pulse" />
                        ))}
                    </div>
                }>
                    <PublicJobList />
                </Suspense>
            </div>
        </div>
    )
}
