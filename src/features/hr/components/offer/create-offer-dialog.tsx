'use client'

import { useState, useCallback, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FileText, Send, Loader2, Users } from 'lucide-react'
import { useCreateOffer } from '../../hooks/use-offers'
import { getJobPostings } from '../../api/job-posting-service'
import { getApplicationsByJob } from '../../api/application-service'
import type { ApplicationDto } from '../../types/application-types'
import { useToast } from '@/hooks/use-toast'

interface CreateOfferDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Pre-filled từ context (application table). Nếu có → bỏ qua picker */
    applicationId?: string
    candidateName?: string
    position?: string
    isExternal?: boolean
    candidateEmail?: string
}

interface JobOption { id: string; title: string; code: string }

const INITIAL_FORM = {
    salary: '',
    salaryFrequency: 'Monthly',
    bonus: '',
    benefits: '',
    startDate: '',
    expirationDate: '',
}

function toDateInputValue(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function getPreviousDateInputValue(dateInput: string): string {
    const [year, month, day] = dateInput.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    date.setDate(date.getDate() - 1)
    return toDateInputValue(date)
}

export function CreateOfferDialog({
    open,
    onOpenChange,
    applicationId: propApplicationId,
    candidateName: propCandidateName,
    position: propPosition,
    isExternal: propIsExternal,
    candidateEmail: propCandidateEmail,
}: CreateOfferDialogProps) {
    const [form, setForm] = useState(INITIAL_FORM)
    const { trigger, isMutating } = useCreateOffer()
    const { toast } = useToast()

    // Two-step picker state (chỉ dùng khi không có props)
    const hasContext = Boolean(propApplicationId)
    const [jobs, setJobs] = useState<JobOption[] | undefined>(undefined)
    const jobsLoading = open && !hasContext && jobs === undefined
    const [selectedJobId, setSelectedJobId] = useState('')
    const [candidates, setCandidates] = useState<ApplicationDto[]>([])
    const [candidatesLoading, setCandidatesLoading] = useState(false)
    const [selectedAppId, setSelectedAppId] = useState('')

    // Giá trị thực tế
    const selectedCandidate = candidates.find((c) => c.id === selectedAppId)
    const effectiveAppId = propApplicationId || selectedAppId
    const effectivePosition = propPosition || (jobs?.find((j) => j.id === selectedJobId)?.title ?? '')
    const displayName = propCandidateName || selectedCandidate?.candidateName || 'Ứng viên'

    // Load job postings khi dialog mở (standalone mode)
    useEffect(() => {
        if (!open || hasContext) return

        let cancelled = false
        getJobPostings({ pageSize: 100 })
            .then((res) => {
                if (!cancelled) {
                    setJobs(res.data.map((j: { id: string; jobTitle: string; jobCode: string }) => ({
                        id: j.id,
                        title: j.jobTitle,
                        code: j.jobCode,
                    })))
                }
            })
            .catch(() => { if (!cancelled) setJobs([]) })

        return () => { cancelled = true }
    }, [open, hasContext])

    // Load OfferProcessing candidates khi chọn job
    function handleSelectJob(jobId: string) {
        setSelectedJobId(jobId)
        setSelectedAppId('')
        if (!jobId) {
            setCandidates([])
            return
        }
        setCandidatesLoading(true)
        getApplicationsByJob(jobId, { stageFilter: 'OfferProcessing', pageSize: 100 })
            .then((res) => setCandidates(res.data))
            .catch(() => setCandidates([]))
            .finally(() => setCandidatesLoading(false))
    }

    // Reset khi đóng dialog — dùng onOpenChange wrapper
    const handleOpenChange = useCallback((nextOpen: boolean) => {
        if (!nextOpen) {
            setForm(INITIAL_FORM)
            setSelectedJobId('')
            setSelectedAppId('')
            setCandidates([])
            setJobs(undefined) // Reset để lần mở tiếp theo hiển thị loading
        }
        onOpenChange(nextOpen)
    }, [onOpenChange])

    const handleChange = useCallback(
        (field: string, value: string) => {
            setForm((prev) => ({ ...prev, [field]: value }))
        },
        []
    )

    const handleSubmit = useCallback(async () => {
        if (!effectiveAppId || !effectivePosition || !form.salary || !form.startDate || !form.expirationDate) {
            toast({
                title: 'Thiếu thông tin',
                description: 'Vui lòng nhập đầy đủ các trường bắt buộc trước khi gửi offer.',
                variant: 'destructive',
            })
            return
        }

        if (new Date(form.expirationDate) >= new Date(form.startDate)) {
            toast({
                title: 'Ngày không hợp lệ',
                description: 'Hạn phản hồi offer phải trước ngày bắt đầu làm việc.',
                variant: 'destructive',
            })
            return
        }

        try {
            await trigger({
                applicationId: effectiveAppId,
                position: effectivePosition,
                salary: Number(form.salary),
                salaryFrequency: form.salaryFrequency,
                bonus: form.bonus || undefined,
                benefits: form.benefits || undefined,
                // Keep date-only semantics to avoid timezone shift caused by toISOString().
                startDate: `${form.startDate}T00:00:00`,
                expirationDate: `${form.expirationDate}T23:59:59`,
            })
            toast({
                title: 'Thành công',
                description: 'Offer đã được tạo và gửi cho ứng viên.',
            })
            handleOpenChange(false)
        } catch (error) {
            toast({
                title: 'Không thể tạo offer',
                description: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.',
                variant: 'destructive',
            })
        }
    }, [effectiveAppId, effectivePosition, form, handleOpenChange, toast, trigger])

    const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    const todayInput = toDateInputValue(new Date())
    const expirationMaxInput = form.startDate
        ? getPreviousDateInputValue(form.startDate)
        : undefined

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[640px] p-0 gap-0">
                {/* Header */}
                <DialogHeader className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-lg bg-[#0F4C75]/10 text-[#0F4C75]">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold">
                                Tạo Offer
                            </DialogTitle>
                            <DialogDescription className="text-sm mt-0.5">
                                Gửi đề nghị công việc cho ứng viên
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Scrollable Body */}
                <div className="overflow-y-auto max-h-[60vh] p-6">
                    <div className="flex flex-col gap-5">
                        {/* === STEP PICKER (standalone mode) === */}
                        {!hasContext && (
                            <CandidatePicker
                                jobs={jobs ?? []}
                                jobsLoading={jobsLoading}
                                selectedJobId={selectedJobId}
                                onSelectJob={handleSelectJob}
                                candidates={candidates}
                                candidatesLoading={candidatesLoading}
                                selectedAppId={selectedAppId}
                                onSelectApp={setSelectedAppId}
                            />
                        )}

                        {/* === CANDIDATE CARD (context mode) === */}
                        {hasContext && propCandidateName && (
                            <CandidateCard name={propCandidateName} position={propPosition} initials={initials} />
                        )}

                        {/* === SELECTED CANDIDATE (picker mode) === */}
                        {!hasContext && selectedCandidate && (
                            <CandidateCard
                                name={selectedCandidate.candidateName}
                                position={effectivePosition}
                                initials={initials}
                            />
                        )}

                        {/* External candidate notice */}
                        {(selectedCandidate?.isExternal || propIsExternal) && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                                📧 Ứng viên ngoài hệ thống — Offer sẽ được gửi kèm liên kết chấp nhận/từ chối qua email:{' '}
                                <strong>{selectedCandidate?.candidateEmail ?? propCandidateEmail}</strong>
                            </div>
                        )}

                        {/* Position (readonly) */}
                        {effectivePosition && (
                            <div className="flex flex-col gap-2">
                                <Label>Vị trí đề nghị</Label>
                                <Input value={effectivePosition} readOnly className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                            </div>
                        )}

                        {/* Salary + Frequency */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Mức lương <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <CurrencyInput
                                        placeholder="VD: 20.000.000"
                                        value={form.salary === '' ? undefined : Number(form.salary)}
                                        onChange={(v) => handleChange('salary', v === undefined ? '' : String(v))}
                                        className="pr-12"
                                    />
                                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">VNĐ</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Tần suất trả lương</Label>
                                <Select value={form.salaryFrequency} onValueChange={(v) => handleChange('salaryFrequency', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Monthly">Hàng tháng</SelectItem>
                                        <SelectItem value="Yearly">Hàng năm</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Bonus */}
                        <div className="flex flex-col gap-2">
                            <Label>Thưởng (Tùy chọn)</Label>
                            <Input placeholder="Nhập thông tin thưởng" value={form.bonus} onChange={(e) => handleChange('bonus', e.target.value)} />
                        </div>

                        {/* Benefits */}
                        <div className="flex flex-col gap-2">
                            <Label>Phúc lợi bổ sung</Label>
                            <Textarea placeholder="Bảo hiểm sức khỏe, MacBook Pro M2..." rows={3} value={form.benefits} onChange={(e) => handleChange('benefits', e.target.value)} />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Ngày bắt đầu làm việc <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    min={todayInput}
                                    value={form.startDate}
                                    onChange={(e) => handleChange('startDate', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Hạn phản hồi offer <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    min={todayInput}
                                    max={expirationMaxInput}
                                    value={form.expirationDate}
                                    onChange={(e) => handleChange('expirationDate', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t border-slate-100">
                    <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={isMutating}>Hủy</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isMutating}
                        className="bg-[#0F4C75] hover:bg-[#0a3857] text-white"
                    >
                        {isMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Tạo & Gửi Offer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/* ── Sub-components (< 200 lines tổng) ── */

function CandidateCard({ name, position, initials }: { name: string; position?: string; initials: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="size-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white text-lg font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-slate-900 text-base font-bold truncate">{name}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                        Đã qua phỏng vấn
                    </span>
                </div>
                {position && <p className="text-slate-500 text-sm truncate">{position}</p>}
            </div>
        </div>
    )
}

function CandidatePicker({
    jobs, jobsLoading, selectedJobId, onSelectJob,
    candidates, candidatesLoading, selectedAppId, onSelectApp,
}: {
    jobs: JobOption[]
    jobsLoading: boolean
    selectedJobId: string
    onSelectJob: (id: string) => void
    candidates: ApplicationDto[]
    candidatesLoading: boolean
    selectedAppId: string
    onSelectApp: (id: string) => void
}) {
    return (
        <div className="space-y-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <div className="flex items-center gap-2 text-[#0F4C75] font-semibold text-sm">
                <Users className="w-4 h-4" />
                Chọn ứng viên
            </div>

            {/* Step 1: Chọn tin tuyển dụng */}
            <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-slate-500">Bước 1: Chọn tin tuyển dụng</Label>
                <Select value={selectedJobId} onValueChange={onSelectJob} disabled={jobsLoading}>
                    <SelectTrigger>
                        <SelectValue placeholder={jobsLoading ? 'Đang tải...' : 'Chọn tin tuyển dụng'} />
                    </SelectTrigger>
                    <SelectContent>
                        {jobs.map((j) => (
                            <SelectItem key={j.id} value={j.id}>
                                <span className="font-medium">{j.title}</span>
                                <span className="text-xs text-slate-400 ml-2">({j.code})</span>
                            </SelectItem>
                        ))}
                        {jobs.length === 0 && !jobsLoading && (
                            <div className="px-3 py-2 text-sm text-slate-400">Không có tin tuyển dụng nào</div>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* Step 2: Chọn ứng viên */}
            {selectedJobId && (
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-slate-500">Bước 2: Chọn ứng viên (OfferProcessing)</Label>
                    {candidatesLoading ? (
                        <div className="flex items-center gap-2 py-2 text-sm text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang tải ứng viên...
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="py-2 text-sm text-amber-600 bg-amber-50 px-3 rounded-lg">
                            Không có ứng viên nào ở giai đoạn tạo offer cho tin này.
                        </div>
                    ) : (
                        <Select value={selectedAppId} onValueChange={onSelectApp}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn ứng viên" />
                            </SelectTrigger>
                            <SelectContent>
                                {candidates.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        <span className="font-medium">{c.candidateName}</span>
                                        <span className="text-xs text-slate-400 ml-2">({c.candidateEmail})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            )}
        </div>
    )
}
