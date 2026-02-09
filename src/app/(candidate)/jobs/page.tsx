import { Suspense } from 'react'
import { Metadata } from 'next'
import { Loader2 } from 'lucide-react'
import { PublicJobList } from '@/features/jobs/components/public-job-list'

export const metadata: Metadata = {
    title: 'Tìm việc làm | ERMS',
    description: 'Tìm kiếm hàng nghìn cơ hội việc làm hấp dẫn',
}

export default function JobSearchPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Tìm kiếm việc làm</h1>
                    <p className="text-slate-500 mt-2">Khám phá cơ hội nghề nghiệp phù hợp với bạn</p>
                </div>

                {/* Filters could go here */}

                <Suspense fallback={
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                    </div>
                }>
                    <PublicJobList />
                </Suspense>
            </div>
        </div>
    )
}
