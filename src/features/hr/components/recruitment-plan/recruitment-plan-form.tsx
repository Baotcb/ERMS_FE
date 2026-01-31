'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

import type { RecruitmentPlan } from '../../types/recruitment-plan-types'
import { createRecruitmentPlan, updateRecruitmentPlan } from '../../api/recruitment-plan-service'

// Schema
const planSchema = z.object({
    planName: z.string().min(1, 'Tên kế hoạch là bắt buộc'),
    planCode: z.string().min(1, 'Mã kế hoạch là bắt buộc'),
    description: z.string().optional(),
    startDate: z.date({ message: 'Ngày bắt đầu là bắt buộc' }),
    endDate: z.date({ message: 'Ngày kết thúc là bắt buộc' }),
    totalBudget: z.coerce.number().min(0, 'Ngân sách không được âm').default(0),
}).refine(data => data.endDate >= data.startDate, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"]
})

type PlanFormValues = z.infer<typeof planSchema>

interface RecruitmentPlanFormProps {
    plan?: RecruitmentPlan | null
    onSuccess?: () => void
    onCancel?: () => void
}

export function RecruitmentPlanForm({
    plan,
    onSuccess,
    onCancel
}: RecruitmentPlanFormProps) {
    const { toast } = useToast()
    const isEdit = !!plan

    const form = useForm<PlanFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(planSchema) as any,
        defaultValues: {
            planName: '',
            planCode: '',
            description: '',
            totalBudget: 0,
        }
    })

    // Reset form when plan changes
    useEffect(() => {
        form.reset({
            planName: plan?.planName || '',
            planCode: plan?.planCode || '',
            description: plan?.description || '',
            startDate: plan ? new Date(plan.startDate) : undefined,
            endDate: plan ? new Date(plan.endDate) : undefined,
            totalBudget: plan?.totalBudget || 0,
        })
    }, [plan, form])

    async function onSubmit(data: PlanFormValues) {
        try {
            const payload = {
                ...data,
                startDate: data.startDate.toISOString(),
                endDate: data.endDate.toISOString(),
            }

            if (isEdit && plan) {
                await updateRecruitmentPlan(plan.id, { ...payload, id: plan.id })
                toast({
                    title: 'Thành công',
                    description: 'Cập nhật kế hoạch thành công',
                })
            } else {
                await createRecruitmentPlan(payload)
                toast({
                    title: 'Thành công',
                    description: 'Tạo kế hoạch mới thành công',
                })
            }

            onSuccess?.()
        } catch (error) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
            toast({
                variant: 'destructive',
                title: 'Thất bại',
                description: errorMessage || (isEdit ? 'Cập nhật thất bại' : 'Tạo mới thất bại'),
            })
        }
    }

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="planName"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Tên kế hoạch <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="VD: Kế hoạch tuyển dụng Q1/2024" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="planCode"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Mã kế hoạch <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="VD: RP-2024-01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="startDate"
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            render={({ field }: { field: any }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Ngày bắt đầu <span className="text-red-500">*</span></FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Chọn ngày</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endDate"
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            render={({ field }: { field: any }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Ngày kết thúc <span className="text-red-500">*</span></FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Chọn ngày</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="totalBudget"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Ngân sách dự kiến</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        render={({ field }: { field: any }) => (
                            <FormItem>
                                <FormLabel>Mô tả</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Mô tả chi tiết..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
