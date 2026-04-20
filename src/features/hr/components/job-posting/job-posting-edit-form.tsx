'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useForm, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSWRConfig } from 'swr'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'

import { useJobPosting, useUpdateJobPosting } from '../../hooks/use-job-postings'
import { StatusBadge } from './status-badge'
import type { UpdateJobPostingDto } from '../../types/job-posting-types'

function isFieldEditable(field: string, status: string): boolean {
    if (status === 'Closed' || status === 'Archived') return false
    if (status === 'Published') {
        const publishedEditableFields = [
            'description', 'benefits', 'applicationDeadline', 'location',
            'remoteOption', 'salaryRangeMin', 'salaryRangeMax', 'showSalary', 'quantity'
        ]
        return publishedEditableFields.includes(field)
    }
    return true // Draft: tất cả các trường đều chỉnh sửa được
}

const formSchema = z.object({
    jobTitle: z.string().min(1, 'Vui lòng nhập chức danh').max(200, 'Tối đa 200 ký tự'),
    employmentType: z.string().optional().or(z.literal('')),
    experienceLevel: z.string().optional(),
    educationLevel: z.string().optional(),
    quantity: z.number().min(1, 'Số lượng tối thiểu là 1'),
    description: z.string().max(5000, 'Tối đa 5000 ký tự').optional(),
    requirements: z.string().optional(),
    benefits: z.string().max(2000, 'Tối đa 2000 ký tự').optional(),
    salaryRangeMin: z.number().min(0, 'Lương tối thiểu không được âm').optional(),
    salaryRangeMax: z.number().min(0, 'Lương tối đa không được âm').optional(),
    showSalary: z.boolean(),
    location: z.string().max(200, 'Tối đa 200 ký tự').optional(),
    remoteOption: z.enum(['No-Remote', 'Hybrid', 'Remote']).optional(),
    applicationDeadline: z.string().refine(val => {
        if (!val) return true
        return new Date(val).getTime() > new Date().getTime()
    }, 'Hạn nộp hồ sơ phải trong tương lai').optional().or(z.literal('')),
}).superRefine((data, ctx) => {
    if (data.salaryRangeMin !== undefined && data.salaryRangeMax !== undefined) {
        if (data.salaryRangeMax < data.salaryRangeMin) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu',
                path: ['salaryRangeMax']
            })
        }
    }
})

type FormValues = z.infer<typeof formSchema>

export function JobPostingEditForm({ postingId }: { postingId: string }) {
    const router = useRouter()
    const { toast } = useToast()
    const { mutate: globalMutate } = useSWRConfig()

    const { data: posting, isLoading, error } = useJobPosting(postingId)
    const { trigger: updateJob, isMutating: isUpdating } = useUpdateJobPosting(postingId)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            jobTitle: '',
            employmentType: '',
            experienceLevel: '',
            educationLevel: '',
            quantity: 1,
            description: '',
            requirements: '',
            benefits: '',
            salaryRangeMin: 0,
            salaryRangeMax: 0,
            showSalary: false,
            location: '',
            remoteOption: undefined,
            applicationDeadline: '',
        }
    })

    useEffect(() => {
        if (posting) {
            const remoteOpt = posting.remoteOption
            form.reset({
                jobTitle: posting.jobTitle || '',
                employmentType: posting.employmentType || '',
                experienceLevel: posting.experienceLevel 
                    ? posting.experienceLevel.replace(/-?\s*years?/gi, '').trim() 
                    : '',
                educationLevel: posting.educationLevel || '',
                quantity: posting.quantity || 1,
                description: posting.description || '',
                requirements: posting.requirements || '',
                benefits: posting.benefits || '',
                salaryRangeMin: posting.salaryRangeMin || 0,
                salaryRangeMax: posting.salaryRangeMax || 0,
                showSalary: posting.showSalary || false,
                location: posting.location || '',
                remoteOption: (remoteOpt === 'No-Remote' || remoteOpt === 'Hybrid' || remoteOpt === 'Remote')
                    ? remoteOpt
                    : undefined,
                applicationDeadline: posting.applicationDeadline
                    ? new Date(posting.applicationDeadline).toISOString().slice(0, 10)
                    : '',
            })
            setTimeout(() => {
                form.setValue('employmentType', posting.employmentType || '', { shouldDirty: false })
                form.setValue('educationLevel', posting.educationLevel || '', { shouldDirty: false })
            }, 50)
        }
    }, [posting, form])

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (form.formState.isDirty) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [form.formState.isDirty])

    const handleCancel = () => {
        if (form.formState.isDirty) {
            if (window.confirm('Bạn có thay đổi chưa lưu. Trở về trang trước?')) {
                router.back()
            }
        } else {
            router.back()
        }
    }

    const onSubmit = async (data: FormValues) => {
        if (!posting) return
        try {
            const s = posting.status
            const dirty = form.formState.dirtyFields

            // Chỉ gửi các trường được phép chỉnh sửa theo trạng thái VÀ đã thực sự thay đổi
            const payload: UpdateJobPostingDto = { id: postingId }

            if (isFieldEditable('jobTitle', s) && dirty.jobTitle && data.jobTitle)
                payload.jobTitle = data.jobTitle
            if (isFieldEditable('employmentType', s) && dirty.employmentType && data.employmentType)
                payload.employmentType = data.employmentType
            if (isFieldEditable('experienceLevel', s) && dirty.experienceLevel && data.experienceLevel)
                payload.experienceLevel = data.experienceLevel
            if (isFieldEditable('educationLevel', s) && dirty.educationLevel && data.educationLevel)
                payload.educationLevel = data.educationLevel
            if (isFieldEditable('quantity', s) && dirty.quantity && data.quantity)
                payload.quantity = data.quantity
            if (isFieldEditable('description', s) && dirty.description && data.description)
                payload.description = data.description
            if (isFieldEditable('requirements', s) && dirty.requirements && data.requirements)
                payload.requirements = data.requirements
            if (isFieldEditable('benefits', s) && dirty.benefits && data.benefits)
                payload.benefits = data.benefits
            if (isFieldEditable('salaryRangeMin', s) && dirty.salaryRangeMin)
                payload.salaryRangeMin = data.salaryRangeMin
            if (isFieldEditable('salaryRangeMax', s) && dirty.salaryRangeMax)
                payload.salaryRangeMax = data.salaryRangeMax
            if (isFieldEditable('showSalary', s) && dirty.showSalary !== undefined)
                payload.showSalary = data.showSalary
            if (isFieldEditable('location', s) && dirty.location && data.location)
                payload.location = data.location
            if (isFieldEditable('remoteOption', s) && dirty.remoteOption && data.remoteOption)
                payload.remoteOption = data.remoteOption
            if (isFieldEditable('applicationDeadline', s) && dirty.applicationDeadline && data.applicationDeadline)
                payload.applicationDeadline = new Date(data.applicationDeadline).toISOString()

            await updateJob(payload)

            // Làm mới cache danh sách sau khi cập nhật thành công
            await globalMutate(
                (key) => Array.isArray(key) && key[0] === '/api/job-postings',
                undefined,
                { revalidate: true }
            )

            toast({ title: 'Cập nhật thành công', variant: 'default' })
            router.push('/enterprise/hr/job-postings')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
            toast({ title: 'Lỗi cập nhật', description: message, variant: 'destructive' })
        }
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[200px] w-full" />
            </div>
        )
    }

    if (error || !posting) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center text-red-500">
                Không tải được dữ liệu bài đăng tuyển dụng.
            </div>
        )
    }

    const renderEditableField = <TName extends Path<FormValues>>(
        name: TName,
        label: string,
        component: React.ReactElement<{
            disabled?: boolean;
            onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | boolean) => void;
            value?: string | number | readonly string[] | boolean | undefined;
            checked?: boolean;
        }>,
        type?: string
    ) => {
        const editable = isFieldEditable(name, posting.status)
        return (
            <FormField
                control={form.control}
                name={name}
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>{label}</FormLabel>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className={!editable ? 'opacity-60 cursor-not-allowed' : ''}>
                                        <FormControl>
                                            {React.cloneElement(component, {
                                                ...field,
                                                disabled: !editable || isUpdating,
                                                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | boolean) => {
                                                    if (type === 'number' && typeof e !== 'boolean') {
                                                        field.onChange((e as React.ChangeEvent<HTMLInputElement>).target.valueAsNumber || 0)
                                                    } else {
                                                        field.onChange(e)
                                                    }
                                                },
                                                checked: type === 'boolean' ? !!field.value : undefined
                                            })}
                                        </FormControl>
                                    </div>
                                </TooltipTrigger>
                                {!editable && (
                                    <TooltipContent>
                                        Trường này không thể chỉnh sửa khi trạng thái bài đăng là {posting.status}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    }

    const renderCurrencyField = <TName extends Path<FormValues>>(
        name: TName,
        label: string,
        placeholder?: string,
    ) => {
        const editable = isFieldEditable(name, posting.status)
        return (
            <FormField
                control={form.control}
                name={name}
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>{label}</FormLabel>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className={!editable ? 'opacity-60 cursor-not-allowed' : ''}>
                                        <FormControl>
                                            <CurrencyInput
                                                value={typeof field.value === 'number' ? field.value : undefined}
                                                onChange={(v) => field.onChange(v ?? 0)}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                ref={field.ref}
                                                disabled={!editable || isUpdating}
                                                placeholder={placeholder}
                                            />
                                        </FormControl>
                                    </div>
                                </TooltipTrigger>
                                {!editable && (
                                    <TooltipContent>
                                        Trường này không thể chỉnh sửa khi trạng thái bài đăng là {posting.status}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 pb-24">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                </Button>
                <h1 className="text-2xl font-bold">Chỉnh sửa: {posting.jobTitle}</h1>
                <StatusBadge status={posting.status} />
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 mb-4">Thông tin cơ bản</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderEditableField('jobTitle', 'Chức danh', <Input />)}

                            <FormField
                                control={form.control}
                                name="employmentType"
                                render={({ field }) => {
                                    const editable = isFieldEditable('employmentType', posting.status)
                                    return (
                                        <FormItem>
                                            <FormLabel>Loại công việc</FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className={(!editable || isUpdating) ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}>
                                                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Chọn loại công việc" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {field.value && !["Full-time", "Part-time", "Contract", "Internship", "Freelance"].includes(field.value) && (
                                                                        <SelectItem value={field.value}>{field.value}</SelectItem>
                                                                    )}
                                                                    <SelectItem value="Full-time">Toàn thời gian</SelectItem>
                                                                    <SelectItem value="Part-time">Bán thời gian</SelectItem>
                                                                    <SelectItem value="Internship">Thực tập</SelectItem>
                                                                    <SelectItem value="Contract">Hợp đồng</SelectItem>
                                                                    <SelectItem value="Freelance">Freelance</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </TooltipTrigger>
                                                    {!editable && (
                                                        <TooltipContent>
                                                            Trường này không thể chỉnh sửa khi trạng thái bài đăng là {posting.status}
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />

                            {renderEditableField('experienceLevel', 'Cấp bậc kinh nghiệm', <Input />)}

                            <FormField
                                control={form.control}
                                name="educationLevel"
                                render={({ field }) => {
                                    const editable = isFieldEditable('educationLevel', posting.status)
                                    return (
                                        <FormItem>
                                            <FormLabel>Học vấn yêu cầu</FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className={(!editable || isUpdating) ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}>
                                                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Chọn học vấn" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {field.value && !["Không yêu cầu", "Đại học", "Cao đẳng", "Thạc sĩ", "Khác", "DaiHoc", "CaoDang", "ThacSi"].includes(field.value) && (
                                                                        <SelectItem value={field.value}>{field.value}</SelectItem>
                                                                    )}
                                                                    <SelectItem value="Không yêu cầu">Không yêu cầu</SelectItem>
                                                                    <SelectItem value="Đại học">Đại học</SelectItem>
                                                                    <SelectItem value="DaiHoc">Đại học (DaiHoc)</SelectItem>
                                                                    <SelectItem value="Cao đẳng">Cao đẳng</SelectItem>
                                                                    <SelectItem value="CaoDang">Cao đẳng (CaoDang)</SelectItem>
                                                                    <SelectItem value="Thạc sĩ">Thạc sĩ</SelectItem>
                                                                    <SelectItem value="ThacSi">Thạc sĩ (ThacSi)</SelectItem>
                                                                    <SelectItem value="Khác">Khác</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </TooltipTrigger>
                                                    {!editable && (
                                                        <TooltipContent>
                                                            Trường này không thể chỉnh sửa khi trạng thái bài đăng là {posting.status}
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                            {renderEditableField('quantity', 'Số lượng tuyển', <Input type="number" min={1} />, 'number')}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 mb-4">Nội dung công việc</h2>
                        {renderEditableField('description', 'Mô tả công việc', <Textarea rows={6} />)}
                        {renderEditableField('requirements', 'Yêu cầu ứng viên', <Textarea rows={6} />)}
                        {renderEditableField('benefits', 'Quyền lợi', <Textarea rows={6} />)}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 mb-4">Lương & Địa điểm</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderCurrencyField('salaryRangeMin', 'Lương tối thiểu (VNĐ)', 'VD: 15.000.000')}
                            {renderCurrencyField('salaryRangeMax', 'Lương tối đa (VNĐ)', 'VD: 30.000.000')}

                            <FormField
                                control={form.control}
                                name="showSalary"
                                render={({ field }) => {
                                    const editable = isFieldEditable('showSalary', posting.status)
                                    return (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel>Hiển thị mức lương</FormLabel>
                                                <FormDescription>
                                                    Hiển thị công khai mức lương với ứng viên.
                                                </FormDescription>
                                            </div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className={(!editable || isUpdating) ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}>
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                    </TooltipTrigger>
                                                    {!editable && (
                                                        <TooltipContent>
                                                            Trường này không thể chỉnh sửa khi trạng thái bài đăng là {posting.status}
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                        </FormItem>
                                    )
                                }}
                            />

                            {renderEditableField('location', 'Địa điểm', <Input />)}

                            <FormField
                                control={form.control}
                                name="remoteOption"
                                render={({ field }) => {
                                    const editable = isFieldEditable('remoteOption', posting.status)
                                    return (
                                        <FormItem>
                                            <FormLabel>Hình thức làm việc</FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className={(!editable || isUpdating) ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}>
                                                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Chọn hình thức" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="No-Remote">Tại văn phòng</SelectItem>
                                                                    <SelectItem value="Hybrid">Linh hoạt (Hybrid)</SelectItem>
                                                                    <SelectItem value="Remote">Từ xa (Remote)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </TooltipTrigger>
                                                    {!editable && (
                                                        <TooltipContent>
                                                            Trường này không thể chỉnh sửa khi trạng thái bài đăng là {posting.status}
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />

                            {renderEditableField('applicationDeadline', 'Hạn nộp hồ sơ (để trống nếu vô thời hạn)', <Input type="date" />)}
                        </div>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-3 shadow-lg z-10">
                        <div className="max-w-4xl w-full mx-auto flex justify-end gap-3">
                            <Button variant="outline" type="button" onClick={handleCancel} disabled={isUpdating}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={!form.formState.isDirty || isUpdating} className="min-w-[120px]">
                                {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
} 
