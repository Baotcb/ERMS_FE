"use client"

import { useState } from "react"
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Briefcase } from "lucide-react"
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
        <section className="py-10 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* ===== Section Header - TopCV style ===== */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-[#212f3f]">
                        Việc làm tốt nhất
                    </h2>

                    {/* View all + nav arrows */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/jobs"
                            className="text-sm font-medium text-[#1B5583] hover:underline hidden md:block"
                        >
                            Xem tất cả
                        </Link>
                        <div className="flex items-center gap-1">
                            <button
                                className="w-8 h-8 rounded-full border border-[#e8e8e8] flex items-center justify-center text-[#6f7882] hover:border-[#1B5583] hover:text-[#1B5583] transition-colors disabled:opacity-40"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                className="w-8 h-8 rounded-full border border-[#e8e8e8] flex items-center justify-center text-[#6f7882] hover:border-[#1B5583] hover:text-[#1B5583] transition-colors disabled:opacity-40"
                                onClick={() => setPage(p => Math.min(data?.totalPages || 1, p + 1))}
                                disabled={page === (data?.totalPages || 1)}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===== Filter Tabs - TopCV pill style ===== */}
                <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1">
                    <div className="flex items-center gap-2 flex-nowrap">
                        {FILTER_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                className={cn(
                                    "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                                    filter === tab.key
                                        ? "bg-[#1B5583] text-white border-[#1B5583] shadow-sm"
                                        : "text-[#6f7882] border-[#e8e8e8] hover:text-[#1B5583] hover:border-[#1B5583] bg-white"
                                )}
                                onClick={() => { setFilter(tab.key); setPage(1) }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ===== Job Grid - 3 columns ===== */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="h-[130px] rounded-lg bg-[#f4f5f5] border border-[#e8e8e8] animate-pulse" />
                        ))}
                    </div>
                ) : !data?.items || data.items.length === 0 ? (
                    <div className="text-center py-16 bg-[#f4f5f5] rounded-lg border border-[#e8e8e8]">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
                            <Briefcase className="w-8 h-8 text-[#a6acb2]" />
                        </div>
                        <p className="text-[#6f7882] font-medium">Chưa có việc làm nào phù hợp.</p>
                        <p className="text-[#a6acb2] text-sm mt-1">Vui lòng thử lọc với tiêu chí khác</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.items.map((job) => (
                            <Link key={job.id} href={`/jobs/${job.id}`} className="block h-full">
                                <JobCard {...job} />
                            </Link>
                        ))}
                    </div>
                )}

                {/* ===== Bottom Pagination - TopCV style "X / Y trang" ===== */}
                {data && data.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-8">
                        <button
                            className="w-9 h-9 rounded-full border border-[#e8e8e8] flex items-center justify-center text-[#6f7882] hover:border-[#1B5583] hover:text-[#1B5583] transition-colors disabled:opacity-40"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1B5583] text-white font-bold">
                                {page}
                            </span>
                            <span className="text-[#6f7882]">/</span>
                            <span className="text-[#6f7882] font-medium">{data.totalPages} trang</span>
                        </div>

                        <button
                            className="w-9 h-9 rounded-full border border-[#e8e8e8] flex items-center justify-center text-[#6f7882] hover:border-[#1B5583] hover:text-[#1B5583] transition-colors disabled:opacity-40"
                            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                            disabled={page === data.totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Mobile View All */}
                <div className="text-center mt-6 md:hidden">
                    <Link href="/jobs">
                        <Button
                            variant="outline"
                            className="border-[#1B5583] text-[#1B5583] hover:bg-[#1B5583] hover:text-white font-semibold px-8 h-11 rounded-lg transition-colors w-full"
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
