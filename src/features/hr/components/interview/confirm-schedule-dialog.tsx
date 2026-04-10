'use client'

import { useState } from 'react'
import { Video, Building2, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useConfirmSchedule } from '@/features/hr/hooks/use-interview'

interface ConfirmScheduleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    applicationId: string
    candidateName: string
    candidateEmail?: string
    isExternal?: boolean
    interviewerNames?: string[]
    onSuccess?: () => void
}

const DURATION_OPTIONS = [
    { value: '30', label: '30 phút' },
    { value: '45', label: '45 phút' },
    { value: '60', label: '60 phút' },
    { value: '90', label: '90 phút' },
    { value: '120', label: '120 phút' },
]

export function ConfirmScheduleDialog({
    open, onOpenChange, applicationId, candidateName, candidateEmail, isExternal = false, interviewerNames = [], onSuccess,
}: ConfirmScheduleDialogProps) {
    const { toast } = useToast()
    const { trigger, isMutating } = useConfirmSchedule()

    const [format, setFormat] = useState<'Online' | 'Offline'>('Online')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('14:00')
    const [duration, setDuration] = useState('60')
    const [meetingLink, setMeetingLink] = useState('')
    const [location, setLocation] = useState('')

    // Reset state khi dialog mở (React docs: adjusting state when prop changes)
    const [prevOpen, setPrevOpen] = useState(open)
    if (open && !prevOpen) {
        setFormat('Online')
        setDate('')
        setTime('14:00')
        setDuration('60')
        setMeetingLink('')
        setLocation('')
    }
    if (open !== prevOpen) {
        setPrevOpen(open)
    }

    const handleSubmit = async () => {
        if (!date || !time) return

        const scheduledAt = new Date(`${date}T${time}:00`).toISOString()

        try {
            await trigger({
                applicationId,
                interviewFormat: format === 'Online' ? 0 : 1,
                scheduledAt,
                duration: Number(duration),
                meetingLink: format === 'Online' ? meetingLink || undefined : undefined,
                location: format === 'Offline' ? location || undefined : undefined,
            })
            toast({
                title: 'Đã xác nhận lịch phỏng vấn',
                description: 'Email thông báo sẽ được gửi tới ứng viên và người phỏng vấn.',
            })
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Không thể xác nhận lịch',
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle className="text-[#0F4C75]">Xác nhận lịch phỏng vấn</DialogTitle>
                    <DialogDescription>
                        Ứng viên: <strong>{candidateName}</strong>
                        {interviewerNames.length > 0 && (
                            <span className="block mt-1 text-xs">
                                Người phỏng vấn: {interviewerNames.join(', ')}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Interview Format */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Hình thức phỏng vấn</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormat('Online')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${format === 'Online'
                                    ? 'border-[#0F4C75] bg-[#BBE1FA]/10'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <Video className={`w-6 h-6 ${format === 'Online' ? 'text-[#0F4C75]' : 'text-slate-400'}`} />
                                <span className={`text-sm font-medium ${format === 'Online' ? 'text-[#0F4C75]' : 'text-slate-600'}`}>
                                    Online Meeting
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormat('Offline')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${format === 'Offline'
                                    ? 'border-[#0F4C75] bg-[#BBE1FA]/10'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <Building2 className={`w-6 h-6 ${format === 'Offline' ? 'text-[#0F4C75]' : 'text-slate-400'}`} />
                                <span className={`text-sm font-medium ${format === 'Offline' ? 'text-[#0F4C75]' : 'text-slate-600'}`}>
                                    Tại văn phòng
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Date + Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm">Ngày phỏng vấn</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm">Giờ bắt đầu</Label>
                            <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-1.5">
                        <Label className="text-sm">Thời lượng</Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {DURATION_OPTIONS.map(o => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Conditional: Meeting Link / Location */}
                    {format === 'Online' ? (
                        <div className="space-y-1.5">
                            <Label className="text-sm">Link phỏng vấn (Zoom / Google Meet)</Label>
                            <Input
                                placeholder="https://zoom.us/j/... hoặc để trống"
                                value={meetingLink}
                                onChange={e => setMeetingLink(e.target.value)}
                            />
                            <p className="text-xs text-slate-400">
                                💡 Nếu bỏ trống, hệ thống sẽ tự động tạo phòng Zoom.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <Label className="text-sm">Địa điểm</Label>
                            <Input
                                placeholder="Phòng họp A, Tầng 3..."
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>
                    )}

                    {/* External candidate info */}
                    {isExternal && candidateEmail && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                            <p className="text-blue-800">
                                📧 Email phỏng vấn sẽ được gửi tới: <strong>{candidateEmail}</strong>
                            </p>
                        </div>
                    )}

                    {/* Email preview */}
                    <div className="p-4 bg-[#BBE1FA]/10 rounded-lg border border-[#BBE1FA]/30">
                        <p className="text-sm font-medium text-[#0F4C75] mb-2">
                            Xác nhận sẽ gửi email kèm lịch (.ics) tới:
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>Ứng viên: {candidateName}</span>
                            </div>
                            {interviewerNames.map((name, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Người PV: {name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMutating}>Hủy</Button>
                    <Button
                        className="bg-[#0F4C75] hover:bg-[#3282B8]"
                        disabled={!date || !time || isMutating}
                        onClick={handleSubmit}
                    >
                        {isMutating ? 'Đang xử lý...' : 'Xác nhận & Gửi email'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
