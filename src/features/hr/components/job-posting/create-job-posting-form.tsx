'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Info, Plus, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

import { useCreateJobPosting } from '../../hooks/use-job-postings'

const jobPostingSchema = z.object({
    jobTitle: z.string().min(1, 'Tiêu đề bắt buộc'),
    jobCode: z.string().optional(),
    description: z.string().min(10, 'Mô tả quá ngắn'),
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

type JobPostingFormValues = z.infer<typeof jobPostingSchema>

export function CreateJobPostingForm() {
    const router = useRouter()
    const { toast } = useToast()

    // Hooks
    const { trigger: createJob, isMutating } = useCreateJobPosting()

    // Form
    const form = useForm<JobPostingFormValues>({
        resolver: zodResolver(jobPostingSchema),
        defaultValues: {
            showSalary: true,
            quantity: 1,
            employmentType: 'Full-time',
            location: 'Hà Nội', // Default location
            experienceLevel: 'Không yêu cầu',
        },
    })

    const onSubmit = async (data: JobPostingFormValues) => {
        try {
            await createJob({
                ...data,
                applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline).toISOString() : undefined,
            })
            toast({ title: 'Tạo bài đăng tuyển dụng thành công' })
            router.push('/enterprise/hr/job-postings')
        } catch {
            toast({
                title: 'Lỗi',
                description: 'Không thể tạo bài đăng tuyển dụng',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="hover:bg-slate-100">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại danh sách
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tạo tin tuyển dụng mới</h1>
                        <p className="text-sm text-slate-500">Điền thông tin chi tiết để đăng tuyển vị trí mới</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Form {...form}>
                        <form id="create-job-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* Section 1: Basic Information */}
                            <Card className="shadow-sm border-slate-200 overflow-hidden">
                                <div className="border-l-4 border-brand-primary h-full absolute left-0 top-0 bottom-0"></div>
                                <CardHeader className="bg-slate-50/50 border-b pb-4 relative">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">1</div>
                                        <CardTitle className="text-lg text-slate-800">Thông tin cơ bản</CardTitle>
                                    </div>
                                    <CardDescription>Tiêu đề, số lượng và thông tin kế hoạch</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="planDetailId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 text-slate-700">
                                                    Mã chi tiết kế hoạch (Plan Detail) <span className="text-red-500">*</span>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="h-4 w-4 text-slate-400 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Nhập ID của chi tiết kế hoạch tuyển dụng đã được duyệt</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input placeholder="Nhập PlanDetail UUID..." {...field} className="font-mono text-sm bg-slate-50" />
                                                    </FormControl>
                                                    <Button type="button" variant="outline" size="icon" title="Chọn từ danh sách (Coming soon)">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="jobTitle"
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel className="text-slate-700">Tiêu đề công việc <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="VD: Senior Frontend Developer" {...field} className="text-lg font-medium" />
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
                                                    <FormLabel className="text-slate-700">Số lượng tuyển</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min={1} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
                                                            <SelectTrigger>
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
                                                    <FormLabel className="text-slate-700">Địa điểm làm việc</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="VD: Hà Nội, TP.HCM..." {...field} />
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
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section 2: Salary & Benefits */}
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="bg-slate-50/50 border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-bold text-xs">2</div>
                                        <CardTitle className="text-lg text-slate-800">Lương thưởng & Phúc lợi</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="salaryRangeMin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700">Lương tối thiểu (VNĐ)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            {...field}
                                                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                        />
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
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            {...field}
                                                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                        />
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
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-slate-50">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="cursor-pointer font-medium text-slate-700">
                                                        Hiển thị mức lương công khai
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Nếu tắt, ứng viên sẽ thấy &quot;Thỏa thuận&quot; thay vì con số cụ thể.
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Section 3: Job Description */}
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="bg-slate-50/50 border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-xs">3</div>
                                        <CardTitle className="text-lg text-slate-800">Chi tiết công việc</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700">Mô tả công việc <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Mô tả chi tiết trách nhiệm, công việc hàng ngày..." className="min-h-[150px] resize-y" {...field} />
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
                                                    <Textarea placeholder="Yêu cầu về kỹ năng, kinh nghiệm, học vấn..." className="min-h-[120px]" {...field} />
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
                                                <FormLabel className="text-slate-700">Quyền lợi được hưởng</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Bảo hiểm, thưởng, nghỉ mát..." className="min-h-[100px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-4 pt-4 pb-12">
                                <Button type="button" variant="outline" onClick={() => router.back()} className="px-8">
                                    Hủy bỏ
                                </Button>
                                <Button type="submit" disabled={isMutating} className="bg-brand-primary min-w-[150px] px-8 hover:bg-brand-primary/90">
                                    {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Đăng tuyển dụng
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

                {/* Sidebar Guide */}
                <div className="space-y-6 sticky top-6 h-fit">
                    <Card className="bg-blue-50/50 border-blue-100 shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-blue-900 text-base flex items-center gap-2">
                                <Info className="h-4 w-4" /> Hướng dẫn nhanh
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-blue-800 space-y-4">
                            <div>
                                <strong className="block mb-1">📝 Tiêu đề thu hút</strong>
                                <span className="text-blue-700/80">Ngắn gọn, rõ ràng, chứa từ khóa chính (VD: &quot;Senior Java Developer&quot; thay vì &quot;Tuyển lập trình viên&quot;).</span>
                            </div>
                            <div>
                                <strong className="block mb-1">🎯 Mô tả chi tiết</strong>
                                <span className="text-blue-700/80">Nêu rõ trách nhiệm và vai trò. Ứng viên thích sự rõ ràng.</span>
                            </div>
                            <div>
                                <strong className="block mb-1">💰 Công khai mức lương</strong>
                                <span className="text-blue-700/80">Tin tuyển dụng có lương công khai thu hút lượng ứng viên cao hơn 40%.</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-800">Trạng thái kế hoạch</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                <span>Vui lòng đảm bảo chi tiết kế hoạch (Plan Detail) đã được duyệt (Approved) trước khi tạo.</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
