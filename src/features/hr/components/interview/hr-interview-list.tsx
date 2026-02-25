'use client'

import { useState } from 'react'
import { CalendarDays, Clock, Video, Building2, Users, AlertCircle, CheckCircle2, Search, CalendarCheck } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ConfirmScheduleDialog } from './confirm-schedule-dialog'

// Types tạm (sẽ dùng API GET khi backend có)
interface InterviewItem {
    interviewId: string
    applicationId: string
    candidateName: string
    candidateEmail?: string
    jobTitle: string
    interviewType: string
    interviewFormat: 'Online' | 'Offline'
    roundNumber: number
    scheduledAt?: string
    duration: number
    location?: string
    meetingLink?: string
    status: string // PendingSchedule | Scheduled | Completed | Cancelled
    interviewerNames: string[]
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string }> = {
        PendingSchedule: { label: 'Chờ xếp lịch', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
        Scheduled: { label: 'Đã xếp lịch', className: 'bg-blue-100 text-blue-700 border-blue-200' },
        Completed: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700 border-green-200' },
        Cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-700 border-red-200' },
    }
    const c = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' }
    return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>
}

const STATUS_TABS = [
    { value: '', label: 'Tất cả' },
    { value: 'PendingSchedule', label: 'Chờ xếp lịch' },
    { value: 'Scheduled', label: 'Đã xếp lịch' },
    { value: 'Completed', label: 'Hoàn thành' },
]

export function HRInterviewList() {
    const [statusFilter, setStatusFilter] = useState('')
    const [search, setSearch] = useState('')
    const [scheduleDialog, setScheduleDialog] = useState<{ open: boolean; item: InterviewItem | null }>({ open: false, item: null })

    // TODO: Replace with actual API call when backend supports GET interviews for HR
    const interviews: InterviewItem[] = []
    const isLoading = false
    const hasError = false

    const filteredInterviews = interviews.filter(i => {
        if (statusFilter && i.status !== statusFilter) return false
        if (search) {
            const q = search.toLowerCase()
            return i.candidateName.toLowerCase().includes(q) || i.jobTitle.toLowerCase().includes(q)
        }
        return true
    })

    const handleScheduleClick = (item: InterviewItem) => {
        setScheduleDialog({ open: true, item })
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="border-b border-slate-200 pb-6">
                <h1 className="text-2xl font-bold text-[#0F4C75]">Quản lý phỏng vấn</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Xem và xác nhận lịch phỏng vấn cho các ứng viên đã được phân công.
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex gap-2 flex-wrap">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setStatusFilter(tab.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === tab.value
                                ? 'bg-[#0F4C75] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm ứng viên hoặc vị trí..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-slate-100 rounded w-1/3" />
                                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : hasError ? (
                <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-sm text-red-600">Không thể tải danh sách phỏng vấn.</p>
                </div>
            ) : filteredInterviews.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium text-slate-600">Chưa có lịch phỏng vấn nào</p>
                    <p className="text-sm text-slate-400 mt-1">
                        {statusFilter
                            ? 'Không tìm thấy phỏng vấn với bộ lọc hiện tại.'
                            : 'Khi Trưởng bộ phận phân công người phỏng vấn, lịch sẽ hiển thị ở đây để bạn xác nhận.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredInterviews.map(item => (
                        <div
                            key={item.interviewId}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                {/* Left Info */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#BBE1FA]/40 flex items-center justify-center text-[#0F4C75] font-bold text-lg shrink-0">
                                        {item.candidateName.charAt(0)}
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="font-semibold text-slate-800">{item.candidateName}</p>
                                            <p className="text-sm text-slate-500">{item.jobTitle}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <StatusBadge status={item.status} />
                                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                                {item.interviewType}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 border-slate-200">
                                                Vòng {item.roundNumber}
                                            </Badge>
                                        </div>

                                        {/* Interviewers */}
                                        {item.interviewerNames.length > 0 && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Users className="w-3.5 h-3.5" />
                                                <span>PV: {item.interviewerNames.join(', ')}</span>
                                            </div>
                                        )}

                                        {/* Scheduled info */}
                                        {item.status === 'Scheduled' && item.scheduledAt && (
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-1">
                                                <span className="flex items-center gap-1.5">
                                                    <CalendarDays className="w-4 h-4 text-slate-400" />
                                                    {format(new Date(item.scheduledAt), "EEEE, dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    {item.duration} phút
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    {item.interviewFormat === 'Online'
                                                        ? <Video className="w-4 h-4 text-blue-400" />
                                                        : <Building2 className="w-4 h-4 text-orange-400" />
                                                    }
                                                    {item.interviewFormat === 'Online'
                                                        ? (item.meetingLink ? 'Zoom' : 'Online')
                                                        : (item.location || 'Tại văn phòng')
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Actions */}
                                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                                    {item.status === 'PendingSchedule' && (
                                        <Button
                                            size="sm"
                                            className="text-xs bg-[#0F4C75] hover:bg-[#3282B8]"
                                            onClick={() => handleScheduleClick(item)}
                                        >
                                            <CalendarCheck className="w-3 h-3 mr-1" />
                                            Xác nhận lịch
                                        </Button>
                                    )}

                                    {item.status === 'Scheduled' && (
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Đã xác nhận
                                        </Badge>
                                    )}

                                    {item.status === 'Completed' && (
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Hoàn thành
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirm Schedule Dialog */}
            {scheduleDialog.item && (
                <ConfirmScheduleDialog
                    open={scheduleDialog.open}
                    onOpenChange={(open) => setScheduleDialog(prev => ({ ...prev, open }))}
                    applicationId={scheduleDialog.item.applicationId}
                    candidateName={scheduleDialog.item.candidateName}
                    interviewerNames={scheduleDialog.item.interviewerNames}
                    onSuccess={() => {
                        setScheduleDialog({ open: false, item: null })
                        // TODO: mutate/refresh list
                    }}
                />
            )}
        </div>
    )
}
