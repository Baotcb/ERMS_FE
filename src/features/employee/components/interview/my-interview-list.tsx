'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Clock, Video, Building2, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMyInterviews } from '../../hooks/use-interview'
import type { MyInterviewDto } from '../../types/interview-types'

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string }> = {
        PendingSchedule: { label: 'Chờ xếp lịch', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
        Scheduled: { label: 'Đã xếp lịch', className: 'bg-blue-100 text-blue-700 border-blue-200' },
        Completed: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700 border-green-200' },
        Cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-700 border-red-200' },
    }
    const c = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' }
    return <Badge variant="outline" className={`text-xs min-w-[100px] justify-center ${c.className}`}>{c.label}</Badge>
}

function InterviewTypeBadge({ type }: { type: string }) {
    const config: Record<string, { label: string; className: string }> = {
        Technical: { label: 'Kỹ thuật', className: 'bg-purple-100 text-purple-700 border-purple-200' },
        Cultural: { label: 'Văn hóa', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        Combined: { label: 'Tổng hợp', className: 'bg-teal-100 text-teal-700 border-teal-200' },
    }
    const c = config[type] ?? { label: type, className: 'bg-gray-100 text-gray-600 border-gray-200' }
    return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>
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

    const { data, isLoading, error } = useMyInterviews({
        pageNumber: page,
        pageSize: 20,
        status: statusFilter || undefined,
    })

    const interviews = data?.items ?? []
    const totalPages = data ? Math.ceil(data.totalCount / data.pageSize) : 1

    const handleFeedback = (interview: MyInterviewDto) => {
        const params = new URLSearchParams({
            interviewId: interview.interviewId,
            candidateName: interview.candidateName,
            jobTitle: interview.jobTitle,
            roundLabel: `Vòng ${interview.roundNumber} — ${interview.interviewType}`,
            interviewDate: format(new Date(interview.scheduledAt), 'dd/MM/yyyy HH:mm'),
            interviewFormat: interview.interviewFormat,
        })
        router.push(`/enterprise/employee/feedback/${interview.applicationId}?${params}`)
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="border-b border-slate-200 pb-6">
                <h1 className="text-2xl font-bold text-[#0F4C75]">Lịch phỏng vấn của tôi</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Danh sách các buổi phỏng vấn bạn được phân công tham gia.
                </p>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-2 flex-wrap">
                {STATUS_FILTERS.map(f => (
                    <button
                        key={f.value}
                        type="button"
                        onClick={() => { setStatusFilter(f.value); setPage(1) }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === f.value
                            ? 'bg-[#0F4C75] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Interview Cards */}
            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-slate-100 rounded w-1/3" />
                                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-sm text-red-600">Không thể tải danh sách phỏng vấn.</p>
                </div>
            ) : interviews.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium text-slate-600">Chưa có lịch phỏng vấn nào</p>
                    <p className="text-sm text-slate-400 mt-1">
                        {statusFilter ? 'Không tìm thấy phỏng vấn với bộ lọc hiện tại.' : 'Bạn sẽ thấy lịch ở đây khi được phân công.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {interviews.map(interview => (
                        <div
                            key={interview.interviewId}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                {/* Left: Info */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#BBE1FA]/40 flex items-center justify-center text-[#0F4C75] font-bold text-lg shrink-0">
                                        {interview.candidateName.charAt(0)}
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="font-semibold text-slate-800">{interview.candidateName}</p>
                                            <p className="text-sm text-slate-500">{interview.jobTitle}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <StatusBadge status={interview.status} />
                                            <InterviewTypeBadge type={interview.interviewType} />
                                            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 border-slate-200">
                                                Vòng {interview.roundNumber}
                                            </Badge>
                                        </div>
                                        {interview.status === 'Scheduled' && (
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-1">
                                                <span className="flex items-center gap-1.5">
                                                    <CalendarDays className="w-4 h-4 text-slate-400" />
                                                    {format(new Date(interview.scheduledAt), "EEEE, dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    {interview.duration} phút
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    {interview.interviewFormat === 'Online'
                                                        ? <Video className="w-4 h-4 text-blue-400" />
                                                        : <Building2 className="w-4 h-4 text-orange-400" />
                                                    }
                                                    {interview.interviewFormat === 'Online'
                                                        ? 'Online'
                                                        : interview.location || 'Tại văn phòng'
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                                    {interview.status === 'Scheduled' && interview.interviewFormat === 'Online' && interview.meetingLink && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
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
                                            onClick={() => handleFeedback(interview)}
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
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                        Trang trước
                    </Button>
                    <span className="text-sm text-slate-600">
                        Trang <span className="font-bold text-slate-900">{page}</span> / {totalPages}
                    </span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                        Trang sau
                    </Button>
                </div>
            )}
        </div>
    )
}
