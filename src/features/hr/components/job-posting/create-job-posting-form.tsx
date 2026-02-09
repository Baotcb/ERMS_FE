'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'

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

import { useCreateJobPosting } from '../../hooks/use-job-postings'

// Mock Plan Selection for now - In real app, use SWR to fetch Approved Plans
// and then Plan Details
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

    // TODO: Add Plan Selection logic here
    // For now, we assume user manually enters or we mock the planDetailId input

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Tạo bài đăng tuyển dụng</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin chung</CardTitle>
                        <CardDescription>Điền thông tin cơ bản cho vị trí tuyển dụng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form id="create-job-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="planDetailId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mã chi tiết kế hoạch (PlanDetailId)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter PlanDetail UUID" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Tạm thời nhập ID của PlanDetail đã duyệt. Sẽ cập nhật selector sau.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="jobTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tiêu đề công việc</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Frontend Developer" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Số lượng</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
                                                <FormLabel>Loại hình</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn loại hình" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Full-time">Toàn thời gian</SelectItem>
                                                        <SelectItem value="Part-time">Bán thời gian</SelectItem>
                                                        <SelectItem value="Internship">Thực tập</SelectItem>
                                                        <SelectItem value="Contract">Hợp đồng</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="salaryRangeMin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lương tối thiểu</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
                                                <FormLabel>Lương tối đa</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Hiển thị mức lương
                                                </FormLabel>
                                                <FormDescription>
                                                    Hiển thị mức lương công khai cho ứng viên
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mô tả công việc</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Mô tả chi tiết..." className="h-32" {...field} />
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
                                            <FormLabel>Yêu cầu</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Yêu cầu kỹ năng..." className="h-32" {...field} />
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
                                            <FormLabel>Hạn nộp hồ sơ</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={isMutating} className="w-full">
                                    {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Tạo bài đăng
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* Helper or Preview could go here */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hướng dẫn</CardTitle>
                            <CardDescription>
                                Vui lòng chọn chi tiết kế hoạch đã được duyệt để tạo bài đăng.
                                Thông tin sẽ được tự động điền từ kế hoạch.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    )
}
