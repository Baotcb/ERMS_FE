'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, UploadCloud, X } from 'lucide-react'
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
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useCreateApplication } from '@/features/candidate/hooks/use-applications'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

const applicationSchema = z.object({
    fullName: z.string().min(2, 'Họ tên quá ngắn'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
    coverLetter: z.string().optional(),
    cvFile: z
        .any()
        .refine((file) => file instanceof File, 'Vui lòng tải lên CV')
        .refine((file) => file?.size <= MAX_FILE_SIZE, `Kích thước file tối đa là 5MB`)
        .refine(
            (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
            'Chỉ chấp nhận file .pdf, .doc, .docx'
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

    // Mock user details (replace with actual auth context)
    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            fullName: '', // Could be pre-filled
            email: '',
            phone: '',
            coverLetter: '',
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
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
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
                ...data,
                cvFile: data.cvFile,
            })

            toast({
                title: 'Ứng tuyển thành công!',
                description: `Hồ sơ của bạn đã được gửi cho vị trí ${jobTitle}.`,
            })

            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            console.error(error)
            toast({
                title: 'Lỗi',
                description: 'Có lỗi xảy ra khi gửi hồ sơ. Vui lòng thử lại.',
                variant: 'destructive',
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Họ và tên <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Nguyễn Văn A" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="nguyenvana@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Số điện thoại <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="0912345678" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                <p className="text-xs text-slate-400">PDF, DOC, DOCX (Max 5MB)</p>
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

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onSuccess}>Hủy</Button>
                    <Button type="submit" disabled={isMutating} className="bg-[#00b14f] hover:bg-[#00b14f]/90 min-w-[120px]">
                        {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Nộp hồ sơ
                    </Button>
                </div>
            </form>
        </Form>
    )
}
