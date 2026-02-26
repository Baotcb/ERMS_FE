'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, UploadCloud, X, CheckCircle2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

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

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Backend only accepts PDF
const applicationSchema = z.object({
    coverLetter: z.string().optional(),
    expectedSalary: z.string().optional(),
    availableStartDate: z.string().optional(),
    cvFile: z
        .any()
        .refine((file) => file instanceof File, 'Vui lòng tải lên CV')
        .refine((file) => file?.size <= MAX_FILE_SIZE, 'Kích thước file tối đa là 5MB')
        .refine(
            (file) => file?.type === 'application/pdf',
            'Chỉ chấp nhận file PDF'
        ),
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

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            coverLetter: '',
            expectedSalary: '',
            availableStartDate: '',
        },
    })

    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles?.[0]) {
            const file = acceptedFiles[0]
            setSelectedFile(file)
            form.setValue('cvFile', file, { shouldValidate: true })
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
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

    const onSubmit = async (data: ApplicationFormValues) => {
        try {
            await applyJob({
                jobId,
                cvFile: data.cvFile,
                coverLetter: data.coverLetter || undefined,
                expectedSalary: data.expectedSalary
                    ? parseFloat(data.expectedSalary)
                    : undefined,
                availableStartDate: data.availableStartDate || undefined,
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

    // Success state - simple notification only
    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-8 animate-in fade-in zoom-in duration-300">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Ứng tuyển thành công!</h3>
                <p className="text-slate-500 text-center max-w-md">
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* CV Upload - PDF only */}
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
                                <div className="p-3 bg-slate-100 rounded-full">
                                    <UploadCloud className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-medium">
                                    {isDragActive ? 'Thả file vào đây' : 'Kéo thả hoặc nhấn để tải lên'}
                                </p>
                                <p className="text-xs text-slate-400">Chỉ chấp nhận PDF (Tối đa 5MB)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-blue-100 rounded text-blue-600">
                                    <UploadCloud className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
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

                {/* Cover Letter */}
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
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Expected Salary & Available Start Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="expectedSalary"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mức lương mong muốn (Không bắt buộc)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
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
                    <Button type="submit" disabled={isMutating} className="bg-[#1B5583] hover:bg-[#154360] min-w-[120px] text-white">
                        {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Nộp hồ sơ
                    </Button>
                </div>
            </form>
        </Form>
    )
}
