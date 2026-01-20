"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JobCard } from "@/features/domains/jobs/components/job-card"
import { MOCK_JOBS } from "@/features/domains/jobs/constants/job-mock-data"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function BestJobsSection() {
    const [filter, setFilter] = useState("random")

    return (
        <section className="py-12 bg-[#F7F9FC]" style={{ height: '750px' }}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ height: '150px' }}>
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
                                onClick={() => setFilter("random")}
                            >
                                Ngẫu nhiên
                            </Button>
                            <Button
                                variant={filter === "hanoi" ? "default" : "outline"}
                                className={filter === "hanoi" ? "bg-[#00b14f] hover:bg-[#00b14f]/90 text-white border-0" : "bg-white border-slate-200 text-slate-600 hover:text-[#00b14f] hover:border-[#00b14f]"}
                                size="sm"
                                onClick={() => setFilter("hanoi")}
                            >
                                Hà Nội
                            </Button>
                            <Button
                                variant={filter === "hcm" ? "default" : "outline"}
                                className={filter === "hcm" ? "bg-[#00b14f] hover:bg-[#00b14f]/90 text-white border-0" : "bg-white border-slate-200 text-slate-600 hover:text-[#00b14f] hover:border-[#00b14f]"}
                                size="sm"
                                onClick={() => setFilter("hcm")}
                            >
                                TP. Hồ Chí Minh
                            </Button>
                            <Button
                                variant={filter === "north" ? "default" : "outline"}
                                className={filter === "north" ? "bg-[#00b14f] hover:bg-[#00b14f]/90 text-white border-0" : "bg-white border-slate-200 text-slate-600 hover:text-[#00b14f] hover:border-[#00b14f]"}
                                size="sm"
                                onClick={() => setFilter("north")}
                            >
                                Miền Bắc
                            </Button>
                            <Button
                                variant={filter === "south" ? "default" : "outline"}
                                className={filter === "south" ? "bg-[#00b14f] hover:bg-[#00b14f]/90 text-white border-0" : "bg-white border-slate-200 text-slate-600 hover:text-[#00b14f] hover:border-[#00b14f]"}
                                size="sm"
                                onClick={() => setFilter("south")}
                            >
                                Miền Nam
                            </Button>
                        </div>

                        <div className="flex gap-1 ml-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200 bg-white hover:bg-slate-50 text-slate-400">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200 bg-white hover:bg-slate-50 text-slate-400">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ height: '550px', overflow: 'auto' }}>
                    {MOCK_JOBS.slice(0, 9).map((job) => (
                        <div key={job.id} className="h-full">
                            <JobCard {...job} compact={true} />
                        </div>
                    ))}
                </div>

                <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium text-[#00b14f]">22</span>
                        <span className="text-sm text-slate-400">/ 50 trang</span>
                        <Button variant="ghost" size="icon" className="text-[#00b14f] hover:bg-[#00b14f]/10">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
