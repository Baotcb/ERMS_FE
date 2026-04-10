'use client'

import { useState, useRef, useCallback } from 'react'
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
import { Label } from '@/components/ui/label'
import { Loader2, UserPlus, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { extractCvInfo, addExternalApplication } from '../../api/application-service'

const formSchema = z.object({
    candidateName: z.string().min(1, 'Tên ứng viên là bắt buộc').max(200),
    candidateEmail: z.string().email('Email không hợp lệ'),
    candidatePhone: z.string().max(20).optional().or(z.literal('')),
})

type FormValues = z.infer<typeof formSchema>

interface AddExternalCvDialogProps {
    jobPostingId: string
    onSuccess: () => void
    trigger?: React.ReactNode
}

type Step = 'upload' | 'review' | 'success'

export function AddExternalCvDialog({ jobPostingId, onSuccess, trigger }: AddExternalCvDialogProps) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<Step>('upload')
    const [isExtracting, setIsExtracting] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [resumeUrl, setResumeUrl] = useState('')
    const [resumeText, setResumeText] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({ resolver: zodResolver(formSchema) })

    const handleOpenChange = (val: boolean) => {
        if (!val) {
            // Reset state on close
            setStep('upload')
            setUploadedFile(null)
            setResumeUrl('')
            setResumeText('')
            setIsExtracting(false)
            setIsSubmitting(false)
            reset()
        }
        setOpen(val)
    }

    const processFile = useCallback(async (file: File) => {
        if (file.type !== 'application/pdf') {
            toast({ title: 'Chỉ chấp nhận file PDF', variant: 'destructive' })
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: 'File không được vượt quá 5MB', variant: 'destructive' })
            return
        }
        setUploadedFile(file)
        setIsExtracting(true)
        try {
            const result = await extractCvInfo(file)
            setResumeUrl(result.resumeUrl)
            setResumeText(result.resumeText || '')
            if (result.fullName) setValue('candidateName', result.fullName)
            if (result.email) setValue('candidateEmail', result.email)
            if (result.phone) setValue('candidatePhone', result.phone)
            setStep('review')
        } catch (err) {
            toast({
                title: 'Không thể phân tích CV',
                description: err instanceof Error ? err.message : 'Vui lòng thử lại',
                variant: 'destructive',
            })
        } finally {
            setIsExtracting(false)
        }
    }, [toast, setValue])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) processFile(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) processFile(file)
    }

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true)
        try {
            await addExternalApplication({
                jobPostingId,
                candidateName: values.candidateName,
                candidateEmail: values.candidateEmail,
                candidatePhone: values.candidatePhone || undefined,
                resumeUrl,
                resumeText,
            })
            setStep('success')
            toast({ title: 'Đã thêm hồ sơ ứng viên thành công' })
            onSuccess()
        } catch (err) {
            toast({
                title: 'Không thể thêm hồ sơ',
                description: err instanceof Error ? err.message : 'Vui lòng thử lại',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {trigger ?? (
                    <Button variant="outline" size="sm" className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Thêm CV
                    </Button>
                )}
            </div>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-brand-primary" />
                            Thêm hồ sơ ứng viên ngoài
                        </DialogTitle>
                        <DialogDescription>
                            {step === 'upload' && 'Tải lên CV PDF để hệ thống tự động trích xuất thông tin.'}
                            {step === 'review' && 'Kiểm tra và chỉnh sửa thông tin trước khi thêm vào danh sách.'}
                            {step === 'success' && 'Hồ sơ đã được thêm thành công.'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step 1: Upload */}
                    {step === 'upload' && (
                        <div className="space-y-4">
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                    dragOver
                                        ? 'border-brand-primary bg-brand-primary/5'
                                        : 'border-slate-300 hover:border-brand-primary hover:bg-slate-50'
                                }`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                            >
                                {isExtracting ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                                        <p className="text-sm text-slate-600">Đang phân tích CV...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <Upload className="w-10 h-10 text-slate-400" />
                                        <div>
                                            <p className="font-medium text-slate-700">Kéo thả hoặc nhấn để chọn file</p>
                                            <p className="text-xs text-slate-400 mt-1">Chỉ nhận file PDF, tối đa 5MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    )}

                    {/* Step 2: Review & Edit */}
                    {step === 'review' && (
                        <form id="external-cv-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {uploadedFile && (
                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border text-sm">
                                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <span className="truncate text-slate-600">{uploadedFile.name}</span>
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-auto" />
                                </div>
                            )}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                                <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                                AI đã trích xuất thông tin bên dưới. Vui lòng kiểm tra và chỉnh sửa nếu cần.
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="candidateName">Họ và tên <span className="text-red-500">*</span></Label>
                                <Input
                                    id="candidateName"
                                    placeholder="Nguyễn Văn A"
                                    {...register('candidateName')}
                                />
                                {errors.candidateName && (
                                    <p className="text-xs text-red-500">{errors.candidateName.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="candidateEmail">Email <span className="text-red-500">*</span></Label>
                                <Input
                                    id="candidateEmail"
                                    type="email"
                                    placeholder="email@example.com"
                                    {...register('candidateEmail')}
                                />
                                {errors.candidateEmail && (
                                    <p className="text-xs text-red-500">{errors.candidateEmail.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="candidatePhone">Số điện thoại</Label>
                                <Input
                                    id="candidatePhone"
                                    placeholder="0912345678"
                                    {...register('candidatePhone')}
                                />
                                {errors.candidatePhone && (
                                    <p className="text-xs text-red-500">{errors.candidatePhone.message}</p>
                                )}
                            </div>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === 'success' && (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-9 h-9 text-green-600" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-slate-800">Đã thêm hồ sơ thành công!</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    Hồ sơ đã được thêm vào danh sách ứng viên và đang chờ AI chấm điểm.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {step === 'upload' && (
                            <Button variant="outline" onClick={() => handleOpenChange(false)}>Hủy</Button>
                        )}
                        {step === 'review' && (
                            <>
                                <Button variant="outline" onClick={() => { setStep('upload'); setUploadedFile(null) }}>
                                    Quay lại
                                </Button>
                                <Button
                                    type="submit"
                                    form="external-cv-form"
                                    disabled={isSubmitting}
                                    className="bg-brand-primary hover:bg-brand-primary/90"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang thêm...</>
                                    ) : (
                                        <><UserPlus className="w-4 h-4 mr-2" />Thêm hồ sơ</>
                                    )}
                                </Button>
                            </>
                        )}
                        {step === 'success' && (
                            <Button onClick={() => handleOpenChange(false)}>Đóng</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
