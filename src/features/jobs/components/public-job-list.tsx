'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { JobCard } from './job-card'
import { Button } from '@/components/ui/button'
import { usePublicJobs } from '../hooks/use-public-jobs'

export function PublicJobList() {
    const searchParams = useSearchParams()
    const [page, setPage] = useState(1)
    const [pageSize] = useState(12) // Grid layout usually 3x4 or similar

    const search = searchParams.get('q') || undefined
    const location = searchParams.get('location') || undefined

    const { data, isLoading, error } = usePublicJobs({
        page,
        pageSize,
        search,
        location,
    })

    // Loading state
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-64 rounded-xl bg-slate-100 animate-pulse" />
                ))}
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Không thể tải danh sách việc làm. Vui lòng thử lại sau.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Thử lại</Button>
            </div>
        )
    }

    // Empty state
    if (!data?.items || data.items.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-slate-900">Không tìm thấy việc làm nào</h3>
                <p className="text-slate-500 mt-2">Vui lòng thử tìm kiếm với từ khóa khác.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map((job) => (
                    <div key={job.id} className="h-full">
                        {/* Wrap in link to detail page */}
                        <a href={`/jobs/${job.id}`} className="block h-full">
                            <JobCard {...job} />
                        </a>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Trước
                    </Button>
                    <span className="py-2 px-4 text-sm font-medium">
                        Trang {page} / {data.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                        disabled={page === data.totalPages}
                    >
                        Sau
                    </Button>
                </div>
            )}
        </div>
    )
}
