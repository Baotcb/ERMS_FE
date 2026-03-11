'use client'

import { useState } from 'react'
import { FieldErrors, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, UploadCloud, X, CheckCircle2 } from 'lucide-react'
import { FileRejection, useDropzone } from 'react-dropzone'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useCreateApplication } from '@/features/candidate/hooks/use-applications'
import { useCandidateAccess } from '@/features/core/auth/hooks'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_COVER_LETTER_LENGTH = 2000
const APPLY_FORM_VALIDATION_TOAST_ID = 'job-apply-validation-error'
const ISO_DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/
const MAX_AVAILABLE_START_DATE = '2100-12-31'

const getTodayDateString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const getTomorrowDateString = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const isValidAvailableStartDate = (value: string) => {
    if (!ISO_DATE_ONLY_REGEX.test(value)) {
        return false
    }

    const [year, month, day] = value.split('-').map(Number)

    if (year < 1900 || year > 2100) {
        return false
    }

    const date = new Date(Date.UTC(year, month - 1, day))

    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day
}

const isFutureAvailableStartDate = (value: string) => {
    if (!isValidAvailableStartDate(value)) {
        return false
    }

    return value > getTodayDateString()
}

const optionalNonNegativeNumberString = z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || Number.isFinite(Number(value)), 'Mức lương mong muốn phải là số hợp lệ')
    .refine((value) => !value || Number(value) >= 0, 'Mức lương mong muốn không được là số âm')

const applicationSchema = z.object({
    coverLetter: z
        .string()
        .max(MAX_COVER_LETTER_LENGTH, 'Thư giới thiệu không được vượt quá 2000 ký tự')
        .optional(),
    expectedSalary: optionalNonNegativeNumberString,
    availableStartDate: z
        .string()
        .trim()
        .optional()
        .refine(
            (value) => !value || isFutureAvailableStartDate(value),
            'Ngày có thể bắt đầu phải là một ngày trong tương lai'
        ),
    cvFile: z
        .any()
        .refine((file) => file instanceof File, 'Vui lòng tải lên CV')
        .refine((file) => file?.size <= MAX_FILE_SIZE, 'Kích thước file tối đa là 5MB')
        .refine((file) => file?.type === 'application/pdf', 'Chỉ chấp nhận file PDF'),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

interface JobApplyFormProps {
    jobId: string
    jobTitle: string
    onSuccess?: () => void
}

export function JobApplyForm({ jobId, jobTitle, onSuccess }: JobApplyFormProps) {
    const { toast } = useToast()
    const { trigger: applyJob, isMutating } = useCreateApplication()
    const [isSuccess, setIsSuccess] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const minAvailableStartDate = getTomorrowDateString()

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            coverLetter: '',
            expectedSalary: '',
            availableStartDate: '',
        },
    })

    const showValidationToast = (description: string) => {
        toast({
            id: APPLY_FORM_VALIDATION_TOAST_ID,
            title: 'Thông tin ứng tuyển chưa hợp lệ',
            description,
            variant: 'destructive',
        })
    }

    const getFirstErrorMessage = (errors: FieldErrors<ApplicationFormValues>): string | null => {
        const queue = Object.values(errors) as unknown[]

        while (queue.length > 0) {
            const current = queue.shift()

            if (!current || typeof current !== 'object') {
                continue
            }

            if ('message' in current && typeof current.message === 'string' && current.message.trim()) {
                return current.message
            }

            queue.push(...Object.values(current))
        }

        return null
    }

    const onDrop = (acceptedFiles: File[]) => {
        if (!acceptedFiles[0]) {
            return
        }

        const file = acceptedFiles[0]
        setSelectedFile(file)
        form.clearErrors('cvFile')
        form.setValue('cvFile', file, { shouldValidate: true })
    }

    const onDropRejected = (fileRejections: FileRejection[]) => {
        const firstError = fileRejections[0]?.errors[0]

        const message = firstError?.code === 'file-too-large'
            ? 'CV vượt quá 5MB. Vui lòng chọn file nhỏ hơn.'
            : firstError?.code === 'file-invalid-type'
                ? 'CV phải là file PDF hợp lệ.'
                : 'CV chưa hợp lệ. Vui lòng kiểm tra lại file tải lên.'

        form.setError('cvFile', { type: 'manual', message })
        showValidationToast(message)
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxFiles: 1,
        maxSize: MAX_FILE_SIZE,
    })

    const removeFile = () => {
        setSelectedFile(null)
        form.setValue('cvFile', undefined, { shouldValidate: true })
    }

    const onInvalidSubmit = (errors: FieldErrors<ApplicationFormValues>) => {
        const message = getFirstErrorMessage(errors) ?? 'Vui lòng kiểm tra lại thông tin ứng tuyển.'
        showValidationToast(message)
    }

    const onSubmit = async (data: ApplicationFormValues) => {
        if (!requireCandidate({ action: 'ứng tuyển công việc', redirectTo: `/jobs/${jobId}` })) {
            return
        }

        try {
            await applyJob({
                jobId,
                cvFile: data.cvFile,
                coverLetter: data.coverLetter?.trim() || undefined,
                expectedSalary: data.expectedSalary?.trim() ? Number(data.expectedSalary) : undefined,
                availableStartDate: data.availableStartDate?.trim() || undefined,
            })

            setIsSuccess(true)

            toast({
                title: 'Ứng tuyển thành công!',
                description: `Hồ sơ của bạn đã được gửi cho vị trí ${jobTitle}.`,
            })
        } catch (error) {
            console.error(error)
            toast({
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi hồ sơ.',
                variant: 'destructive',
            })
        }
    }

    if (isSuccess) {
        return (
            <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center justify-center space-y-4 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Ứng tuyển thành công!</h3>
                <p className="max-w-md text-center text-slate-500">
                    Hồ sơ của bạn đã được gửi cho vị trí <strong>{jobTitle}</strong>. Nhà tuyển dụng sẽ xem xét và liên hệ với bạn sớm nhất.
                </p>
                <Button onClick={onSuccess} className="mt-4 min-w-[150px]">
                    Hoàn tất
                </Button>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <FormLabel>CV / Hồ sơ năng lực <span className="text-red-500">*</span></FormLabel>
                    {!selectedFile ? (
                        <div
                            {...getRootProps()}
                            className={`
                                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                                ${isDragActive ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-300 hover:border-brand-primary/50'}
                            `}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                                <div className="rounded-full bg-slate-100 p-3">
                                    <UploadCloud className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-medium">
                                    {isDragActive ? 'Thả file vào đây' : 'Kéo thả hoặc nhấn để tải lên'}
                                </p>
                                <p className="text-xs text-slate-400">Chỉ chấp nhận PDF (Tối đa 5MB)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="rounded bg-blue-100 p-2 text-blue-600">
                                    <UploadCloud className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                                    <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={removeFile}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    {form.formState.errors.cvFile && (
                        <p className="text-sm font-medium text-destructive">
                            {form.formState.errors.cvFile.message as string}
                        </p>
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="coverLetter"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Thư giới thiệu (Không bắt buộc)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Viết đôi lời giới thiệu về bản thân và lý do bạn phù hợp với vị trí này..."
                                    className="min-h-[120px]"
                                    maxLength={MAX_COVER_LETTER_LENGTH}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription className="text-xs text-right">
                                {(field.value?.length ?? 0)}/{MAX_COVER_LETTER_LENGTH}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="expectedSalary"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mức lương mong muốn (Không bắt buộc)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="VD: 15000000"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Đơn vị: VNĐ/tháng
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="availableStartDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày có thể bắt đầu (Không bắt buộc)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        min={minAvailableStartDate}
                                        max={MAX_AVAILABLE_START_DATE}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    &nbsp;
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onSuccess}>Hủy</Button>
                    <Button type="submit" disabled={isMutating} className="min-w-[120px] bg-[#1B5583] text-white hover:bg-[#154360]">
                        {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Nộp hồ sơ
                    </Button>
                </div>
            </form>
        </Form>
    )
}
