'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, Star, FileText, Lock,
    CheckCircle2, ArrowRightLeft, XCircle,
    Video, Building2, Search, Check, Users
} from 'lucide-react'
import useSWR from 'swr'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import { useSubmitFinalDecision } from '../../hooks/use-interview'
import type { FinalDecision } from '../../types/interview-types'

interface EmployeeOption {
    id: string
    fullName: string
    position: string | null
    departmentName: string
    departmentId: number
}

interface InterviewFeedbackData {
    participantName: string
    position: string
    rating: number
    feedback: string
    recommendation: 'Hire' | 'Consider' | 'Reject'
}

interface FinalDecisionPageProps {
    applicationId: string
    interviewId: string
    candidateName: string
    jobTitle: string
    candidateStage?: string
    roundLabel?: string
    interviewDate?: string
    interviewFormat?: string
    resumeUrl?: string
    feedbacks: InterviewFeedbackData[]
}

/* ─── Sub-components ─── */

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: max }, (_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200'
                        }`}
                />
            ))}
        </div>
    )
}

function AverageRatingDisplay({ value, max = 5 }: { value: string; max?: number }) {
    const numValue = parseFloat(value)
    const roundedStars = isNaN(numValue) ? 0 : Math.round(numValue)
    return (
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="text-sm text-slate-500">Trung bình:</span>
            <span className="text-base font-bold text-[#1B262C]">{value}</span>
            <span className="text-xs text-slate-400">/ {max}</span>
            <div className="flex gap-0.5 ml-1">
                {Array.from({ length: max }, (_, i) => (
                    <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < roundedStars
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

function RecommendationBadge({ value }: { value: string }) {
    const config: Record<string, { label: string; className: string }> = {
        Hire: { label: 'Nên tuyển', className: 'bg-green-100 text-green-700 border-green-300' },
        Consider: { label: 'Cân nhắc', className: 'bg-amber-100 text-amber-700 border-amber-300' },
        Reject: { label: 'Không nên', className: 'bg-red-100 text-red-700 border-red-300' },
    }
    const c = config[value] ?? config.Consider
    return <Badge variant="outline" className={`text-xs font-semibold ${c.className}`}>{c.label}</Badge>
}

const DECISION_OPTIONS: {
    value: FinalDecision
    label: string
    desc: string
    icon: typeof CheckCircle2
    activeClass: string
    iconColor: string
}[] = [
        {
            value: 'Passed',
            label: 'Đạt — Chuyển sang Offer',
            desc: 'Tiến hành đàm phán lương và gửi thư mời.',
            icon: CheckCircle2,
            activeClass: 'border-green-400 bg-green-50/80 ring-2 ring-green-100',
            iconColor: 'text-green-500',
        },
        {
            value: 'NextRound',
            label: 'Vòng tiếp — Phỏng vấn thêm',
            desc: 'Cần đánh giá thêm kỹ năng hoặc văn hóa.',
            icon: ArrowRightLeft,
            activeClass: 'border-blue-400 bg-blue-50/80 ring-2 ring-blue-100',
            iconColor: 'text-blue-500',
        },
        {
            value: 'Fail',
            label: 'Không đạt — Từ chối',
            desc: 'Gửi thư cảm ơn và lưu hồ sơ.',
            icon: XCircle,
            activeClass: 'border-red-400 bg-red-50/80 ring-2 ring-red-100',
            iconColor: 'text-red-500',
        },
    ]

/* ─── Main Component ─── */

export function FinalDecisionPage({
    applicationId, interviewId, candidateName, jobTitle,
    candidateStage, roundLabel = 'Vòng 1 — Phỏng vấn kỹ thuật',
    interviewDate, interviewFormat, resumeUrl,
    feedbacks,
}: FinalDecisionPageProps) {
    const router = useRouter()
    const { toast } = useToast()
    const { trigger, isMutating } = useSubmitFinalDecision()

    const [decision, setDecision] = useState<FinalDecision | null>(null)
    const [overallRating, setOverallRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [overallFeedback, setOverallFeedback] = useState('')
    const [feedbackError, setFeedbackError] = useState(false)
    const [note, setNote] = useState('')

    // NextRound: interviewer selection
    const [nextRoundInterviewerIds, setNextRoundInterviewerIds] = useState<string[]>([])
    const [employeeSearch, setEmployeeSearch] = useState('')

    // Fetch employees for NextRound selection
    const { data: employeesData } = useSWR<{ items: EmployeeOption[] }>(
        decision === 'NextRound' ? ['/api/Employees', employeeSearch] : null,
        () => apiClient.get(`/api/Employees?pageSize=100&search=${employeeSearch}`).then(r => r.json())
    )

    const allEmployees = employeesData?.items ?? []
    // Auto-detect DeptHead's department
    const deptCounts = allEmployees.reduce<Record<string, number>>((acc, emp) => {
        acc[emp.departmentName] = (acc[emp.departmentName] || 0) + 1
        return acc
    }, {})
    const mainDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    const deptEmployees = mainDept
        ? allEmployees.filter(e => e.departmentName === mainDept)
        : allEmployees

    const toggleInterviewer = useCallback((id: string) => {
        setNextRoundInterviewerIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }, [])

    const avgRating = feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
        : '—'

    const displayRating = hoverRating || overallRating

    const handleSubmit = useCallback(async () => {
        if (!decision) return

        if (decision === 'Fail' && !overallFeedback.trim()) {
            setFeedbackError(true)
            return
        }
        setFeedbackError(false)

        try {
            await trigger({
                applicationId,
                interviewId,
                decision,
                overallRating: overallRating || undefined,
                overallFeedback: overallFeedback || undefined,
                note: note || undefined,
                nextRoundInterviewerIds: decision === 'NextRound' && nextRoundInterviewerIds.length > 0
                    ? nextRoundInterviewerIds
                    : undefined,
            })
            toast({
                title: 'Đã gửi quyết định',
                description: decision === 'Passed'
                    ? 'Ứng viên sẽ được chuyển sang vòng Offer.'
                    : decision === 'NextRound'
                        ? 'Đã tạo vòng phỏng vấn tiếp theo.'
                        : 'Ứng viên đã bị từ chối.',
            })
            router.push('/enterprise/dept-head/interviews')
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Không thể gửi quyết định',
            })
        }
    }, [applicationId, interviewId, decision, overallRating, overallFeedback, note, nextRoundInterviewerIds, trigger, toast, router])

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Back button */}
            <Button
                variant="ghost"
                className="w-fit p-0 h-auto hover:bg-transparent text-slate-500 hover:text-[#0F4C75]"
                onClick={() => router.push('/enterprise/dept-head/interviews')}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách
            </Button>

            {/* Header: Title + Candidate Card */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#1B262C]">Quyết định phỏng vấn</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Xem xét kết quả đánh giá và đưa ra quyết định cuối cùng cho ứng viên.
                    </p>
                </div>

                {/* Candidate card */}
                <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#BBE1FA] to-[#3282B8]/30 flex items-center justify-center text-[#0F4C75] font-bold text-lg ring-2 ring-white shadow">
                        {candidateName.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800">{candidateName}</p>
                        <p className="text-sm text-slate-500">{jobTitle}</p>
                        {candidateStage && (
                            <Badge variant="outline" className="mt-1 text-[10px] bg-blue-50 text-blue-600 border-blue-200">
                                ● {candidateStage}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* ═══ LEFT COLUMN — Kết quả phỏng vấn ═══ */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Section header + avg rating */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <h2 className="font-semibold text-[#1B262C] flex items-center gap-2 text-base">
                                📋 Kết quả phỏng vấn
                            </h2>
                            {feedbacks.length > 0 && (
                                <AverageRatingDisplay value={avgRating} />
                            )}
                        </div>

                        {/* Round info */}
                        <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-[#3282B8]">
                            <p className="font-semibold text-[#1B262C] text-sm">{roundLabel}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                                {interviewDate && (
                                    <span>Ngày: {interviewDate}</span>
                                )}
                                {interviewFormat && (
                                    <Badge variant="outline" className="text-[10px] bg-white border-slate-200">
                                        {interviewFormat === 'Online'
                                            ? <><Video className="w-3 h-3 mr-1 text-blue-500" />Online Interview</>
                                            : <><Building2 className="w-3 h-3 mr-1 text-orange-500" />Tại văn phòng</>
                                        }
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Feedback cards */}
                        <div className="space-y-4">
                            {feedbacks.map((fb, i) => (
                                <div
                                    key={i}
                                    className="border border-slate-100 rounded-xl p-4 space-y-3 hover:border-slate-200 transition-colors"
                                >
                                    {/* Reviewer header */}
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                                                {fb.participantName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{fb.participantName}</p>
                                                <p className="text-xs text-slate-400">{fb.position}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RecommendationBadge value={fb.recommendation} />
                                            <StarRating rating={fb.rating} />
                                        </div>
                                    </div>

                                    {/* Feedback content */}
                                    <p className="text-sm text-slate-600 leading-relaxed pl-[52px]">
                                        {fb.feedback}
                                    </p>
                                </div>
                            ))}

                            {feedbacks.length === 0 && (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    <ClipboardIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                    Chưa có đánh giá nào.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attachments */}
                    {resumeUrl && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                            <h3 className="font-semibold text-[#1B262C] mb-3 flex items-center gap-2">
                                📎 Tài liệu đính kèm
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => window.open(resumeUrl, '_blank')}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all text-sm group"
                                >
                                    <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-red-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-medium text-slate-700 group-hover:text-[#0F4C75]">
                                            CV ứng viên
                                        </p>
                                        <p className="text-[10px] text-slate-400">PDF</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ RIGHT COLUMN — Ra quyết định ═══ */}
                <div className="lg:col-span-2">
                    <div className="sticky top-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-5 py-3 bg-[#1B262C]">
                            <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                                🎯 Ra quyết định
                            </h2>
                            <Badge className="bg-white/20 text-white border-white/30 text-[10px]">
                                Admin Access
                            </Badge>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Decision options */}
                            <div className="space-y-3">
                                {DECISION_OPTIONS.map(opt => {
                                    const selected = decision === opt.value
                                    const Icon = opt.icon
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                setDecision(opt.value)
                                                setFeedbackError(false)
                                            }}
                                            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${selected
                                                ? opt.activeClass
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${selected
                                                ? 'border-current'
                                                : 'border-slate-300'
                                                }`}
                                            >
                                                {selected && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-current" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                                            </div>
                                            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${selected ? opt.iconColor : 'text-slate-300'}`} />
                                        </button>
                                    )
                                })}
                            </div>

                            {/* NextRound — Chọn người phỏng vấn vòng tiếp */}
                            {decision === 'NextRound' && (
                                <div className="bg-blue-50/50 rounded-xl border border-blue-200 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-600" />
                                        <Label className="text-sm font-semibold text-blue-800">
                                            Chọn người phỏng vấn vòng tiếp
                                        </Label>
                                    </div>
                                    <p className="text-xs text-blue-600">
                                        Để trống nếu muốn giữ nguyên người phỏng vấn hiện tại.
                                    </p>

                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <Input
                                            placeholder="Tìm nhân viên..."
                                            value={employeeSearch}
                                            onChange={e => setEmployeeSearch(e.target.value)}
                                            className="pl-9 h-8 text-xs bg-white"
                                        />
                                    </div>

                                    {/* Employee list */}
                                    <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg">
                                        {deptEmployees.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-3">Đang tải...</p>
                                        ) : (
                                            deptEmployees.map(emp => {
                                                const isSelected = nextRoundInterviewerIds.includes(emp.id)
                                                return (
                                                    <button
                                                        key={emp.id}
                                                        type="button"
                                                        onClick={() => toggleInterviewer(emp.id)}
                                                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${isSelected
                                                                ? 'bg-blue-100 border border-blue-300'
                                                                : 'bg-white border border-transparent hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected
                                                                ? 'bg-blue-600 border-blue-600'
                                                                : 'border-slate-300 bg-white'
                                                            }`}>
                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-slate-800 truncate">{emp.fullName}</p>
                                                            <p className="text-[10px] text-slate-400 truncate">{emp.position || 'Nhân viên'}</p>
                                                        </div>
                                                    </button>
                                                )
                                            })
                                        )}
                                    </div>

                                    {nextRoundInterviewerIds.length > 0 && (
                                        <p className="text-[10px] text-blue-600 font-medium">
                                            Đã chọn {nextRoundInterviewerIds.length} người
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Divider */}
                            <div className="border-t border-slate-100" />

                            {/* Overall Rating */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">Đánh giá chung của bạn</Label>
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setOverallRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-0.5"
                                        >
                                            <Star
                                                className={`w-7 h-7 transition-colors ${star <= displayRating
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'fill-slate-200 text-slate-200'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                    {displayRating > 0 && (
                                        <span className="text-sm text-slate-500 ml-2 font-medium">({displayRating}/5)</span>
                                    )}
                                </div>
                            </div>

                            {/* Overall Feedback */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700">
                                    Nhận xét tổng quan {decision === 'Fail' && <span className="text-red-400">*</span>}
                                </Label>
                                <div>
                                    <Textarea
                                        placeholder="Nhập lý do cho quyết định của bạn..."
                                        value={overallFeedback}
                                        onChange={e => {
                                            setOverallFeedback(e.target.value)
                                            if (feedbackError && e.target.value.trim()) setFeedbackError(false)
                                        }}
                                        rows={3}
                                        className={`resize-none text-sm focus:border-[#3282B8] ${feedbackError ? 'border-red-400 focus:border-red-400' : 'border-slate-200'}`}
                                    />
                                    {feedbackError && (
                                        <p className="text-xs text-red-500 mt-1">Phải nhập nhận xét tổng quan khi từ chối ứng viên.</p>
                                    )}
                                </div>
                            </div>

                            {/* Internal Note */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                                    Ghi chú nội bộ
                                    <Lock className="w-3 h-3" />
                                </Label>
                                <Textarea
                                    placeholder="Thông tin lương, lưu ý đặc biệt..."
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    rows={2}
                                    className="resize-none text-sm border-slate-200 focus:border-[#3282B8]"
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                className="w-full bg-[#0F4C75] hover:bg-[#3282B8] h-10 font-semibold"
                                disabled={!decision || isMutating || (decision === 'Fail' && !overallFeedback.trim())}
                                onClick={handleSubmit}
                            >
                                {isMutating ? 'Đang xử lý...' : 'Xác nhận quyết định'}
                            </Button>
                            <p className="text-center text-[10px] text-slate-400">
                                ⚠️ Hành động này không thể hoàn tác sau khi xác nhận
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* Clipboard icon fallback */
function ClipboardIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    )
}
