'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Gavel, CheckCircle2, ClipboardCheck, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
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
    return <Badge variant="outline" className={`text-xs w-full justify-center ${c.className}`}>{c.label}</Badge>
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

    const filteredInterviews = allInterviews.filter(i => {
        if (decisionTab === 'pending' && i.departmentHeadDecision) return false
        if (decisionTab === 'decided' && !i.departmentHeadDecision) return false
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
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-[#0C4A6E]">
                        Quản lý phỏng vấn
                    </h1>
                    {pendingCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                            {pendingCount} chờ quyết định
                        </Badge>
                    )}
                </div>
                <p className="text-[#0C4A6E]/70 text-base">
                    Xem kết quả đánh giá từ người phỏng vấn và ra quyết định cho từng ứng viên.
                </p>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                            placeholder="Tìm ứng viên hoặc vị trí..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-sky-200 focus-visible:border-sky-300"
                        />
                    </div>
                    <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">
                        {DECISION_TABS.map(tab => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setDecisionTab(tab.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${decisionTab === tab.value
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
                    ) : filteredInterviews.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                            <Gavel className="w-8 h-8 text-[#0EA5E9] mb-4" />
                            <h3 className="text-lg font-semibold text-slate-600">Chưa có phỏng vấn cần quyết định</h3>
                            <p className="text-slate-400 mt-2 max-w-sm">
                                Khi người phỏng vấn gửi đánh giá xong, danh sách sẽ hiện ở đây.
                            </p>
                        </div>
                    ) : (
                        <DeptHeadInterviewTable
                            data={filteredInterviews}
                            onDecision={handleDecision}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

interface DeptHeadInterviewTableProps {
    data: InterviewFeedbackSummaryDto[]
    onDecision: (item: InterviewFeedbackSummaryDto) => void
}

function DeptHeadInterviewTable({ data, onDecision }: DeptHeadInterviewTableProps) {
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
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Đánh giá
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Hoàn thành
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Quyết định
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                        Hành động
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
                {data.map(item => {
                    const needsDecision = !item.departmentHeadDecision
                    const allFeedbackReceived = item.feedbacksReceived === item.totalInterviewers

                    return (
                        <TableRow key={item.interviewId} className="hover:bg-sky-50/30 transition-colors group">
                            {/* Candidate */}
                            <TableCell className="px-6 py-4 align-middle">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#BBE1FA]/40 flex items-center justify-center text-[#0F4C75] font-bold text-sm shrink-0">
                                        {item.candidateName.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-[#0C4A6E] text-sm">{item.candidateName}</p>
                                </div>
                            </TableCell>

                            {/* Job Title */}
                            <TableCell className="px-6 py-4 align-middle text-sm text-slate-600 max-w-[200px]">
                                <span className="line-clamp-2">{item.jobTitle}</span>
                            </TableCell>

                            {/* Round / Type */}
                            <TableCell className="px-6 py-4 align-middle">
                                <div className="flex flex-col gap-1 w-[90px]">
                                    <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 border-slate-200 w-full justify-center">
                                        Vòng {item.roundNumber}
                                    </Badge>
                                    <InterviewTypeBadge type={item.interviewType} />
                                </div>
                            </TableCell>

                            {/* Feedback progress */}
                            <TableCell className="px-6 py-4 align-middle text-center">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                        <ClipboardCheck className="w-3.5 h-3.5" />
                                        {item.feedbacksReceived}/{item.totalInterviewers}
                                    </span>
                                    {allFeedbackReceived && (
                                        <span className="text-green-600 text-xs font-medium">✓ Đầy đủ</span>
                                    )}
                                </div>
                            </TableCell>

                            {/* Completed at */}
                            <TableCell className="px-6 py-4 align-middle whitespace-nowrap">
                                {item.completedAt ? (
                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        {format(new Date(item.completedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                                    </div>
                                ) : (
                                    <span className="text-slate-400 text-sm">—</span>
                                )}
                            </TableCell>

                            {/* Decision */}
                            <TableCell className="px-6 py-4 align-middle text-center">
                                {item.departmentHeadDecision ? (
                                    <DecisionBadge decision={item.departmentHeadDecision} />
                                ) : (
                                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
                                        Chờ quyết định
                                    </Badge>
                                )}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="px-6 py-4 align-middle text-right">
                                {needsDecision ? (
                                    <Button
                                        size="sm"
                                        className="text-xs bg-[#0F4C75] hover:bg-[#3282B8]"
                                        onClick={() => onDecision(item)}
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
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}
