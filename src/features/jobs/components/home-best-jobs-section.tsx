"use client"

import { useState } from "react"
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JobCard } from "./job-card"
import { usePublicJobs } from "../hooks/use-public-jobs"
import { cn } from "@/lib/utils"

const FILTER_TABS = [
    { key: "random", label: "Tất cả" },
    { key: "hanoi", label: "Hà Nội" },
    { key: "hcm", label: "TP. Hồ Chí Minh" },
    { key: "north", label: "Miền Bắc" },
    { key: "south", label: "Miền Nam" },
] as const

export function BestJobsSection() {
    const [filter, setFilter] = useState("random")
    const [page, setPage] = useState(1)
    const pageSize = 12

    const getLocation = (filter: string) => {
        switch (filter) {
            case 'hanoi': return 'Hà Nội'
            case 'hcm': return 'Hồ Chí Minh'
            case 'north': return 'Miền Bắc'
            case 'south': return 'Miền Nam'
            default: return undefined
        }
    }

    const { data, isLoading } = usePublicJobs({
        page,
        pageSize,
        location: getLocation(filter)
    })

    return (
        <section className="py-10 bg-[#EDE8F0]">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-[#212f3f]">
                            Việc làm tốt nhất
                        </h2>
                        <p className="text-[#6f7882] text-sm mt-1">
                            Khám phá cơ hội nghề nghiệp mới nhất dành cho bạn
                        </p>
                    </div>

                    {/* Filter Tabs - TopCV style */}
                    <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-[#e8e8e8] shadow-sm">
                        {FILTER_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                                    filter === tab.key
                                        ? "bg-[#1B5583] text-white shadow-sm"
                                        : "text-[#6f7882] hover:text-[#212f3f] hover:bg-[#EDE8F0]"
                                )}
                                onClick={() => { setFilter(tab.key); setPage(1) }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Job Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="h-[140px] rounded-lg bg-white border border-[#e8e8e8] animate-pulse" />
                        ))}
                    </div>
                ) : !data?.items || data.items.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-[#e8e8e8]">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#EDE8F0] flex items-center justify-center">
                            <Search className="w-8 h-8 text-[#a6acb2]" />
                        </div>
                        <p className="text-[#6f7882] font-medium">Chưa có việc làm nào phù hợp.</p>
                        <p className="text-[#a6acb2] text-sm mt-1">Vui lòng thử lọc với tiêu chí khác</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.items.map((job) => (
                            <Link key={job.id} href={`/jobs/${job.id}`} className="block h-full">
                                <JobCard {...job} compact={true} />
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-8">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-lg border-[#e8e8e8] text-[#6f7882] hover:border-[#1B5583] hover:text-[#1B5583]"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => {
                                const pageNum = i + 1
                                return (
                                    <button
                                        key={pageNum}
                                        className={cn(
                                            "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                                            page === pageNum
                                                ? "bg-[#1B5583] text-white"
                                                : "text-[#6f7882] hover:bg-[#EDE8F0]"
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
                                                ? "bg-[#1B5583] text-white"
                                                : "text-[#6f7882] hover:bg-[#EDE8F0]"
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
                            className="h-9 w-9 rounded-lg border-[#e8e8e8] text-[#6f7882] hover:border-[#1B5583] hover:text-[#1B5583]"
                            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                            disabled={page === data.totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                {/* View All Link */}
                <div className="text-center mt-6">
                    <Link href="/jobs">
                        <Button
                            variant="outline"
                            className="border-[#1B5583] text-[#1B5583] hover:bg-[#1B5583] hover:text-white font-semibold px-8 h-11 rounded-lg transition-colors"
                        >
                            Xem tất cả việc làm
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

// Fallback icon for empty state
function Search(props: React.SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}
