'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, ThumbsUp, HelpCircle, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useSubmitFeedback } from '../../hooks/use-interview'

interface InterviewFeedbackFormProps {
    applicationId: string
    interviewId: string
    candidateName: string
    jobTitle: string
    roundLabel?: string
    interviewDate?: string
    interviewFormat?: string
}

const RATING_LABELS: Record<number, string> = {
    1: 'Rất yếu',
    2: 'Yếu',
    3: 'Trung bình',
    4: 'Tốt',
    5: 'Xuất sắc',
}

const RECOMMENDATIONS = [
    { value: 'Hire' as const, label: 'Nên tuyển', icon: ThumbsUp, bgSelected: 'bg-green-50 border-green-300', textSelected: 'text-green-700' },
    { value: 'Consider' as const, label: 'Cân nhắc', icon: HelpCircle, bgSelected: 'bg-yellow-50 border-yellow-300', textSelected: 'text-yellow-700' },
    { value: 'Reject' as const, label: 'Không nên tuyển', icon: ThumbsDown, bgSelected: 'bg-red-50 border-red-300', textSelected: 'text-red-700' },
]

export function EmployeeFeedbackForm({
    applicationId, interviewId, candidateName, jobTitle,
    roundLabel = 'Vòng 1 — Phỏng vấn kỹ thuật',
    interviewDate, interviewFormat,
}: InterviewFeedbackFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const { trigger, isMutating } = useSubmitFeedback()

    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [recommendation, setRecommendation] = useState<'Hire' | 'Consider' | 'Reject' | null>(null)

    const displayRating = hoverRating || rating

    const handleSubmit = useCallback(async () => {
        if (rating === 0 || !feedback.trim()) {
            toast({
                variant: 'destructive',
                title: 'Thiếu thông tin',
                description: 'Vui lòng chấm điểm và nhập nhận xét.',
            })
            return
        }

        try {
            await trigger({
                applicationId,
                interviewId,
                rating,
                feedback,
                recommendation: recommendation ?? undefined,
            })
            toast({
                title: 'Đã gửi đánh giá',
                description: 'Đánh giá phỏng vấn đã được ghi nhận.',
            })
            router.back()
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Không thể gửi đánh giá',
            })
        }
    }, [applicationId, interviewId, rating, feedback, recommendation, trigger, toast, router])

    return (
        <div className="max-w-[800px] mx-auto pb-12 space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="w-fit p-0 h-auto hover:bg-transparent text-slate-500 hover:text-[#0F4C75]"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách
            </Button>

            {/* Header */}
            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-[#0F4C75]">Đánh giá phỏng vấn</h1>
                <p className="text-sm text-slate-500">{roundLabel}</p>
            </div>

            {/* Candidate Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#BBE1FA]/40 flex items-center justify-center text-[#0F4C75] font-bold text-lg">
                    {candidateName.charAt(0)}
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-slate-800">{candidateName}</p>
                    <p className="text-sm text-slate-500">{jobTitle}</p>
                </div>
                <div className="flex items-center gap-2">
                    {interviewFormat && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            {interviewFormat === 'Online' ? '🎥 Online' : '🏢 Tại văn phòng'}
                        </Badge>
                    )}
                    {interviewDate && (
                        <span className="text-xs text-slate-400">{interviewDate}</span>
                    )}
                </div>
            </div>

            {/* Rating & Feedback */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                {/* Star Rating */}
                <div className="space-y-3">
                    <Label className="font-semibold flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#0F4C75]" />
                        Đánh giá tổng quan
                    </Label>
                    <div className="flex flex-col items-center gap-2 py-4 bg-slate-50 rounded-lg">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= displayRating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-slate-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {displayRating > 0 && (
                            <span className="text-sm font-medium text-slate-600">
                                {displayRating}/5 — {RATING_LABELS[displayRating]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Detailed Feedback */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label className="font-semibold">✏️ Nhận xét chi tiết</Label>
                        <span className="text-xs text-slate-400">{feedback.length}/2000</span>
                    </div>
                    <p className="text-xs text-slate-400">
                        Vui lòng cung cấp chi tiết về điểm mạnh, điểm yếu và các quan sát của bạn trong buổi phỏng vấn.
                    </p>
                    <Textarea
                        placeholder="Nhập chi tiết đánh giá tại đây... Ví dụ: Ứng viên có kiến thức vững chắc về ReactJS, tuy nhiên cần cải thiện kỹ năng về System Design."
                        value={feedback}
                        onChange={e => setFeedback(e.target.value.slice(0, 2000))}
                        rows={6}
                        className="resize-none"
                    />
                </div>

                {/* Recommendation */}
                <div className="space-y-3">
                    <Label className="font-semibold">🎯 Khuyến nghị</Label>
                    <div className="grid grid-cols-3 gap-3">
                        {RECOMMENDATIONS.map(rec => {
                            const selected = recommendation === rec.value
                            const Icon = rec.icon
                            return (
                                <button
                                    key={rec.value}
                                    type="button"
                                    onClick={() => setRecommendation(rec.value)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${selected
                                        ? `${rec.bgSelected} ${rec.textSelected}`
                                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">{rec.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => router.back()} disabled={isMutating}>Hủy</Button>
                <Button
                    className="bg-[#0F4C75] hover:bg-[#3282B8]"
                    disabled={rating === 0 || !feedback.trim() || isMutating}
                    onClick={handleSubmit}
                >
                    {isMutating ? 'Đang gửi...' : 'Gửi đánh giá'}
                </Button>
            </div>

            <p className="text-center text-xs text-slate-400">
                Mọi đánh giá sẽ được gửi cho trưởng bộ phận và chỉ có quản lý tuyển dụng mới có thể xem.
            </p>
        </div>
    )
}
