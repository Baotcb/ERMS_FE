'use client'

import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

import { ConfirmScheduleDialog } from './confirm-schedule-dialog'
import { HRInterviewTable } from './hr-interview-table'
import { useAllInterviews } from '../../hooks/use-interview'
import type { InterviewDto } from '../../types/interview-types'

const STATUS_TABS = [
    { value: '', label: 'Tất cả' },
    { value: 'PendingSchedule', label: 'Chờ xếp lịch' },
    { value: 'Scheduled', label: 'Đã xếp lịch' },
    { value: 'Completed', label: 'Hoàn thành' },
]

const PAGE_SIZE = 10

export function HRInterviewList() {
    const [statusFilter, setStatusFilter] = useState('')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [scheduleDialog, setScheduleDialog] = useState<{ open: boolean; item: InterviewDto | null }>({ open: false, item: null })

    const { data, isLoading, error, mutate } = useAllInterviews({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        statusFilter: statusFilter || undefined,
    })

    const totalCount = data?.totalCount ?? 0
    const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

    const interviews = data?.items ?? []

    // Client-side search filter
    const filteredInterviews = interviews.filter(i => {
        if (!search) return true
        const q = search.toLowerCase()
        return i.candidateName.toLowerCase().includes(q) || i.jobTitle.toLowerCase().includes(q)
    })

    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#0C4A6E]">
                    Quản lý phỏng vấn
                </h1>
                <p className="text-[#0C4A6E]/70 text-base">
                    Xem và xác nhận lịch phỏng vấn cho các ứng viên đã được phân công.
                </p>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                            placeholder="Tìm ứng viên hoặc vị trí..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-sky-200 focus-visible:border-sky-300"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">
                        {STATUS_TABS.map(tab => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => { setStatusFilter(tab.value); setPage(1) }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${statusFilter === tab.value
                                    ? 'bg-white shadow-sm text-[#0C4A6E]'
                                    : 'text-slate-500 hover:text-[#0369A1]'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Data Table Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 flex flex-col min-h-[420px]">
                <div className="flex-1 overflow-x-auto">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500 text-sm">
                            Không thể tải danh sách phỏng vấn.
                        </div>
                    ) : (
                        <HRInterviewTable
                            data={filteredInterviews}
                            onSchedule={(item) => setScheduleDialog({ open: true, item })}
                        />
                    )}
                </div>

                {/* Pagination */}
                <div className="mt-auto px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                    </Button>
                    <span className="text-sm font-medium text-slate-600">
                        Trang {page} / {pageCount}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                        disabled={page === pageCount}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
                    >
                        Tiếp
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Confirm Schedule Dialog */}
            {scheduleDialog.item && (
                <ConfirmScheduleDialog
                    open={scheduleDialog.open}
                    onOpenChange={(open) => setScheduleDialog(prev => ({ ...prev, open }))}
                    applicationId={scheduleDialog.item.applicationId}
                    candidateName={scheduleDialog.item.candidateName}
                    interviewerNames={scheduleDialog.item.participants.map(p => p.employeeName)}
                    onSuccess={() => {
                        setScheduleDialog({ open: false, item: null })
                        mutate()
                    }}
                />
            )}
        </div>
    )
}
