"use client"

import { useState } from "react"
import Link from 'next/link'
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JobCard } from "./job-card"
import { usePublicJobs } from "../hooks/use-public-jobs"

export function BestJobsSection() {
    const [filter, setFilter] = useState("random")
    const [page, setPage] = useState(1)
    const pageSize = 9

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
        <section className="py-12 bg-[#F7F9FC]">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-[#0F4C75] uppercase">Việc làm tốt nhất</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 mr-2">
                            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">Lọc theo:</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={filter === "random" ? "default" : "outline"}
                                className={filter === "random" ? "bg-[#00b14f] hover:bg-[#00b14f]/90 text-white border-0" : "bg-white border-slate-200 text-slate-600 hover:text-[#00b14f] hover:border-[#00b14f]"}
                                size="sm"
                                onClick={() => { setFilter("random"); setPage(1) }}
                            >
                                Ngẫu nhiên
                            </Button>
                            <Button
                                variant={filter === "hanoi" ? "default" : "outline"}
                                className={filter === "hanoi" ? "bg-[#00b14f] hover:bg-[#00b14f]/90 text-white border-0" : "bg-white border-slate-200 text-slate-600 hover:text-[#00b14f] hover:border-[#00b14f]"}
                                size="sm"
                                onClick={() => { setFilter("hanoi"); setPage(1) }}
                            >
                                Hà Nội
                            </Button>
                            <Button
                                variant={filter === "hcm" ? "default" : "outline"}
                                className={filter === "hcm" ? "bg-[#00b14f] hover:bg-[#00b14f]/90 text-white border-0" : "bg-white border-slate-200 text-slate-600 hover:text-[#00b14f] hover:border-[#00b14f]"}
                                size="sm"
                                onClick={() => { setFilter("hcm"); setPage(1) }}
                            >
                                TP. Hồ Chí Minh
                            </Button>
                            <Button
                                variant={filter === "north" ? "default" : "outline"}
                                className={filter === "north" ? "bg-[#00b14f] hover:bg-[#00b14f]/90 text-white border-0" : "bg-white border-slate-200 text-slate-600 hover:text-[#00b14f] hover:border-[#00b14f]"}
                                size="sm"
                                onClick={() => { setFilter("north"); setPage(1) }}
                            >
                                Miền Bắc
                            </Button>
                            <Button
                                variant={filter === "south" ? "default" : "outline"}
                                className={filter === "south" ? "bg-[#00b14f] hover:bg-[#00b14f]/90 text-white border-0" : "bg-white border-slate-200 text-slate-600 hover:text-[#00b14f] hover:border-[#00b14f]"}
                                size="sm"
                                onClick={() => { setFilter("south"); setPage(1) }}
                            >
                                Miền Nam
                            </Button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="h-64 rounded-xl bg-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : !data?.items || data.items.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                        <p className="text-slate-500">Chưa có việc làm nào phù hợp.</p>
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

                {data && data.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-medium text-[#00b14f]">{page}</span>
                            <span className="text-sm text-slate-400">/ {data.totalPages} trang</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-[#00b14f] hover:bg-[#00b14f]/10"
                                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                                disabled={page === data.totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
