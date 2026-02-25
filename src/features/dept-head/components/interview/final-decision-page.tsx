'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, CheckCircle2, RefreshCw, XCircle, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useSubmitFinalDecision } from '../../hooks/use-interview'
import type { FinalDecision } from '../../types/interview-types'

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

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: max }, (_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                />
            ))}
        </div>
    )
}

function RecommendationBadge({ value }: { value: string }) {
    const config: Record<string, { label: string; className: string }> = {
        Hire: { label: 'Nên tuyển', className: 'bg-green-100 text-green-700 border-green-200' },
        Consider: { label: 'Cân nhắc', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
        Reject: { label: 'Không nên', className: 'bg-red-100 text-red-700 border-red-200' },
    }
    const c = config[value] ?? config.Consider
    return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>
}

const DECISION_OPTIONS: { value: FinalDecision; label: string; desc: string; icon: typeof CheckCircle2; borderColor: string; bgColor: string }[] = [
    {
        value: 'Passed',
        label: 'Đạt — Chuyển sang Offer',
        desc: 'Ứng viên đạt, chuyển sang vòng xét offer',
        icon: CheckCircle2,
        borderColor: 'border-green-400',
        bgColor: 'bg-green-50',
    },
    {
        value: 'NextRound',
        label: 'Vòng tiếp — Phỏng vấn thêm',
        desc: 'Cần phỏng vấn thêm để đánh giá',
        icon: RefreshCw,
        borderColor: 'border-blue-400',
        bgColor: 'bg-blue-50',
    },
    {
        value: 'Fail',
        label: 'Không đạt — Từ chối',
        desc: 'Ứng viên không đạt yêu cầu',
        icon: XCircle,
        borderColor: 'border-red-400',
        bgColor: 'bg-red-50',
    },
]

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
    const [note, setNote] = useState('')

    const avgRating = feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
        : '—'

    const displayRating = hoverRating || overallRating

    const handleSubmit = useCallback(async () => {
        if (!decision) return

        try {
            await trigger({
                applicationId,
                interviewId,
                decision,
                overallRating: overallRating || undefined,
                overallFeedback: overallFeedback || undefined,
                note: note || undefined,
            })
            toast({
                title: 'Đã gửi quyết định',
                description: decision === 'Passed'
                    ? 'Ứng viên sẽ được chuyển sang vòng Offer.'
                    : decision === 'NextRound'
                        ? 'Đã tạo vòng phỏng vấn tiếp theo.'
                        : 'Ứng viên đã bị từ chối.',
            })
            router.back()
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Không thể gửi quyết định',
            })
        }
    }, [applicationId, interviewId, decision, overallRating, overallFeedback, note, trigger, toast, router])

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    className="w-fit p-0 h-auto hover:bg-transparent text-slate-500 hover:text-[#0F4C75]"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách
                </Button>

                <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0F4C75]">Quyết định phỏng vấn</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Xem kết quả đánh giá và đưa ra quyết định cuối cùng cho ứng viên.
                        </p>
                    </div>

                    {/* Candidate card */}
                    <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <div className="w-12 h-12 rounded-full bg-[#BBE1FA]/40 flex items-center justify-center text-[#0F4C75] font-bold text-lg">
                            {candidateName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">{candidateName}</p>
                            <p className="text-sm text-slate-500">{jobTitle}</p>
                            {candidateStage && (
                                <Badge variant="outline" className="mt-1 text-xs bg-purple-50 text-purple-700 border-purple-200">
                                    {candidateStage}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* LEFT COLUMN — Interview Results */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Round info + avg rating */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                                    📋 Kết quả phỏng vấn
                                </h2>
                                <p className="text-sm text-slate-500 mt-0.5">{roundLabel}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm text-slate-500">Trung bình:</span>
                                    <span className="text-lg font-bold text-[#0F4C75]">{avgRating}</span>
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                </div>
                                {interviewDate && (
                                    <span className="text-xs text-slate-400">Ngày: {interviewDate}</span>
                                )}
                            </div>
                        </div>

                        {interviewFormat && (
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 text-xs">
                                {interviewFormat === 'Online' ? '🎥 Online Interview' : '🏢 Tại văn phòng'}
                            </Badge>
                        )}

                        {/* Feedback cards */}
                        <div className="space-y-4">
                            {feedbacks.map((fb, i) => (
                                <div key={i} className="border border-slate-100 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                                                {fb.participantName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{fb.participantName}</p>
                                                <p className="text-xs text-slate-400">{fb.position}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RecommendationBadge value={fb.recommendation} />
                                            <StarDisplay rating={fb.rating} />
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{fb.feedback}</p>
                                </div>
                            ))}

                            {feedbacks.length === 0 && (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    Chưa có đánh giá nào.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attachments */}
                    {resumeUrl && (
                        <div className="bg-white rounded-xl border border-slate-200 p-5">
                            <h3 className="font-semibold text-slate-800 mb-3">📎 Tài liệu đính kèm</h3>
                            <Button variant="outline" size="sm" onClick={() => window.open(resumeUrl, '_blank')}>
                                <FileText className="w-4 h-4 mr-2" />
                                Xem CV ứng viên
                            </Button>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN — Decision panel */}
                <div className="lg:col-span-2">
                    <div className="sticky top-6 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-slate-800">🎯 Ra quyết định</h2>
                        </div>

                        {/* Decision options */}
                        <div className="space-y-3">
                            {DECISION_OPTIONS.map(opt => {
                                const selected = decision === opt.value
                                const Icon = opt.icon
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setDecision(opt.value)}
                                        className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-start gap-3 ${selected
                                                ? `${opt.borderColor} ${opt.bgColor}`
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${selected ? 'opacity-100' : 'opacity-40'}`} />
                                        <div>
                                            <p className="text-sm font-medium">{opt.label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Overall Rating */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Đánh giá chung của bạn</Label>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setOverallRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        <Star
                                            className={`w-6 h-6 transition-colors ${star <= displayRating
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-slate-200'
                                                }`}
                                        />
                                    </button>
                                ))}
                                {displayRating > 0 && (
                                    <span className="text-xs text-slate-500 ml-1 self-center">{displayRating}/5</span>
                                )}
                            </div>
                        </div>

                        {/* Overall Feedback */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Nhận xét tổng quan *</Label>
                            <Textarea
                                placeholder="Nhập lý do quyết định của bạn..."
                                value={overallFeedback}
                                onChange={e => setOverallFeedback(e.target.value)}
                                rows={3}
                                className="resize-none text-sm"
                            />
                        </div>

                        {/* Internal Note */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-slate-500">Ghi chú nội bộ 🔒</Label>
                            <Textarea
                                placeholder="Thông tin trường, lưu ý đặc biệt..."
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                rows={2}
                                className="resize-none text-sm"
                            />
                        </div>

                        {/* Submit */}
                        <Button
                            className="w-full bg-[#0F4C75] hover:bg-[#3282B8]"
                            disabled={!decision || isMutating}
                            onClick={handleSubmit}
                        >
                            {isMutating ? 'Đang xử lý...' : 'Xác nhận quyết định'}
                        </Button>
                        <p className="text-center text-xs text-red-400">
                            ⚠️ Hành động này không thể hoàn tác
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
