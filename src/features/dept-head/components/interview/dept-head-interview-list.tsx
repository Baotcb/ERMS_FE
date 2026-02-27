'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    CalendarDays, AlertCircle, CheckCircle2, Search,
    Gavel, ClipboardCheck, Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useInterviewsForFeedback } from '../../hooks/use-interview'
import type { InterviewFeedbackSummaryDto } from '../../types/interview-types'

function DecisionBadge({ decision }: { decision: string | null }) {
    if (!decision) return null
    const config: Record<string, { label: string; className: string }> = {
        Passed: { label: 'Đã duyệt — Chuyển offer', className: 'bg-green-100 text-green-700 border-green-200' },
        Fail: { label: 'Không đạt', className: 'bg-red-100 text-red-700 border-red-200' },
        NextRound: { label: 'Vòng tiếp theo', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    }
    const c = config[decision] ?? { label: decision, className: 'bg-gray-100 text-gray-600 border-gray-200' }
    return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>
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

const DECISION_TABS = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ quyết định' },
    { value: 'decided', label: 'Đã quyết định' },
]

export function DeptHeadInterviewList() {
    const router = useRouter()
    const [decisionTab, setDecisionTab] = useState('')
    const [search, setSearch] = useState('')

    const { data, isLoading, error } = useInterviewsForFeedback({
        pageNumber: 1,
        pageSize: 50,
    })

    const allInterviews = data?.items ?? []

    // Client-side filter by decision status & search
    const filteredInterviews = allInterviews.filter(i => {
        // Decision tab filter
        if (decisionTab === 'pending' && i.departmentHeadDecision) return false
        if (decisionTab === 'decided' && !i.departmentHeadDecision) return false

        // Search filter
        if (search) {
            const q = search.toLowerCase()
            if (
                !i.candidateName.toLowerCase().includes(q) &&
                !i.jobTitle.toLowerCase().includes(q)
            ) return false
        }

        return true
    })

    const pendingCount = allInterviews.filter(i => !i.departmentHeadDecision).length

    const handleDecision = (item: InterviewFeedbackSummaryDto) => {
        const params = new URLSearchParams({
            interviewId: item.interviewId,
            candidateName: item.candidateName,
            jobTitle: item.jobTitle,
            roundLabel: `Vòng ${item.roundNumber} — ${item.interviewType}`,
        })
        if (item.completedAt) {
            params.set('interviewDate', format(new Date(item.completedAt), 'dd/MM/yyyy HH:mm'))
        }
        router.push(`/enterprise/dept-head/decision/${item.applicationId}?${params}`)
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-[#0F4C75]">Quản lý phỏng vấn</h1>
                    {pendingCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                            {pendingCount} chờ quyết định
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                    Xem kết quả đánh giá từ người phỏng vấn và ra quyết định cho từng ứng viên.
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex gap-2 flex-wrap">
                    {DECISION_TABS.map(tab => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setDecisionTab(tab.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${decisionTab === tab.value
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
            ) : error ? (
                <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-sm text-red-600 font-medium">Không thể tải danh sách phỏng vấn</p>
                    <p className="text-xs text-red-400 mt-1">{error.message}</p>
                </div>
            ) : filteredInterviews.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium text-slate-600">Chưa có phỏng vấn cần quyết định</p>
                    <p className="text-sm text-slate-400 mt-1">
                        Khi người phỏng vấn gửi đánh giá xong, danh sách sẽ hiện ở đây.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredInterviews.map(item => {
                        const needsDecision = !item.departmentHeadDecision
                        const allFeedbackReceived = item.feedbacksReceived === item.totalInterviewers

                        return (
                            <div
                                key={item.interviewId}
                                className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-5 ${needsDecision
                                    ? 'border-amber-200 ring-1 ring-amber-50'
                                    : 'border-slate-200'
                                    }`}
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
                                                <InterviewTypeBadge type={item.interviewType} />
                                                <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 border-slate-200">
                                                    Vòng {item.roundNumber}
                                                </Badge>
                                                {item.departmentHeadDecision && (
                                                    <DecisionBadge decision={item.departmentHeadDecision} />
                                                )}
                                            </div>

                                            {/* Feedback progress */}
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <ClipboardCheck className="w-3.5 h-3.5" />
                                                    Đánh giá: {item.feedbacksReceived}/{item.totalInterviewers}
                                                </span>
                                                {allFeedbackReceived && (
                                                    <span className="text-green-600 font-medium">✓ Đầy đủ</span>
                                                )}
                                            </div>

                                            {/* Completed at */}
                                            {item.completedAt && (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Hoàn thành: {format(new Date(item.completedAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Actions */}
                                    <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                                        {needsDecision ? (
                                            <Button
                                                size="sm"
                                                className="text-xs bg-[#0F4C75] hover:bg-[#3282B8]"
                                                onClick={() => handleDecision(item)}
                                            >
                                                <Gavel className="w-3 h-3 mr-1" />
                                                Ra quyết định
                                            </Button>
                                        ) : (
                                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Đã quyết định
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
