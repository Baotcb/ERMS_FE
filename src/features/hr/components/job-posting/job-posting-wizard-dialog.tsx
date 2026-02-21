'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Briefcase,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    FileText,
    Loader2,
    MapPin,
    Sparkles,
    Target,
    Info
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useCreateJobPosting } from '../../hooks/use-job-postings'
import { cn } from '@/lib/utils'

// Data types (aligned with CreateJobPostingForm)
const jobPostingSchema = z.object({
    jobTitle: z.string().min(1, 'Tiêu đề bắt buộc'),
    jobCode: z.string().optional(),
    description: z.string().min(10, 'Mô tả quá ngắn (tối thiểu 10 ký tự)'),
    requirements: z.string().optional(),
    benefits: z.string().optional(),
    employmentType: z.string().min(1, 'Chọn loại hình làm việc'),
    experienceLevel: z.string().optional(),
    educationLevel: z.string().optional(),
    salaryRangeMin: z.number().min(0).optional(),
    salaryRangeMax: z.number().min(0).optional(),
    showSalary: z.boolean(),
    location: z.string().optional(),
    remoteOption: z.string().optional(),
    quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
    applicationDeadline: z.string().optional(),
    planDetailId: z.string().min(1, 'Phải chọn chi tiết kế hoạch'),
})

export type JobPostingFormValues = z.infer<typeof jobPostingSchema>

const STEPS = [
    { id: 1, title: 'Thông tin cơ bản', icon: Target, description: 'Vị trí, số lượng & hạn nộp' },
    { id: 2, title: 'Chi tiết công việc', icon: FileText, description: 'Mô tả & Yêu cầu' },
    { id: 3, title: 'Lương & Phúc lợi', icon: DollarSign, description: 'Mức lương & Đãi ngộ' },
    { id: 4, title: 'Xem lại', icon: CheckCircle2, description: 'Xác nhận thông tin' },
]

interface JobPostingWizardDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: Partial<JobPostingFormValues>
    hidePlanDetailId?: boolean
}

export function JobPostingWizardDialog({
    open,
    onOpenChange,
    initialData,
    hidePlanDetailId = false,
}: JobPostingWizardDialogProps) {
    const { toast } = useToast()
    const { trigger: createJob, isMutating } = useCreateJobPosting()
    const [step, setStep] = useState(1)
    const [direction, setDirection] = useState(0) // -1 for back, 1 for forward

    // Extract form data from initialData (remove non-form fields like hidePlanDetailId)
    const getFormData = (data?: Partial<JobPostingFormValues> & { hidePlanDetailId?: boolean }) => {
        if (!data) return {}
        const { hidePlanDetailId, ...formData } = data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _ = hidePlanDetailId
        return formData
    }

    const form = useForm<JobPostingFormValues>({
        resolver: zodResolver(jobPostingSchema),
        defaultValues: {
            showSalary: true,
            quantity: 1,
            employmentType: 'Full-time',
            location: 'Hà Nội',
            experienceLevel: 'Không yêu cầu',
            salaryRangeMin: 0,
            salaryRangeMax: 0,
            ...getFormData(initialData)
        },
    })

    // Reset form when initialData changes or dialog opens
    useEffect(() => {
        if (open && initialData) {
            console.log('🔄 Resetting form with initialData:', initialData)
            const formData = getFormData(initialData)
            console.log('📋 Form data (without hidePlanDetailId):', formData)

            form.reset({
                showSalary: true,
                quantity: 1,
                employmentType: 'Full-time',
                location: 'Hà Nội',
                experienceLevel: 'Không yêu cầu',
                salaryRangeMin: 0,
                salaryRangeMax: 0,
                ...formData
            })
            // Fix setState in effect warning by deferring execution
            setTimeout(() => setStep(1), 0)
        }
    }, [open, initialData, form])

    const validateStep = async (currentStep: number) => {
        let fieldsToValidate: (keyof JobPostingFormValues)[] = []

        switch (currentStep) {
            case 1:
                fieldsToValidate = ['jobTitle', 'quantity', 'location', 'applicationDeadline', 'employmentType']
                // Only validate planDetailId if it's visible (not hidden)
                if (!hidePlanDetailId) {
                    fieldsToValidate.push('planDetailId')
                }
                break
            case 2:
                fieldsToValidate = ['description', 'requirements']
                break
            case 3:
                fieldsToValidate = ['salaryRangeMin', 'salaryRangeMax']
                break
            default:
                return true
        }

        const result = await form.trigger(fieldsToValidate)
        return result
    }

    const nextStep = async () => {
        const isValid = await validateStep(step)
        if (isValid) {
            setDirection(1)
            setStep((prev) => Math.min(prev + 1, STEPS.length))
        }
    }

    const prevStep = () => {
        setDirection(-1)
        setStep((prev) => Math.max(prev - 1, 1))
    }

    const onSubmit = async (data: JobPostingFormValues) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payload: any = {
                planDetailId: data.planDetailId,
                titleOverride: data.jobTitle,
                descriptionOverride: data.description,
                requirementsOverride: data.requirements, // Map to backend RequirementsOverride
                benefits: data.benefits,
                location: data.location,
                remoteOption: data.remoteOption,
                applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline).toISOString() : new Date().toISOString(), // Fallback to now if empty, although validation should catch it
            }

            console.log('📤 Submitting job posting:', payload)
            console.log('📋 planDetailId:', payload.planDetailId)

            await createJob(payload)
            toast({
                title: 'Thành công!',
                description: 'Đã tạo bài đăng tuyển dụng mới.',
            })
            onOpenChange(false)
        } catch (error) {
            console.error('❌ Error creating job posting:', error)
            const errorMessage = error instanceof Error ? error.message : 'Không thể tạo bài đăng. Vui lòng thử lại.'
            toast({
                title: 'Lỗi',
                description: errorMessage,
                variant: 'destructive',
            })
        }
    }

    // Animation variants
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 20 : -20,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 20 : -20,
            opacity: 0,
        }),
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-xl">
                {/* Header Section with Gradient */}
                {/* Fixed height to prevent layout shift */}
                <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-600 p-8 text-white relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles className="w-48 h-48 text-white" />
                    </div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                    <DialogHeader className="relative z-10 flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-3xl font-bold flex items-center gap-3 tracking-tight">
                                <span className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                    <Briefcase className="w-6 h-6" />
                                </span>
                                Tạo Tin Tuyển Dụng
                            </DialogTitle>
                            <DialogDescription className="text-blue-100 mt-2 text-base font-medium">
                                Quy trình 4 bước chuẩn hóa để đăng tin hiệu quả
                            </DialogDescription>
                        </div>
                        {/* Step Counter */}
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-sm font-semibold">
                            Bước <span className="text-white text-lg">{step}</span> / {STEPS.length}
                        </div>
                    </DialogHeader>

                    {/* Enhanced Progress Steps */}
                    <div className="flex items-center justify-between mt-10 relative z-10 px-6">
                        {STEPS.map((s, idx) => {
                            const isCompleted = step > s.id
                            const isCurrent = step === s.id

                            return (
                                <div key={s.id} className="flex flex-col items-center gap-3 relative z-10 w-full group cursor-default">
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-lg",
                                            isCompleted ? "bg-white text-blue-600 border-white scale-100" :
                                                isCurrent ? "bg-indigo-500 text-white border-white ring-4 ring-white/20 scale-110" :
                                                    "bg-blue-800/40 text-blue-200 border-blue-400/30 scale-90"
                                        )}
                                    >
                                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                                    </div>
                                    <div className="text-center transition-all duration-300 transform">
                                        <div className={cn(
                                            "text-xs font-bold uppercase tracking-wider mb-1",
                                            isCurrent ? "text-white translate-y-0" : "text-blue-200/80"
                                        )}>
                                            {s.title}
                                        </div>
                                    </div>

                                    {/* Connector Line */}
                                    {idx < STEPS.length - 1 && (
                                        <div className="absolute top-6 left-1/2 w-full h-[3px] -z-10 bg-blue-900/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-white transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                                style={{ width: step > s.id ? '100%' : '0%' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Body Content */}
                <div className="h-[520px] bg-slate-50/80 flex flex-col">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
                            {/* Scrollable Area */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={step}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                                        className="h-full max-w-3xl mx-auto"
                                    >
                                        {/* STEP 1: BASIC INFO */}
                                        {step === 1 && (
                                            <div className="space-y-6">
                                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                            <Target className="w-5 h-5" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-slate-800">Thông tin chung</h3>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-6">
                                                        {!hidePlanDetailId && (
                                                            <FormField
                                                                control={form.control}
                                                                name="planDetailId"
                                                                render={({ field }) => (
                                                                    <FormItem className="col-span-2">
                                                                        <FormLabel className="text-slate-700">Mã Kế Hoạch Tuyển Dụng</FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative group">
                                                                                <Input {...field} readOnly className="bg-slate-50 font-mono text-slate-500 border-slate-200 focus-visible:ring-0 pl-10 transition-colors group-hover:bg-slate-100/50" />
                                                                                <div className="absolute left-3 top-2.5 text-slate-400">#</div>
                                                                                <CheckCircle2 className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}

                                                        <FormField
                                                            control={form.control}
                                                            name="jobTitle"
                                                            render={({ field }) => (
                                                                <FormItem className="col-span-2">
                                                                    <FormLabel className="text-slate-700">Tiêu đề tin tuyển dụng <span className="text-red-500">*</span></FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="VD: Senior React Developer" className="text-lg font-medium shadow-sm transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="quantity"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-slate-700">Số lượng</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" min={1} className="transition-all focus:ring-2 focus:ring-indigo-100" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="applicationDeadline"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-slate-700">Hạn nộp hồ sơ</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="date" className="transition-all focus:ring-2 focus:ring-indigo-100" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="employmentType"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-slate-700">Hình thức làm việc</FormLabel>
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="transition-all focus:ring-2 focus:ring-indigo-100">
                                                                                <SelectValue placeholder="Chọn hình thức" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="Full-time">Toàn thời gian</SelectItem>
                                                                            <SelectItem value="Part-time">Bán thời gian</SelectItem>
                                                                            <SelectItem value="Internship">Thực tập</SelectItem>
                                                                            <SelectItem value="Contract">Hợp đồng</SelectItem>
                                                                            <SelectItem value="Freelance">Freelance</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="location"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-slate-700">Địa điểm</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative group">
                                                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                                            <Input className="pl-9 transition-all focus:ring-2 focus:ring-indigo-100" placeholder="VD: Hà Nội" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 2: DETAILS */}
                                        {step === 2 && (
                                            <div className="space-y-6">
                                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-slate-800">Chi tiết công việc</h3>
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name="description"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-slate-700">Mô tả công việc <span className="text-red-500">*</span></FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Liệt kê các trách nhiệm chính..."
                                                                        className="min-h-[150px] resize-y shadow-sm transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="requirements"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-slate-700">Yêu cầu ứng viên</FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Kỹ năng, kinh nghiệm, học vấn..."
                                                                        className="min-h-[120px] shadow-sm transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="benefits"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-slate-700">Quyền lợi & Phúc lợi (Tùy chọn)</FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Bảo hiểm, thưởng, du lịch..."
                                                                        className="min-h-[80px] transition-all focus:ring-2 focus:ring-indigo-100"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 3: SALARY */}
                                        {step === 3 && (
                                            <div className="space-y-6">
                                                <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-10 opacity-5">
                                                        <DollarSign className="w-32 h-32" />
                                                    </div>
                                                    <div className="p-3 bg-green-100 rounded-full mb-4">
                                                        <DollarSign className="w-8 h-8 text-green-600" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-green-900">Thiết lập mức lương</h3>
                                                    <p className="text-green-700 text-sm text-center max-w-sm mt-2 opacity-90">
                                                        Công khai mức lương giúp tăng <span className="font-bold">40%</span> lượng ứng viên nộp hồ sơ.
                                                    </p>
                                                </div>

                                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="salaryRangeMin"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-slate-700">Lương tối thiểu (VNĐ)</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" className="font-mono text-lg transition-all focus:ring-2 focus:ring-green-100 focus:border-green-400" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="salaryRangeMax"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-slate-700">Lương tối đa (VNĐ)</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" className="font-mono text-lg transition-all focus:ring-2 focus:ring-green-100 focus:border-green-400" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name="showSalary"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-slate-200 p-4 shadow-sm bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                        className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none select-none">
                                                                    <FormLabel className="font-semibold text-slate-800 cursor-pointer">
                                                                        Hiển thị mức lương công khai
                                                                    </FormLabel>
                                                                    <FormDescription className="text-slate-500">
                                                                        Nếu bỏ chọn, tin tuyển dụng sẽ hiển thị &quot;Thỏa thuận&quot;.
                                                                    </FormDescription>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 4: REVIEW */}
                                        {step === 4 && (
                                            <div className="space-y-6">
                                                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-slate-800">Xác nhận thông tin</h3>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                                                        <div>
                                                            <span className="text-slate-500 block mb-1">Vị trí tuyển dụng</span>
                                                            <span className="font-semibold text-slate-900 text-lg">{form.getValues('jobTitle')}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 block mb-1">Mã kế hoạch</span>
                                                            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">{form.getValues('planDetailId') || 'N/A'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 block mb-1">Số lượng</span>
                                                            <span className="font-medium text-slate-800">{form.getValues('quantity')} nhân sự</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 block mb-1">Hình thức</span>
                                                            <span className="font-medium text-slate-800">{form.getValues('employmentType')}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 block mb-1">Địa điểm</span>
                                                            <span className="font-medium text-slate-800 flex items-center gap-1"><MapPin className="w-3 h-3" /> {form.getValues('location')}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 block mb-1">Hạn nộp</span>
                                                            <span className="font-medium text-slate-800">{form.getValues('applicationDeadline')}</span>
                                                        </div>
                                                        <div className="col-span-2 p-4 bg-green-50 rounded-lg border border-green-100">
                                                            <span className="text-green-700 block mb-1 text-xs uppercase font-bold tracking-wider">Mức lương</span>
                                                            <span className="font-bold text-green-700 text-xl">
                                                                {form.getValues('showSalary')
                                                                    ? `${form.getValues('salaryRangeMin')?.toLocaleString()} - ${form.getValues('salaryRangeMax')?.toLocaleString()} VNĐ`
                                                                    : 'Thỏa thuận'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-slate-100">
                                                        <span className="text-slate-500 block mb-2 font-medium">Mô tả tóm tắt</span>
                                                        <div className="bg-slate-50 p-4 rounded-lg text-slate-600 text-sm italic border-l-4 border-slate-300">
                                                            &quot;{form.getValues('description')}&quot;
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4 p-4 bg-blue-50/50 border border-blue-100 text-blue-800 rounded-xl text-sm">
                                                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                                                    <div>
                                                        <p className="font-semibold text-blue-900">Lưu ý trước khi đăng</p>
                                                        <p className="text-blue-700/80 mt-1">
                                                            Tin tuyển dụng sẽ được hiển thị ngay lập tức trên trang tuyển dụng của doanh nghiệp.
                                                            Bạn có thể chỉnh sửa hoặc đóng tin bất cứ lúc nào trong trang quản lý.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Footer Actions - Sticky Bottom */}
                            <div className="flex justify-between items-center p-6 bg-white border-t border-slate-200 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={step === 1 ? () => onOpenChange(false) : prevStep}
                                    className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium"
                                >
                                    {step === 1 ? 'Hủy bỏ' : (
                                        <>
                                            <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                                        </>
                                    )}
                                </Button>

                                <div className="flex gap-3">
                                    {step < STEPS.length ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] hover:shadow-lg"
                                        >
                                            Tiếp tục <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={async () => {
                                                console.log('🔘 Submit button clicked')
                                                console.log('📝 Current form values:', form.getValues())
                                                console.log('❌ Form errors:', form.formState.errors)

                                                const isValid = await form.trigger()
                                                console.log('✅ Form valid?', isValid)

                                                if (isValid) {
                                                    form.handleSubmit(onSubmit)()
                                                } else {
                                                    console.log('⚠️ Form validation failed')
                                                }
                                            }}
                                            disabled={isMutating}
                                            className="bg-green-600 hover:bg-green-700 text-white min-w-[160px] shadow-lg shadow-green-200 transition-all hover:scale-[1.02] hover:shadow-xl font-bold"
                                        >
                                            {isMutating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                            Đăng Tin Ngay
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
