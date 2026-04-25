'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    CalendarDays, Video, Building2,
    MessageSquare, CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useMyInterviews } from '../../hooks/use-interview'
import type { MyInterviewDto } from '../../types/interview-types'

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; bg: string; text: string; dot: string }> = {
        PendingSchedule: { label: 'Chờ xếp lịch', bg: 'bg-yellow-100 border-yellow-200/50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
        Scheduled: { label: 'Đã xếp lịch', bg: 'bg-blue-100 border-blue-200/50', text: 'text-blue-700', dot: 'bg-blue-500' },
        Completed: { label: 'Hoàn thành', bg: 'bg-green-100 border-green-200/50', text: 'text-green-700', dot: 'bg-green-500' },
        Cancelled: { label: 'Đã hủy', bg: 'bg-red-100 border-red-200/50', text: 'text-red-700', dot: 'bg-red-500' },
    }
    const c = config[status] ?? { label: status, bg: 'bg-gray-100 border-gray-200/50', text: 'text-gray-600', dot: 'bg-gray-400' }

    return (
        <span className={`inline-flex items-center justify-center min-w-[110px] px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 ${c.dot}`} />
            {c.label}
        </span>
    )
}

function InterviewTypeBadge({ type }: { type: string }) {
    const config: Record<string, { label: string; className: string }> = {
        Technical: { label: 'Kỹ thuật', className: 'bg-purple-100 text-purple-700 border-purple-200' },
        Cultural: { label: 'Văn hóa', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        Combined: { label: 'Tổng hợp', className: 'bg-teal-100 text-teal-700 border-teal-200' },
    }
    const c = config[type] ?? { label: type, className: 'bg-gray-100 text-gray-600 border-gray-200' }
    return <Badge variant="outline" className={`text-xs w-full justify-center ${c.className}`}>{c.label}</Badge>
}

/** Kiểm tra scheduledAt có phải ngày hợp lệ (không phải default DateTime C# 0001-01-01) */
function hasValidSchedule(scheduledAt: string | null | undefined): boolean {
    if (!scheduledAt) return false
    // Backend C# trả DateTime.MinValue = "0001-01-01T00:00:00"
    if (scheduledAt.startsWith('0001-01-01')) return false
    const date = new Date(scheduledAt)
    return !isNaN(date.getTime()) && date.getFullYear() > 1
}

const STATUS_FILTERS = [
    { value: '', label: 'Tất cả' },
    { value: 'Scheduled', label: 'Đã xếp lịch' },
    { value: 'PendingSchedule', label: 'Chờ xếp lịch' },
    { value: 'Completed', label: 'Hoàn thành' },
]

export function MyInterviewList() {
    const router = useRouter()
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const PAGE_SIZE = 20

    const { data, isLoading, error } = useMyInterviews({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        status: statusFilter || undefined,
    })

    const interviews = data?.items ?? []
    const totalCount = data?.totalCount ?? 0
    const totalPages = Math.max(1, data ? Math.ceil(totalCount / data.pageSize) : 1)

    const handleFeedback = (interview: MyInterviewDto) => {
        const params = new URLSearchParams({
            interviewId: interview.interviewId,
            candidateName: interview.candidateName,
            jobTitle: interview.jobTitle,
            roundLabel: `Vòng ${interview.roundNumber} — ${interview.interviewType}`,
            interviewDate: hasValidSchedule(interview.scheduledAt) ? format(new Date(interview.scheduledAt!), 'dd/MM/yyyy HH:mm') : '',
            interviewFormat: interview.interviewFormat,
        })
        router.push(`/enterprise/employee/feedback/${interview.applicationId}?${params}`)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#0C4A6E]">
                    Lịch phỏng vấn của tôi
                </h1>
                <p className="text-[#0C4A6E]/70 text-base">
                    Danh sách các buổi phỏng vấn bạn được phân công tham gia.
                </p>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => { setStatusFilter(f.value); setPage(1) }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${statusFilter === f.value
                                ? 'bg-white shadow-sm text-[#0C4A6E]'
                                : 'text-slate-500 hover:text-[#0369A1]'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
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
                    ) : interviews.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                            <CalendarDays className="w-8 h-8 text-[#0EA5E9] mb-4" />
                            <h3 className="text-lg font-semibold text-slate-600">Chưa có lịch phỏng vấn nào</h3>
                            <p className="text-slate-400 mt-2 max-w-sm">
                                {statusFilter ? 'Không tìm thấy phỏng vấn với bộ lọc hiện tại.' : 'Bạn sẽ thấy lịch ở đây khi được phân công.'}
                            </p>
                        </div>
                    ) : (
                        <MyInterviewTable
                            data={interviews}
                            onFeedback={handleFeedback}
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
                        Trang {page} / {totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
                    >
                        Tiếp
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

interface MyInterviewTableProps {
    data: MyInterviewDto[]
    onFeedback: (item: MyInterviewDto) => void
}

function MyInterviewTable({ data, onFeedback }: MyInterviewTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Ứng viên
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Vị trí
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Vòng / Loại
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Lịch phỏng vấn
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Trạng thái
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                        Hành động
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
                {data.map(interview => (
                    <TableRow key={interview.interviewId} className="hover:bg-sky-50/30 transition-colors group">
                        {/* Candidate */}
                        <TableCell className="px-6 py-4 align-middle">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#BBE1FA]/40 flex items-center justify-center text-[#0F4C75] font-bold text-sm shrink-0">
                                    {interview.candidateName.charAt(0)}
                                </div>
                                <p className="font-semibold text-[#0C4A6E] text-sm">{interview.candidateName}</p>
                            </div>
                        </TableCell>

                        {/* Job Title */}
                        <TableCell className="px-6 py-4 align-middle text-sm text-slate-600 max-w-[200px]">
                            <span className="line-clamp-2">{interview.jobTitle}</span>
                        </TableCell>

                        {/* Round / Type */}
                        <TableCell className="px-6 py-4 align-middle">
                            <div className="flex flex-col gap-1 w-[90px]">
                                <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 border-slate-200 w-full justify-center">
                                    Vòng {interview.roundNumber}
                                </Badge>
                                <InterviewTypeBadge type={interview.interviewType} />
                            </div>
                        </TableCell>

                        {/* Schedule Info */}
                        <TableCell className="px-6 py-4 align-middle whitespace-nowrap">
                            {hasValidSchedule(interview.scheduledAt) ? (
                                <div className="flex flex-col gap-0.5 text-sm text-slate-600">
                                    <span>{format(new Date(interview.scheduledAt!), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        {interview.interviewFormat === 'Online'
                                            ? <><Video className="w-3 h-3" /> Online</>
                                            : <><Building2 className="w-3 h-3" /> {interview.location || 'Tại VP'}</>
                                        }
                                        {' · '}{interview.duration} phút
                                    </span>
                                </div>
                            ) : interview.status === 'PendingSchedule' ? (
                                <span className="text-slate-400 text-sm italic">HR chưa xếp lịch phỏng vấn</span>
                            ) : (
                                <span className="text-slate-400 text-sm">—</span>
                            )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="px-6 py-4 align-middle text-center">
                            <StatusBadge status={interview.status} />
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-6 py-4 align-middle text-right">
                            {interview.status === 'Scheduled' && interview.interviewFormat === 'Online' && interview.meetingLink && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs mr-2"
                                    onClick={() => window.open(interview.meetingLink, '_blank')}
                                >
                                    <Video className="w-3 h-3 mr-1" />
                                    Vào phòng họp
                                </Button>
                            )}
                            {interview.status === 'Scheduled' && !interview.hasSubmittedFeedback && (
                                <Button
                                    size="sm"
                                    className="text-xs bg-[#0F4C75] hover:bg-[#3282B8]"
                                    onClick={() => onFeedback(interview)}
                                >
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    Gửi đánh giá
                                </Button>
                            )}
                            {interview.hasSubmittedFeedback && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Đã đánh giá
                                </Badge>
                            )}
                            {interview.status === 'Completed' && !interview.hasSubmittedFeedback && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    Hoàn thành
                                </Badge>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
