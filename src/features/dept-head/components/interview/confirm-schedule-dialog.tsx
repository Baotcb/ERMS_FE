'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Video, Building2, Calendar, Clock, Link2, Mail, Send, Copy, Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog, DialogContent,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useConfirmSchedule } from '../../hooks/use-interview'
import type { InterviewFormatType } from '../../types/interview-types'

interface Interviewer {
    id: string
    fullName: string
    email?: string
}

interface ConfirmScheduleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    applicationId: string
    candidateName: string
    candidateEmail?: string
    positionTitle?: string
    interviewers: Interviewer[]
    onSuccess?: () => void
}

const DURATION_OPTIONS = [
    { value: 30, label: '30 phút' },
    { value: 45, label: '45 phút' },
    { value: 60, label: '60 phút' },
    { value: 90, label: '90 phút' },
]

export function ConfirmScheduleDialog({
    open,
    onOpenChange,
    applicationId,
    candidateName,
    candidateEmail,
    positionTitle,
    interviewers,
    onSuccess,
}: ConfirmScheduleDialogProps) {
    const { toast } = useToast()
    const { trigger, isMutating } = useConfirmSchedule()

    const [interviewFormat, setInterviewFormat] = useState<InterviewFormatType>('Online')
    const [scheduledDate, setScheduledDate] = useState('')
    const [scheduledTime, setScheduledTime] = useState('14:00')
    const [duration, setDuration] = useState(60)
    const [meetingLink, setMeetingLink] = useState('')
    const [location, setLocation] = useState('')
    const [copied, setCopied] = useState(false)

    // Reset state when dialog opens
    const [prevOpen, setPrevOpen] = useState(open)
    if (open && !prevOpen) {
        setInterviewFormat('Online')
        setScheduledDate('')
        setScheduledTime('14:00')
        setDuration(60)
        setMeetingLink('')
        setLocation('')
        setCopied(false)
    }
    if (open !== prevOpen) {
        setPrevOpen(open)
    }

    const handleCopyLink = useCallback(async () => {
        if (!meetingLink) return
        try {
            await navigator.clipboard.writeText(meetingLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback
        }
    }, [meetingLink])

    const handleSubmit = async () => {
        if (!scheduledDate || !scheduledTime) return

        // Combine date + time into ISO string
        const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()

        try {
            await trigger({
                applicationId,
                interviewFormat: interviewFormat === 'Online' ? 0 : 1,
                scheduledAt,
                duration,
                meetingLink: interviewFormat === 'Online' ? meetingLink || undefined : undefined,
                location: interviewFormat === 'Offline' ? location || undefined : undefined,
            })
            toast({
                title: 'Xác nhận thành công',
                description: 'Lịch phỏng vấn đã được xác nhận và email thông báo đã được gửi.',
            })
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Không thể xác nhận lịch phỏng vấn',
            })
        }
    }

    const isValid = scheduledDate && scheduledTime &&
        (interviewFormat === 'Online' ? true : true) // Can submit without link/location

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-[#1b5483] text-xl font-bold leading-tight">
                                Xác nhận lịch phỏng vấn
                            </h2>
                            <p className="text-slate-900 text-sm font-semibold mt-2">
                                Ứng viên: {candidateName}
                                {positionTitle && <span className="text-slate-500 font-normal"> — {positionTitle}</span>}
                            </p>
                        </div>
                        <button
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Interviewers */}
                    {interviewers.length > 0 && (
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex -space-x-2 overflow-hidden">
                                {interviewers.slice(0, 3).map(iv => (
                                    <div
                                        key={iv.id}
                                        className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-[#1b5483] text-white text-xs font-bold"
                                    >
                                        {iv.fullName.charAt(0)}
                                    </div>
                                ))}
                            </div>
                            <p className="text-slate-500 text-sm">
                                Người phỏng vấn:{' '}
                                <span className="font-medium text-slate-700">
                                    {interviewers.map(iv => iv.fullName).join(', ')}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="px-6 py-6 overflow-y-auto max-h-[60vh] space-y-6">
                    {/* Section 1: Interview Format */}
                    <div>
                        <Label className="block text-sm font-semibold text-slate-700 mb-3">
                            Hình thức phỏng vấn
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Online option */}
                            <button
                                type="button"
                                onClick={() => setInterviewFormat('Online')}
                                className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${interviewFormat === 'Online'
                                    ? 'border-[#1b5483] bg-[#1b5483]/5'
                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {interviewFormat === 'Online' && (
                                    <div className="absolute top-2 right-2 text-[#1b5483]">
                                        <Check className="w-5 h-5" />
                                    </div>
                                )}
                                <Video className={`w-8 h-8 mb-2 ${interviewFormat === 'Online' ? 'text-[#1b5483]' : 'text-slate-400'
                                    }`} />
                                <span className={`font-semibold text-sm ${interviewFormat === 'Online' ? 'text-[#1b5483]' : 'text-slate-500'
                                    }`}>
                                    Online Meeting
                                </span>
                            </button>

                            {/* Offline option */}
                            <button
                                type="button"
                                onClick={() => setInterviewFormat('Offline')}
                                className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${interviewFormat === 'Offline'
                                    ? 'border-[#1b5483] bg-[#1b5483]/5'
                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {interviewFormat === 'Offline' && (
                                    <div className="absolute top-2 right-2 text-[#1b5483]">
                                        <Check className="w-5 h-5" />
                                    </div>
                                )}
                                <Building2 className={`w-8 h-8 mb-2 ${interviewFormat === 'Offline' ? 'text-[#1b5483]' : 'text-slate-400'
                                    }`} />
                                <span className={`font-semibold text-sm ${interviewFormat === 'Offline' ? 'text-[#1b5483]' : 'text-slate-500'
                                    }`}>
                                    Tại văn phòng
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Section 2: Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Ngày phỏng vấn
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Calendar className="w-[18px] h-[18px]" />
                                </div>
                                <input
                                    type="date"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#1b5483]/30 focus:border-[#1b5483] shadow-sm transition-colors"
                                    value={scheduledDate}
                                    onChange={e => setScheduledDate(e.target.value)}
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Giờ bắt đầu
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Clock className="w-[18px] h-[18px]" />
                                </div>
                                <input
                                    type="time"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#1b5483]/30 focus:border-[#1b5483] shadow-sm transition-colors"
                                    value={scheduledTime}
                                    onChange={e => setScheduledTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Duration */}
                    <div>
                        <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Thời lượng
                        </Label>
                        <div className="relative">
                            <select
                                className="block w-full pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#1b5483]/30 focus:border-[#1b5483] shadow-sm appearance-none cursor-pointer transition-colors"
                                value={duration}
                                onChange={e => setDuration(Number(e.target.value))}
                            >
                                {DURATION_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Meeting Link (Online) or Location (Offline) */}
                    {interviewFormat === 'Online' ? (
                        <div>
                            <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Link phỏng vấn (Google Meet)
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Link2 className="w-[18px] h-[18px] text-slate-400" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="https://meet.google.com/..."
                                    className="pl-10 pr-16 py-2.5 bg-white border-slate-300 focus:ring-2 focus:ring-[#1b5483]/30 focus:border-[#1b5483] shadow-sm"
                                    value={meetingLink}
                                    onChange={e => setMeetingLink(e.target.value)}
                                />
                                {meetingLink && (
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#1b5483] font-medium text-xs hover:text-[#154360] transition-colors gap-1"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>COPY</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <Label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Địa điểm phỏng vấn
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="w-[18px] h-[18px] text-slate-400" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="VD: Phòng họp A, Tầng 3, Tòa nhà ABC..."
                                    className="pl-10 py-2.5 bg-white border-slate-300 focus:ring-2 focus:ring-[#1b5483]/30 focus:border-[#1b5483] shadow-sm"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Preview */}
                    <div className="bg-[#1b5483]/10 rounded-lg p-4 border border-[#1b5483]/20">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-[#1b5483] mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-[#1b5483] mb-2">
                                    Xác nhận sẽ gửi email thông báo tới:
                                </p>
                                <ul className="text-sm text-slate-600 space-y-1.5">
                                    {candidateEmail && (
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                                            <span>{candidateEmail}</span>
                                            <span className="text-xs text-slate-400">(Ứng viên)</span>
                                        </li>
                                    )}
                                    {interviewers.map(iv => (
                                        <li key={iv.id} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                                            <span>{iv.email || iv.fullName}</span>
                                            <span className="text-xs text-slate-400">(Người phỏng vấn)</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isMutating}
                        className="px-5 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                        Hủy
                    </Button>
                    <Button
                        className="px-5 bg-[#1b5483] hover:bg-[#154360] text-white shadow-sm gap-2"
                        disabled={!isValid || isMutating}
                        onClick={handleSubmit}
                    >
                        <Send className="w-4 h-4" />
                        {isMutating ? 'Đang xử lý...' : 'Xác nhận & Gửi email'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
