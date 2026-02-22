'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Search, MapPin, Briefcase } from 'lucide-react'

import { JobCard } from './job-card'
import { Button } from '@/components/ui/button'
import { usePublicJobs } from '../hooks/use-public-jobs'
import { cn } from '@/lib/utils'

export function PublicJobList() {
    const searchParams = useSearchParams()
    const [page, setPage] = useState(1)
    const [pageSize] = useState(12)

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-[140px] rounded-lg bg-white border border-[#e8e8e8] animate-pulse" />
                ))}
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-16 bg-white rounded-lg border border-[#e8e8e8]">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fff5f0] flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-[#e74c3c]" />
                </div>
                <p className="text-[#212f3f] font-semibold text-lg">Không thể tải danh sách việc làm</p>
                <p className="text-[#6f7882] text-sm mt-1 mb-4">Vui lòng thử lại sau</p>
                <Button
                    variant="outline"
                    className="border-[#00b14f] text-[#00b14f] hover:bg-[#00b14f] hover:text-white"
                    onClick={() => window.location.reload()}
                >
                    Thử lại
                </Button>
            </div>
        )
    }

    // Empty state
    if (!data?.items || data.items.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-lg border border-[#e8e8e8]">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f4f5f5] flex items-center justify-center">
                    <Search className="w-8 h-8 text-[#a6acb2]" />
                </div>
                <p className="text-[#212f3f] font-semibold text-lg">Không tìm thấy việc làm nào</p>
                <p className="text-[#6f7882] text-sm mt-1">Vui lòng thử tìm kiếm với từ khóa khác.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Job Count Info */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-[#6f7882]">
                    Hiển thị <span className="font-semibold text-[#212f3f]">{data.items.length}</span> / <span className="font-semibold text-[#212f3f]">{data.totalCount}</span> việc làm
                </p>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.items.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.id}`} className="block h-full">
                        <JobCard {...job} />
                    </Link>
                ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg border-[#e8e8e8] text-[#6f7882] hover:border-[#00b14f] hover:text-[#00b14f]"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => {
                            const pageNum = i + 1
                            return (
                                <button
                                    key={pageNum}
                                    className={cn(
                                        "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                                        page === pageNum
                                            ? "bg-[#00b14f] text-white"
                                            : "text-[#6f7882] hover:bg-[#f4f5f5]"
                                    )}
                                    onClick={() => setPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}
                        {data.totalPages > 5 && (
                            <>
                                <span className="text-[#a6acb2] px-1">...</span>
                                <button
                                    className={cn(
                                        "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                                        page === data.totalPages
                                            ? "bg-[#00b14f] text-white"
                                            : "text-[#6f7882] hover:bg-[#f4f5f5]"
                                    )}
                                    onClick={() => setPage(data.totalPages)}
                                >
                                    {data.totalPages}
                                </button>
                            </>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg border-[#e8e8e8] text-[#6f7882] hover:border-[#00b14f] hover:text-[#00b14f]"
                        onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                        disabled={page === data.totalPages}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
